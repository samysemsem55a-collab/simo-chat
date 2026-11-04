import { Message, User, FriendRequest } from '../types/chat';

type MessageCallback = (msg: Message) => void;
type HistoryCallback = (messages: Message[]) => void;
type PresenceCallback = (count: number, users: User[]) => void;
type GlobalPresenceCallback = (users: User[]) => void;
type ProfileCallback = (user: Partial<User>) => void;
type AdminEventCallback = (targetUserId: string, updates: Partial<User>) => void;
type FriendReqCallback = (req: FriendRequest) => void;

class RealtimeSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private isConnecting = false;
  private currentRoomId: string | null = null;
  private currentUser: User | null = null;

  // Listeners
  private messageListeners: Map<string, Set<MessageCallback>> = new Map();
  private historyListeners: Map<string, Set<HistoryCallback>> = new Map();
  private presenceListeners: Map<string, Set<PresenceCallback>> = new Map();
  private globalPresenceListeners: Set<GlobalPresenceCallback> = new Set();
  private profileListeners: Map<string, Set<ProfileCallback>> = new Map();
  private adminEventListeners: Set<AdminEventCallback> = new Set();
  private friendReqListeners: Set<FriendReqCallback> = new Set();

  connect(user?: User) {
    if (user) this.currentUser = user;
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log('[RealtimeSocket] Connecting to', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[RealtimeSocket] Connected to real-time server 🚀');
        this.isConnecting = false;

        // Register user
        if (this.currentUser) {
          this.send('USER_REGISTER', { user: this.currentUser });
        }

        // Rejoin room if was in one
        if (this.currentRoomId && this.currentUser) {
          this.send('JOIN_ROOM', { roomId: this.currentRoomId, user: this.currentUser });
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const action = JSON.parse(event.data);
          this.handleIncoming(action);
        } catch (e) {
          console.warn('[RealtimeSocket] Parse error:', e);
        }
      };

      this.socket.onclose = () => {
        console.log('[RealtimeSocket] Connection closed. Reconnecting in 2s...');
        this.socket = null;
        this.isConnecting = false;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 2000);
      };

      this.socket.onerror = (err) => {
        console.warn('[RealtimeSocket] Socket notice:', err);
      };
    } catch (e) {
      console.warn('[RealtimeSocket] Failed to create socket:', e);
      this.isConnecting = false;
    }
  }

  private send(type: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      // Auto connect if not connected
      this.connect();
    }
  }

  private handleIncoming(action: { type: string; [key: string]: any }) {
    const { type } = action;

    switch (type) {
      case 'ROOM_HISTORY': {
        const { roomId, messages } = action;
        const listeners = this.historyListeners.get(roomId);
        if (listeners) {
          listeners.forEach(cb => cb(messages));
        }
        break;
      }

      case 'NEW_MESSAGE': {
        const { roomId, message } = action;
        const listeners = this.messageListeners.get(roomId);
        if (listeners) {
          listeners.forEach(cb => cb(message));
        }
        break;
      }

      case 'PRESENCE_UPDATE': {
        const { roomId, count, users } = action;
        const listeners = this.presenceListeners.get(roomId);
        if (listeners) {
          listeners.forEach(cb => cb(count, users));
        }
        break;
      }

      case 'GLOBAL_PRESENCE_UPDATE': {
        const { users } = action;
        this.globalPresenceListeners.forEach(cb => cb(users));
        break;
      }

      case 'USER_PROFILE_UPDATED': {
        const { userId, user } = action;
        const listeners = this.profileListeners.get(userId);
        if (listeners) {
          listeners.forEach(cb => cb(user));
        }
        break;
      }

      case 'AVATAR_CHANGED': {
        const { userId, avatar } = action;
        const listeners = this.profileListeners.get(userId);
        if (listeners) {
          listeners.forEach(cb => cb({ avatar }));
        }
        break;
      }

      case 'ADMIN_EVENT': {
        const { targetUserId, updates } = action;
        this.adminEventListeners.forEach(cb => cb(targetUserId, updates));
        // Also fire profile listener for target user
        const profListeners = this.profileListeners.get(targetUserId);
        if (profListeners) {
          profListeners.forEach(cb => cb(updates));
        }
        break;
      }

      case 'NEW_FRIEND_REQUEST': {
        const { request } = action;
        this.friendReqListeners.forEach(cb => cb(request));
        break;
      }

      default:
        break;
    }
  }

  // API Methods
  registerUser(user: User) {
    this.currentUser = user;
    this.send('USER_REGISTER', { user });
  }

  joinRoom(roomId: string, user: User) {
    this.currentRoomId = roomId;
    this.currentUser = user;
    this.send('JOIN_ROOM', { roomId, user });
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    this.send('LEAVE_ROOM', { roomId, userId });
  }

  sendMessage(roomId: string, message: Partial<Message>) {
    this.send('SEND_MESSAGE', { roomId, message });
  }

  updateProfile(user: Partial<User> & { id: string }) {
    this.send('UPDATE_PROFILE', { user });
  }

  updateAvatar(userId: string, avatar: string) {
    this.send('UPDATE_AVATAR', { userId, avatar });
  }

  sendAdminAction(targetUserId: string, updates: Partial<User>) {
    this.send('ADMIN_ACTION', { targetUserId, updates });
  }

  creditInstaPayCoins(userId: string, coinsToAdd: number, order: any) {
    this.send('INSTAPAY_CREDIT_COINS', { userId, coinsToAdd, order });
  }

  creditPaymobCoins(userId: string, coinsToAdd: number, order: any) {
    this.creditInstaPayCoins(userId, coinsToAdd, order);
  }

  sendFriendRequest(request: FriendRequest) {
    this.send('FRIEND_REQUEST', { request });
  }

  // Subscription helpers
  subscribeToRoom(
    roomId: string,
    onMessage: MessageCallback,
    onHistory?: HistoryCallback
  ): () => void {
    if (!this.messageListeners.has(roomId)) {
      this.messageListeners.set(roomId, new Set());
    }
    this.messageListeners.get(roomId)!.add(onMessage);

    if (onHistory) {
      if (!this.historyListeners.has(roomId)) {
        this.historyListeners.set(roomId, new Set());
      }
      this.historyListeners.get(roomId)!.add(onHistory);
    }

    return () => {
      this.messageListeners.get(roomId)?.delete(onMessage);
      if (onHistory) {
        this.historyListeners.get(roomId)?.delete(onHistory);
      }
    };
  }

  subscribeToPresence(roomId: string, callback: PresenceCallback): () => void {
    if (!this.presenceListeners.has(roomId)) {
      this.presenceListeners.set(roomId, new Set());
    }
    this.presenceListeners.get(roomId)!.add(callback);

    return () => {
      this.presenceListeners.get(roomId)?.delete(callback);
    };
  }

  subscribeToGlobalPresence(callback: GlobalPresenceCallback): () => void {
    this.globalPresenceListeners.add(callback);
    return () => {
      this.globalPresenceListeners.delete(callback);
    };
  }

  subscribeToUserProfile(userId: string, callback: ProfileCallback): () => void {
    if (!this.profileListeners.has(userId)) {
      this.profileListeners.set(userId, new Set());
    }
    this.profileListeners.get(userId)!.add(callback);

    return () => {
      this.profileListeners.get(userId)?.delete(callback);
    };
  }

  subscribeToAdminEvents(callback: AdminEventCallback): () => void {
    this.adminEventListeners.add(callback);
    return () => {
      this.adminEventListeners.delete(callback);
    };
  }

  subscribeToFriendRequests(callback: FriendReqCallback): () => void {
    this.friendReqListeners.add(callback);
    return () => {
      this.friendReqListeners.delete(callback);
    };
  }
}

export const realtimeSocket = new RealtimeSocketManager();
