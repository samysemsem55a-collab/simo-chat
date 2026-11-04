import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Authoritative Real-Time Data Store
interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  senderVipBadge: string;
  badges?: string[];
  type: string;
  content: string;
  text?: string;
  gift?: any;
  replyTo?: any;
  audioDuration?: number;
  createdAt: number;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

interface RoomOccupant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  vipBadge: string;
  isOnline: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
  joinedAt: number;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  vipBadge: string;
  coins: number;
  earningsEgp: number;
  badges: string[];
  isBanned?: boolean;
  isMuted?: boolean;
}

// Stores
const messagesByRoom: Map<string, ChatMessage[]> = new Map();
const roomOccupants: Map<string, Map<string, RoomOccupant>> = new Map();
const usersStore: Map<string, UserProfile> = new Map();
const socketToUser: Map<WebSocket, { userId: string; roomId?: string }> = new Map();

// Initialize default rooms
const DEFAULT_ROOMS = ['room_general', 'room_egypt', 'room_text_chat', 'room_tarab', 'room_youth', 'room_gaming'];
DEFAULT_ROOMS.forEach(roomId => {
  messagesByRoom.set(roomId, []);
  roomOccupants.set(roomId, new Map());
});

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      const info = socketToUser.get(client);
      if (info && info.roomId === roomId) {
        client.send(data);
      }
    }
  });
}

function broadcastToAll(message: any, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function getRoomOccupantsList(roomId: string): RoomOccupant[] {
  const occMap = roomOccupants.get(roomId);
  return occMap ? Array.from(occMap.values()) : [];
}

function getGlobalOnlineUsers(): RoomOccupant[] {
  const allUsersMap = new Map<string, RoomOccupant>();
  roomOccupants.forEach((occupants) => {
    occupants.forEach((user, id) => {
      allUsersMap.set(id, user);
    });
  });
  return Array.from(allUsersMap.values());
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Client connected. Total clients:', wss.clients.size);

  ws.on('message', (raw) => {
    try {
      const action = JSON.parse(raw.toString());
      const { type, payload } = action;

      switch (type) {
        case 'USER_REGISTER': {
          const user: UserProfile = payload.user;
          if (user && user.id) {
            usersStore.set(user.id, {
              ...usersStore.get(user.id),
              ...user
            });
            socketToUser.set(ws, { userId: user.id });
          }
          break;
        }

        case 'JOIN_ROOM': {
          const { roomId, user } = payload;
          if (!roomId || !user) return;

          let occMap = roomOccupants.get(roomId);
          if (!occMap) {
            occMap = new Map();
            roomOccupants.set(roomId, occMap);
          }

          // Register occupant
          const occupant: RoomOccupant = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            vipBadge: user.vipBadge,
            isOnline: true,
            isBanned: user.isBanned || false,
            isMuted: user.isMuted || false,
            joinedAt: Date.now()
          };
          occMap.set(user.id, occupant);

          socketToUser.set(ws, { userId: user.id, roomId });

          // Send existing room history to newly joined client
          const history = messagesByRoom.get(roomId) || [];
          ws.send(JSON.stringify({
            type: 'ROOM_HISTORY',
            roomId,
            messages: history
          }));

          // Broadcast updated presence to all clients in room
          const occupantsList = Array.from(occMap.values());
          broadcastToRoom(roomId, {
            type: 'PRESENCE_UPDATE',
            roomId,
            count: occupantsList.length,
            users: occupantsList
          });

          // Broadcast global presence
          broadcastToAll({
            type: 'GLOBAL_PRESENCE_UPDATE',
            users: getGlobalOnlineUsers()
          });

          console.log(`[Join] User ${user.name} (${user.id}) joined ${roomId}. Room count: ${occupantsList.length}`);
          break;
        }

        case 'LEAVE_ROOM': {
          const { roomId, userId } = payload;
          if (roomId && userId) {
            const occMap = roomOccupants.get(roomId);
            if (occMap && occMap.has(userId)) {
              occMap.delete(userId);
              const list = Array.from(occMap.values());
              broadcastToRoom(roomId, {
                type: 'PRESENCE_UPDATE',
                roomId,
                count: list.length,
                users: list
              });
              broadcastToAll({
                type: 'GLOBAL_PRESENCE_UPDATE',
                users: getGlobalOnlineUsers()
              });
            }
          }
          break;
        }

        case 'SEND_MESSAGE': {
          const { roomId, message } = payload;
          if (!roomId || !message) return;

          // Check if user is banned or muted in server state
          const existingUser = usersStore.get(message.senderId);
          if (existingUser?.isBanned || existingUser?.isMuted) {
            ws.send(JSON.stringify({
              type: 'MESSAGE_REJECTED',
              reason: existingUser.isBanned ? 'حسابك محظور' : 'أنت مكتوم بواسطة الإدارة'
            }));
            return;
          }

          let roomMsgs = messagesByRoom.get(roomId);
          if (!roomMsgs) {
            roomMsgs = [];
            messagesByRoom.set(roomId, roomMsgs);
          }

          const completeMsg: ChatMessage = {
            id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            roomId,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            senderRole: message.senderRole,
            senderVipBadge: message.senderVipBadge,
            badges: message.badges || [],
            type: message.type || 'text',
            content: message.content || message.text || '',
            text: message.text || message.content || '',
            gift: message.gift,
            replyTo: message.replyTo,
            audioDuration: message.audioDuration,
            createdAt: message.createdAt || Date.now(),
            timestamp: message.timestamp || Date.now(),
            status: 'read'
          };

          roomMsgs.push(completeMsg);
          if (roomMsgs.length > 200) roomMsgs.shift(); // keep last 200

          // Broadcast to everyone in that room (including sender for confirmation)
          broadcastToRoom(roomId, {
            type: 'NEW_MESSAGE',
            roomId,
            message: completeMsg
          });

          console.log(`[Message] ${completeMsg.senderName} in ${roomId}: ${completeMsg.content.substring(0, 30)}`);
          break;
        }

        case 'UPDATE_PROFILE': {
          const user: UserProfile = payload.user;
          if (user && user.id) {
            usersStore.set(user.id, {
              ...usersStore.get(user.id),
              ...user
            });

            // Update in room occupants
            roomOccupants.forEach((occupants) => {
              if (occupants.has(user.id)) {
                const prev = occupants.get(user.id)!;
                occupants.set(user.id, {
                  ...prev,
                  name: user.name || prev.name,
                  avatar: user.avatar || prev.avatar,
                  role: user.role || prev.role,
                  vipBadge: user.vipBadge || prev.vipBadge
                });
              }
            });

            broadcastToAll({
              type: 'USER_PROFILE_UPDATED',
              userId: user.id,
              user
            });

            broadcastToAll({
              type: 'GLOBAL_PRESENCE_UPDATE',
              users: getGlobalOnlineUsers()
            });
          }
          break;
        }

        case 'UPDATE_AVATAR': {
          const { userId, avatar } = payload;
          if (userId && avatar) {
            const user = usersStore.get(userId);
            if (user) {
              user.avatar = avatar;
              usersStore.set(userId, user);
            }

            roomOccupants.forEach((occupants, roomId) => {
              if (occupants.has(userId)) {
                const prev = occupants.get(userId)!;
                prev.avatar = avatar;
                broadcastToRoom(roomId, {
                  type: 'PRESENCE_UPDATE',
                  roomId,
                  count: occupants.size,
                  users: Array.from(occupants.values())
                });
              }
            });

            broadcastToAll({
              type: 'AVATAR_CHANGED',
              userId,
              avatar
            });
          }
          break;
        }

        case 'ADMIN_ACTION': {
          const { targetUserId, updates } = payload;
          if (targetUserId && updates) {
            const current = usersStore.get(targetUserId) || {
              id: targetUserId,
              name: 'عضو',
              username: 'guest',
              avatar: '',
              role: 'member',
              vipBadge: '',
              coins: 0,
              earningsEgp: 0,
              badges: []
            };

            const updated = { ...current, ...updates };
            usersStore.set(targetUserId, updated);

            // Update in all rooms
            roomOccupants.forEach((occupants, roomId) => {
              if (occupants.has(targetUserId)) {
                const occ = occupants.get(targetUserId)!;
                Object.assign(occ, updates);
                broadcastToRoom(roomId, {
                  type: 'PRESENCE_UPDATE',
                  roomId,
                  count: occupants.size,
                  users: Array.from(occupants.values())
                });
              }
            });

            // Broadcast admin action event to all clients
            broadcastToAll({
              type: 'ADMIN_EVENT',
              targetUserId,
              updates
            });

            console.log(`[Admin Action] Applied updates to ${targetUserId}:`, updates);
          }
          break;
        }

        case 'PAYMOB_CREDIT_COINS': {
          const { userId, coinsToAdd, order } = payload;
          if (userId && coinsToAdd) {
            const current = usersStore.get(userId) || {
              id: userId,
              name: 'عضو',
              username: 'guest',
              avatar: '',
              role: 'member',
              vipBadge: '',
              coins: 0,
              earningsEgp: 0,
              badges: []
            };
            current.coins = (current.coins || 0) + coinsToAdd;
            usersStore.set(userId, current);

            broadcastToAll({
              type: 'USER_PROFILE_UPDATED',
              userId,
              user: current
            });

            ws.send(JSON.stringify({
              type: 'PAYMOB_SUCCESS_ACK',
              newCoins: current.coins,
              order
            }));
          }
          break;
        }

        case 'FRIEND_REQUEST': {
          broadcastToAll({
            type: 'NEW_FRIEND_REQUEST',
            request: payload.request
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.warn('[WebSocket] Error handling client message:', err);
    }
  });

  ws.on('close', () => {
    const info = socketToUser.get(ws);
    if (info) {
      const { userId, roomId } = info;
      if (roomId && userId) {
        const occMap = roomOccupants.get(roomId);
        if (occMap && occMap.has(userId)) {
          occMap.delete(userId);
          const list = Array.from(occMap.values());
          broadcastToRoom(roomId, {
            type: 'PRESENCE_UPDATE',
            roomId,
            count: list.length,
            users: list
          });
        }
      }

      broadcastToAll({
        type: 'GLOBAL_PRESENCE_UPDATE',
        users: getGlobalOnlineUsers()
      });

      socketToUser.delete(ws);
    }
    console.log('[WebSocket] Client disconnected. Total clients:', wss.clients.size);
  });
});

// REST API Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    connectedClients: wss.clients.size,
    totalUsers: usersStore.size,
    activeRooms: messagesByRoom.size,
    timestamp: Date.now()
  });
});

app.get('/api/messages/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const history = messagesByRoom.get(roomId) || [];
  res.json({ roomId, messages: history });
});

app.get('/api/presence/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const occupants = getRoomOccupantsList(roomId);
  res.json({ roomId, count: occupants.length, occupants });
});

app.get('/api/presence', (_req: Request, res: Response) => {
  res.json({ users: getGlobalOnlineUsers() });
});

// Start server with Vite middleware in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Realtime Server listening on http://0.0.0.0:${PORT} (WebSocket at ws://0.0.0.0:${PORT}/ws)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
