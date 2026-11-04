import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Firestore,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  push, 
  onDisconnect, 
  update,
  get,
  Database,
  query as rtdbQuery,
  limitToLast
} from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { Message, User, FriendRequest } from '../types/chat';
import firebaseConfigJson from '../../firebase-applet-config.json';

// 1. Firebase Configuration from provided user credentials & applet config
export const firebaseConfig = {
  apiKey: "AIzaSyCF7ggMssPflJpnvzF22Ol55BHJbRCIZuY",
  authDomain: "shatmasr-c7e60.firebaseapp.com",
  databaseURL: "https://shatmasr-c7e60-default-rtdb.firebaseio.com",
  projectId: "shatmasr-c7e60",
  storageBucket: "shatmasr-c7e60.firebasestorage.app",
  messagingSenderId: "586338448855",
  appId: "1:586338448855:web:55ead1d48a57e982e3c792",
  measurementId: "G-JDPKPDB084"
};

let app: FirebaseApp;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let auth: Auth | null = null;
let isFirebaseAvailable = false;
let currentAuthUid: string | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const dbId = (firebaseConfigJson as any).firestoreDatabaseId;
  db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  
  try {
    rtdb = getDatabase(app, firebaseConfig.databaseURL);
  } catch (err) {
    console.warn("Realtime Database init notice:", err);
  }
  
  try {
    auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentAuthUid = user.uid;
      }
    });
    signInAnonymously(auth).then((cred) => {
      if (cred && cred.user) {
        currentAuthUid = cred.user.uid;
      }
    }).catch((authErr) => {
      console.warn("Firebase Auth anonymous login notice:", authErr);
    });
  } catch (err) {
    console.warn("Firebase Auth init notice:", err);
  }
  isFirebaseAvailable = true;
} catch (e) {
  console.warn("Firebase initialization notice:", e);
}

// Global window exposure for debugging and integrations
if (typeof window !== 'undefined') {
  (window as any).firebaseDB = rtdb;
  (window as any).firebaseAuth = auth;
  (window as any).firebaseFirestore = db;
}

export { db, rtdb, auth, isFirebaseAvailable, currentAuthUid };

// Validate connection per SKILL instructions
export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Cross-tab broadcast fallback channel for guaranteed zero-latency sync
const liveChatBus = typeof window !== 'undefined' ? new BroadcastChannel('arab_chat_firestore_bus') : null;

// ==========================================
// 1. REALTIME PRESENCE (Realtime Database .info/connected)
// ==========================================
export function subscribeToRoomPresence(
  roomId: string,
  user: User,
  onCountChange: (count: number, activeUsers: User[]) => void
): () => void {
  const presenceKey = `room_presence_${roomId}`;
  
  const registerLocalPresence = () => {
    try {
      const stored = localStorage.getItem(presenceKey);
      const list: User[] = stored ? JSON.parse(stored) : [];
      const updated = list.filter(u => u.id !== user.id);
      updated.push({ ...user, isOnline: true });
      localStorage.setItem(presenceKey, JSON.stringify(updated));
      onCountChange(updated.length, updated);

      liveChatBus?.postMessage({
        type: 'PRESENCE_UPDATE',
        roomId,
        users: updated
      });
    } catch {}
  };

  const removeLocalPresence = () => {
    try {
      const stored = localStorage.getItem(presenceKey);
      if (stored) {
        const list: User[] = JSON.parse(stored);
        const updated = list.filter(u => u.id !== user.id);
        localStorage.setItem(presenceKey, JSON.stringify(updated));
        onCountChange(Math.max(1, updated.length), updated);

        liveChatBus?.postMessage({
          type: 'PRESENCE_UPDATE',
          roomId,
          users: updated
        });
      }
    } catch {}
  };

  let rtdbCleanup: (() => void) | null = null;
  if (rtdb && user.id) {
    try {
      const connectedRef = ref(rtdb, '.info/connected');
      const roomsUserStatusRef = ref(rtdb, `rooms_presence/${roomId}/${user.id}`);
      const occupantsRef = ref(rtdb, `rooms_presence/${roomId}`);
      
      const unsubConnected = onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          const userPayload = {
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
          onDisconnect(roomsUserStatusRef).remove();
          set(roomsUserStatusRef, userPayload);
        }
      });

      const unsubOccupants = onValue(occupantsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersList = Object.values(data) as User[];
          onCountChange(usersList.length, usersList);
        } else {
          onCountChange(1, [user]);
        }
      });

      rtdbCleanup = () => {
        unsubConnected();
        unsubOccupants();
        try {
          set(roomsUserStatusRef, null);
        } catch {}
      };
    } catch (e) {
      console.warn("RTDB presence setup fallback:", e);
    }
  }

  registerLocalPresence();

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'PRESENCE_UPDATE' && event.data.roomId === roomId) {
      const users: User[] = event.data.users || [];
      onCountChange(users.length, users);
    }
  };
  liveChatBus?.addEventListener('message', handleMessage);

  return () => {
    removeLocalPresence();
    liveChatBus?.removeEventListener('message', handleMessage);
    if (rtdbCleanup) rtdbCleanup();
  };
}

// Global Presence Tracker for all online users across the platform
export function subscribeToGlobalPresence(
  user: User,
  onGlobalChange: (users: User[]) => void
): () => void {
  const globalKey = 'arab_chat_global_presence';

  if (rtdb && user.id) {
    try {
      const globalStatusRef = ref(rtdb, `global_presence/${user.id}`);
      const allGlobalRef = ref(rtdb, 'global_presence');
      const connectedRef = ref(rtdb, '.info/connected');

      const unsubConnected = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(globalStatusRef).remove();
          set(globalStatusRef, {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            vipBadge: user.vipBadge,
            isOnline: true,
            lastSeen: Date.now()
          });
        }
      });

      const unsubAll = onValue(allGlobalRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list = Object.values(val) as User[];
          onGlobalChange(list);
        } else {
          onGlobalChange([user]);
        }
      });

      return () => {
        unsubConnected();
        unsubAll();
        try {
          set(globalStatusRef, null);
        } catch {}
      };
    } catch {}
  }

  try {
    const raw = localStorage.getItem(globalKey);
    const list: User[] = raw ? JSON.parse(raw) : [];
    const updated = list.filter(u => u.id !== user.id);
    updated.push({ ...user, isOnline: true });
    localStorage.setItem(globalKey, JSON.stringify(updated));
    onGlobalChange(updated);
  } catch {}

  const handleMsg = (e: MessageEvent) => {
    if (e.data?.type === 'GLOBAL_PRESENCE_UPDATE') {
      onGlobalChange(e.data.users || [user]);
    }
  };
  liveChatBus?.addEventListener('message', handleMsg);

  return () => {
    liveChatBus?.removeEventListener('message', handleMsg);
  };
}

// ==========================================
// 2. REALTIME MESSAGES (Realtime Database & Firestore with UID Path Isolation)
// ==========================================
export function subscribeToRoomMessages(
  roomId: string,
  onMessages: (messages: Message[]) => void
): () => void {
  const localKey = `messages_room_${roomId}`;

  // Priority 1: Realtime Database `messages/${roomId}`
  let rtdbUnsub: (() => void) | null = null;
  if (rtdb) {
    try {
      const messagesRef = rtdbQuery(ref(rtdb, `messages/${roomId}`), limitToLast(120));
      rtdbUnsub = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: Message[] = Object.keys(data).map((key) => {
            const item = data[key];
            return {
              id: key,
              roomId,
              senderId: item.senderId || item.userId || 'usr_guest',
              senderName: item.senderName || item.userName || 'مستخدم',
              senderAvatar: item.senderAvatar || item.userAvatar || '',
              senderRole: item.senderRole || item.userVipTier || 'member',
              senderVipBadge: item.senderVipBadge || item.userVipBadge || '',
              badges: item.badges || [],
              type: item.type || 'text',
              content: item.content || item.text || '',
              text: item.text || item.content || '',
              gift: item.gift,
              replyTo: item.replyTo,
              audioDuration: item.audioDuration,
              createdAt: item.createdAt || item.timestamp || Date.now(),
              timestamp: item.timestamp || item.createdAt || Date.now(),
              status: 'read' as const
            };
          }).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

          localStorage.setItem(localKey, JSON.stringify(list));
          onMessages(list);
          return;
        }
      }, (err) => {
        console.warn("RTDB messages read notice:", err);
      });
    } catch (e) {
      console.warn("RTDB attach listener exception:", e);
    }
  }

  // Priority 2: Firestore collection `rooms/{roomId}/messages`
  let firestoreUnsub: (() => void) | null = null;
  if (db) {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      firestoreUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Message[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              roomId,
              senderId: data.userId || data.senderId,
              senderName: data.userName || data.senderName,
              senderAvatar: data.userAvatar || data.senderAvatar || '',
              senderRole: data.userVipTier || data.senderRole || 'member',
              senderVipBadge: data.userVipBadge || data.senderVipBadge || '',
              badges: data.badges || [],
              type: data.type || 'text',
              content: data.text || data.content || '',
              text: data.text || data.content || '',
              gift: data.gift,
              replyTo: data.replyTo,
              audioDuration: data.audioDuration,
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
              timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.timestamp || Date.now()),
              status: 'read' as const
            });
          });
          localStorage.setItem(localKey, JSON.stringify(list));
          onMessages(list);
        }
      }, () => {});
    } catch {}
  }

  // Priority 3: Fallback local reader + BroadcastChannel
  const getLocalMessages = (): Message[] => {
    try {
      const saved = localStorage.getItem(localKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  onMessages(getLocalMessages());

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'REALTIME_NEW_MESSAGE' && e.data.roomId === roomId) {
      onMessages(getLocalMessages());
    }
  };

  liveChatBus?.addEventListener('message', handleBroadcast);
  return () => {
    if (rtdbUnsub) rtdbUnsub();
    if (firestoreUnsub) firestoreUnsub();
    liveChatBus?.removeEventListener('message', handleBroadcast);
  };
}

// Send Real Message to Firebase (saved both in room and strictly under user's UID path)
export async function sendFirestoreMessage(
  roomId: string,
  message: Partial<Message>
): Promise<Message> {
  const uid = message.senderId || currentAuthUid || 'usr_guest';
  const newMsg: Message = {
    id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    roomId,
    senderId: uid,
    senderName: message.senderName || 'مستخدم',
    senderAvatar: message.senderAvatar || '',
    senderRole: message.senderRole || 'member',
    senderVipBadge: message.senderVipBadge || '',
    badges: message.badges || [],
    type: message.type || 'text',
    content: message.content || message.text || '',
    text: message.content || message.text || '',
    gift: message.gift,
    replyTo: message.replyTo,
    audioDuration: message.audioDuration,
    createdAt: Date.now(),
    timestamp: Date.now(),
    status: 'read'
  };

  // 1. Save to local storage for 0ms instantaneous feedback
  const localKey = `messages_room_${roomId}`;
  try {
    const saved = localStorage.getItem(localKey);
    const list: Message[] = saved ? JSON.parse(saved) : [];
    if (!list.some(m => m.id === newMsg.id)) {
      list.push(newMsg);
      localStorage.setItem(localKey, JSON.stringify(list));
    }
  } catch {}

  // 2. Broadcast across tabs
  liveChatBus?.postMessage({
    type: 'REALTIME_NEW_MESSAGE',
    roomId,
    message: newMsg
  });

  // 3. Save to Firebase Realtime Database
  if (rtdb) {
    try {
      // Room messages list
      const rtdbMsgRef = ref(rtdb, `messages/${roomId}/${newMsg.id}`);
      await set(rtdbMsgRef, {
        ...newMsg,
        userId: uid,
        createdAt: Date.now()
      });

      // User's own message archive under UID path (users/{uid}/messages) for isolation
      const userMsgRef = ref(rtdb, `users/${uid}/messages/${newMsg.id}`);
      await set(userMsgRef, {
        ...newMsg,
        roomId,
        createdAt: Date.now()
      });
    } catch (err) {
      console.warn("RTDB write notice:", err);
    }
  }

  // 4. Save to Firebase Firestore
  if (db) {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        text: newMsg.content,
        userId: uid,
        userName: newMsg.senderName,
        userAvatar: newMsg.senderAvatar,
        userVipTier: newMsg.senderRole,
        userVipBadge: newMsg.senderVipBadge,
        badges: newMsg.badges || [],
        type: newMsg.type,
        gift: newMsg.gift || null,
        replyTo: newMsg.replyTo || null,
        audioDuration: newMsg.audioDuration || null,
        createdAt: serverTimestamp()
      });

      // User's personal message log in Firestore under UID path (users/{uid}/user_messages)
      const userMsgDocRef = doc(db, 'users', uid, 'user_messages', newMsg.id);
      await setDoc(userMsgDocRef, {
        id: newMsg.id,
        roomId,
        text: newMsg.content,
        type: newMsg.type,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore write notice:", err);
    }
  }

  return newMsg;
}

// ==========================================
// 3. USER PROFILE SYNCHRONIZATION (Realtime Database & Firestore under UID path)
// ==========================================

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (user: Partial<User>) => void
): () => void {
  let unsubRtdb: (() => void) | null = null;
  if (rtdb && userId) {
    try {
      const userRef = ref(rtdb, `users/${userId}`);
      unsubRtdb = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          onUpdate(data);
        }
      });
    } catch {}
  }

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'USER_PROFILE_SYNC' && e.data.userId === userId) {
      onUpdate(e.data.user);
    }
  };
  liveChatBus?.addEventListener('message', handleBroadcast);

  return () => {
    if (unsubRtdb) unsubRtdb();
    liveChatBus?.removeEventListener('message', handleBroadcast);
  };
}

// Sync/Save User Profile strictly under UID path `users/{user.id}`
export async function syncUserProfileToFirebase(user: User): Promise<void> {
  const profilePayload = {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    country: user.country,
    countryFlag: user.countryFlag,
    role: user.role,
    vipBadge: user.vipBadge,
    coins: user.coins,
    earningsEgp: user.earningsEgp,
    earningsUsd: user.earningsUsd,
    badges: user.badges || [],
    ratingPoints: user.ratingPoints || 0,
    isBanned: user.isBanned || false,
    isMuted: user.isMuted || false,
    frameStyle: user.frameStyle || '',
    updatedAt: Date.now()
  };

  // 1. Local update
  localStorage.setItem('arab_chat_user', JSON.stringify(user));
  liveChatBus?.postMessage({
    type: 'USER_PROFILE_SYNC',
    userId: user.id,
    user: profilePayload
  });

  // 2. Realtime Database: users/{userId}
  if (rtdb && user.id) {
    try {
      const userRef = ref(rtdb, `users/${user.id}`);
      await update(userRef, profilePayload);
    } catch (e) {
      console.warn("RTDB user profile sync error:", e);
    }
  }

  // 3. Firestore: users/{userId}
  if (db && user.id) {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, profilePayload, { merge: true });
    } catch (e) {
      console.warn("Firestore user profile sync error:", e);
    }
  }
}

// Subscribe to all platform users for Admin Panel & Online List
export function subscribeToAllUsers(
  onUsers: (users: User[]) => void
): () => void {
  if (rtdb) {
    try {
      const usersRef = ref(rtdb, 'users');
      const unsub = onValue(usersRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: User[] = Object.values(val);
          onUsers(list);
        }
      });
      return unsub;
    } catch {}
  }
  return () => {};
}

// ==========================================
// 4. ADMIN CONTROL PANEL ACTIONS
// ==========================================

export async function adminUpdateUser(
  targetUserId: string,
  updates: Partial<User>
): Promise<void> {
  if (rtdb) {
    try {
      const targetRef = ref(rtdb, `users/${targetUserId}`);
      await update(targetRef, updates);
    } catch (e) {
      console.warn("Admin update RTDB notice:", e);
    }
  }

  if (db) {
    try {
      const userDoc = doc(db, 'users', targetUserId);
      await setDoc(userDoc, updates, { merge: true });
    } catch (e) {
      console.warn("Admin update Firestore notice:", e);
    }
  }

  liveChatBus?.postMessage({
    type: 'ADMIN_USER_UPDATED',
    userId: targetUserId,
    updates
  });
}

// ==========================================
// 5. INSTAPAY & MANUAL PAYMENTS INTEGRATION
// ==========================================

export interface InstaPayPaymentOrder {
  orderId: string;
  referenceId: string;
  amountEgp: number;
  coins: number;
  paymentMethod: 'instapay' | 'vodafone_cash' | 'meeza' | 'card';
  mobileNumber?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: number;
}

export type PaymobPaymentOrder = InstaPayPaymentOrder;

export async function executeInstaPayPayment(
  userId: string,
  currentCoins: number,
  coinsToAdd: number,
  priceEgp: number,
  method: 'instapay' | 'vodafone_cash' | 'meeza' | 'card' = 'instapay',
  mobileNumber?: string
): Promise<{ success: boolean; newCoins: number; order: InstaPayPaymentOrder }> {
  const newCoins = currentCoins + coinsToAdd;
  const orderId = `IPA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const referenceId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

  const order: InstaPayPaymentOrder = {
    orderId,
    referenceId,
    amountEgp: priceEgp,
    coins: coinsToAdd,
    paymentMethod: method,
    mobileNumber: mobileNumber || 'samyelsayed9@instapay',
    status: 'SUCCESS',
    createdAt: Date.now()
  };

  if (rtdb) {
    try {
      const userCoinsRef = ref(rtdb, `users/${userId}`);
      await update(userCoinsRef, { coins: newCoins });

      // Transaction saved under user's UID path
      const txRef = ref(rtdb, `users/${userId}/transactions/${orderId}`);
      await set(txRef, order);
    } catch (e) {
      console.warn("RTDB write error:", e);
    }
  }

  if (db) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        coins: increment(coinsToAdd)
      });
      const txDocRef = doc(db, 'users', userId, 'transactions', orderId);
      await setDoc(txDocRef, order);
    } catch (e) {
      console.warn("Firestore write error:", e);
    }
  }

  liveChatBus?.postMessage({
    type: 'INSTAPAY_PAYMENT_SUCCESS',
    userId,
    newCoins,
    order
  });

  return { success: true, newCoins, order };
}

export const executePaymobPayment = executeInstaPayPayment;

export function openPayment(
  amount: number, 
  note: string, 
  customUserId?: string
): Promise<{ success: boolean; url: string; orderId?: string }> {
  const paymentAddress = "samyelsayed9@instapay";
  const userId = customUserId || (auth?.currentUser?.uid) || ("GUEST_" + Math.floor(Math.random() * 100000));
  const paymentUrl = `instapay://pay?pa=${paymentAddress}&am=${amount}&cu=EGP&tn=${encodeURIComponent(note)}`;

  if (rtdb) {
    const pendingRef = ref(rtdb, 'payments_pending');
    return push(pendingRef, {
      userId: userId,
      amount: amount,
      note: note,
      status: "pending",
      timestamp: Date.now()
    }).then((pushed) => {
      if (typeof window !== 'undefined') {
        try {
          window.location.href = paymentUrl;
        } catch {}
      }
      return { success: true, url: paymentUrl, orderId: pushed.key || undefined };
    }).catch(() => {
      if (typeof window !== 'undefined') {
        try {
          window.location.href = paymentUrl;
        } catch {}
      }
      return { success: false, url: paymentUrl };
    });
  } else {
    if (typeof window !== 'undefined') {
      try {
        window.location.href = paymentUrl;
      } catch {}
    }
    return Promise.resolve({ success: true, url: paymentUrl });
  }
}

export interface PendingPaymentOrder {
  id: string;
  userId: string;
  amount: number;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  coins?: number;
}

export function subscribeToPendingPayments(
  callback: (orders: PendingPaymentOrder[]) => void
): () => void {
  if (rtdb) {
    try {
      const pendingRef = ref(rtdb, 'payments_pending');
      const unsub = onValue(pendingRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: PendingPaymentOrder[] = Object.entries(val).map(([key, data]: [string, any]) => ({
            id: key,
            ...data
          }));
          callback(list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        } else {
          callback([]);
        }
      });
      return unsub;
    } catch {}
  }
  return () => {};
}

export async function approvePendingPayment(
  paymentId: string,
  userId: string,
  coinsToAdd: number
): Promise<void> {
  if (rtdb) {
    try {
      const payRef = ref(rtdb, `payments_pending/${paymentId}`);
      await update(payRef, {
        status: 'approved',
        coinsGranted: coinsToAdd,
        approvedAt: Date.now()
      });

      const userRef = ref(rtdb, `users/${userId}`);
      const userSnap = await get(userRef);
      if (userSnap.exists()) {
        const currentData = userSnap.val();
        const currentCoins = currentData.coins || 0;
        await update(userRef, {
          coins: currentCoins + coinsToAdd
        });
      }

      liveChatBus?.postMessage({
        type: 'PAYMENT_APPROVED',
        userId,
        coinsToAdd,
        paymentId
      });
    } catch (e) {
      console.warn("Approve payment error:", e);
    }
  }
}

export async function rejectPendingPayment(paymentId: string): Promise<void> {
  if (rtdb) {
    try {
      const payRef = ref(rtdb, `payments_pending/${paymentId}`);
      await update(payRef, {
        status: 'rejected',
        rejectedAt: Date.now()
      });
    } catch (e) {
      console.warn("Reject payment error:", e);
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).openPayment = openPayment;
}

// ==========================================
// 6. FRIEND REQUESTS & BADGES & RATINGS
// ==========================================

export async function sendFriendRequest(
  sender: User,
  receiverId: string
): Promise<boolean> {
  const req: FriendRequest = {
    id: `freq_${Date.now()}_${sender.id}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    receiverId,
    createdAt: Date.now(),
    status: 'pending'
  };

  try {
    const key = `friend_requests_${receiverId}`;
    const stored = localStorage.getItem(key);
    const list: FriendRequest[] = stored ? JSON.parse(stored) : [];
    if (!list.some(r => r.senderId === sender.id && r.status === 'pending')) {
      list.push(req);
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch {}

  liveChatBus?.postMessage({
    type: 'NEW_FRIEND_REQUEST',
    request: req
  });

  if (rtdb) {
    try {
      const reqRef = ref(rtdb, `friend_requests/${receiverId}/${req.id}`);
      await set(reqRef, req);
    } catch {}
  }

  if (db) {
    try {
      const reqRef = collection(db, 'friendRequests');
      await addDoc(reqRef, req);
    } catch {}
  }

  return true;
}

export function subscribeToFriendRequests(
  userId: string,
  onRequests: (reqs: FriendRequest[]) => void
): () => void {
  const localKey = `friend_requests_${userId}`;

  const loadLocal = () => {
    try {
      const stored = localStorage.getItem(localKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  onRequests(loadLocal());

  let unsubRtdb: (() => void) | null = null;
  if (rtdb) {
    try {
      const reqsRef = ref(rtdb, `friend_requests/${userId}`);
      unsubRtdb = onValue(reqsRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: FriendRequest[] = Object.values(val);
          onRequests(list.filter(r => r.status === 'pending'));
        }
      });
    } catch {}
  }

  const handleMsg = (e: MessageEvent) => {
    if (e.data?.type === 'NEW_FRIEND_REQUEST' && e.data.request.receiverId === userId) {
      onRequests(loadLocal());
    }
  };
  liveChatBus?.addEventListener('message', handleMsg);
  return () => {
    if (unsubRtdb) unsubRtdb();
    liveChatBus?.removeEventListener('message', handleMsg);
  };
}

export async function submitUserRating(
  fromUserId: string,
  toUserId: string,
  points: number
): Promise<number> {
  const userRatingsKey = `user_ratings_${toUserId}`;
  let newTotal = points;
  try {
    const current = Number(localStorage.getItem(userRatingsKey) || '0');
    newTotal = current + points;
    localStorage.setItem(userRatingsKey, newTotal.toString());
  } catch {}

  if (rtdb) {
    try {
      const userRatingRef = ref(rtdb, `users/${toUserId}/ratingPoints`);
      await set(userRatingRef, newTotal);
    } catch {}
  }

  if (db) {
    try {
      const userRef = doc(db, 'users', toUserId);
      await updateDoc(userRef, {
        ratingPoints: increment(points)
      });
    } catch {}
  }

  liveChatBus?.postMessage({
    type: 'USER_RATED',
    toUserId,
    ratingPoints: newTotal
  });

  return newTotal;
}

export async function awardBadgeToUser(
  userId: string,
  badgeTitle: string
): Promise<string[]> {
  const badgesKey = `user_badges_${userId}`;
  let updatedBadges: string[] = [];
  try {
    const existing = localStorage.getItem(badgesKey);
    const list: string[] = existing ? JSON.parse(existing) : [];
    if (!list.includes(badgeTitle)) {
      list.push(badgeTitle);
    }
    updatedBadges = list;
    localStorage.setItem(badgesKey, JSON.stringify(list));
  } catch {}

  if (rtdb) {
    try {
      const userBadgesRef = ref(rtdb, `users/${userId}/badges`);
      await set(userBadgesRef, updatedBadges);
    } catch {}
  }

  if (db) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { badges: updatedBadges }, { merge: true });
    } catch {}
  }

  return updatedBadges;
}

// ==========================================
// 7. PRIVATE ROOM JOIN REQUESTS & ACCESS
// ==========================================

export interface RoomJoinRequest {
  userId: string;
  userName: string;
  userAvatar?: string;
  requestedAt: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export async function sendRoomJoinRequest(roomId: string, user: User): Promise<boolean> {
  const reqPayload: RoomJoinRequest = {
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    requestedAt: Date.now(),
    status: 'pending'
  };

  if (rtdb) {
    try {
      const reqRef = ref(rtdb, `room_join_requests/${roomId}/${user.id}`);
      await set(reqRef, reqPayload);
    } catch (e) {
      console.warn("RTDB join request write notice:", e);
    }
  }

  liveChatBus?.postMessage({
    type: 'ROOM_JOIN_REQUEST',
    roomId,
    request: reqPayload
  });

  return true;
}

export function subscribeToRoomJoinRequests(
  roomId: string,
  onRequests: (reqs: RoomJoinRequest[]) => void
): () => void {
  if (rtdb) {
    try {
      const requestsRef = ref(rtdb, `room_join_requests/${roomId}`);
      const unsub = onValue(requestsRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: RoomJoinRequest[] = Object.values(val);
          onRequests(list.filter(r => r.status === 'pending'));
        } else {
          onRequests([]);
        }
      });
      return unsub;
    } catch {}
  }
  return () => {};
}

export async function resolveRoomJoinRequest(
  roomId: string,
  userId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  if (rtdb) {
    try {
      const reqRef = ref(rtdb, `room_join_requests/${roomId}/${userId}`);
      if (status === 'accepted') {
        await update(reqRef, { status: 'accepted' });
        const allowedRef = ref(rtdb, `rooms_allowed/${roomId}/${userId}`);
        await set(allowedRef, true);
      } else {
        await set(reqRef, null);
      }
    } catch (e) {
      console.warn("RTDB resolve request notice:", e);
    }
  }

  liveChatBus?.postMessage({
    type: 'ROOM_JOIN_RESOLVED',
    roomId,
    userId,
    status
  });
}
