import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { RoomsView } from './components/RoomsView';
import { RoomActiveView } from './components/RoomActiveView';
import { GamesView } from './components/GamesView';
import { PrivateChatView } from './components/PrivateChatView';
import { ProfileView } from './components/ProfileView';
import { LuxuryGiftModal } from './components/LuxuryGiftModal';
import { FullscreenGiftOverlay } from './components/FullscreenGiftOverlay';
import { WalletModal } from './components/WalletModal';
import { VipUpgradeModal } from './components/VipUpgradeModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { NotificationsModal } from './components/NotificationsModal';
import { OnlineUsersModal } from './components/OnlineUsersModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MusicRadioModal } from './components/MusicRadioModal';
import { FriendRequestsModal } from './components/FriendRequestsModal';
import { AdminControlPanelModal } from './components/AdminControlPanelModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { PrivateRoomPromptModal } from './components/PrivateRoomPromptModal';

import { User, Room, Message, GiftItem, VipTier, SpeakerSeat, RadioStation, FriendRequest, DailyMission } from './types/chat';
import { CURRENT_USER, INITIAL_ROOMS, RADIO_STATIONS, getOrCreateUser, isUserAdminOrOwner } from './data/seedData';
import { sounds } from './utils/soundEffects';
import { realtimeSocket } from './services/realtimeSocket';
import { 
  subscribeToRoomMessages, 
  sendFirestoreMessage, 
  subscribeToRoomPresence, 
  subscribeToGlobalPresence,
  subscribeToFriendRequests,
  subscribeToUserProfile,
  syncUserProfileToFirebase,
  awardBadgeToUser,
  sendRoomJoinRequest
} from './services/firebase';

export default function App() {
  // 1. Core User State: Guaranteed Unique Per-Device User
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return getOrCreateUser();
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('arab_chat_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  // Real-time messages for active room from Firestore
  const [activeRoomMessages, setActiveRoomMessages] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('rooms');

  // Real-time Presence
  const [roomActiveUsers, setRoomActiveUsers] = useState<User[]>([]);
  const [roomActiveCount, setRoomActiveCount] = useState<number>(1);
  const [globalOnlineUsers, setGlobalOnlineUsers] = useState<User[]>([currentUser]);

  // Friend Requests State
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>([]);
  const [isFriendRequestsOpen, setIsFriendRequestsOpen] = useState(false);

  // Modals State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isVipOpen, setIsVipOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [createRoomType, setCreateRoomType] = useState<'voice' | 'text_only'>('voice');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(false);
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  // Radio Player State
  const [activeRadioStation, setActiveRadioStation] = useState<RadioStation | null>(RADIO_STATIONS[0]);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);

  // Fullscreen Celebratory Gift Overlay
  const [activeFullscreenGift, setActiveFullscreenGift] = useState<{
    gift: GiftItem;
    senderName: string;
    recipientName: string;
  } | null>(null);

  // Currency & Language
  const [currency, setCurrency] = useState<'EGP' | 'USD' | 'SAR' | 'AED'>('EGP');
  const [language, setLanguage] = useState<'ar' | 'en' | 'fr'>('ar');

  // Private Room Access State (Requirement 7)
  const [isPrivatePromptOpen, setIsPrivatePromptOpen] = useState(false);
  const [privatePromptRoom, setPrivatePromptRoom] = useState<Room | null>(null);

  // Anti-duplicate message tracking (Requirement 3)
  const isSendingMessageRef = useRef<boolean>(false);
  const lastMessagePayloadRef = useRef<{ content: string; time: number }>({ content: '', time: 0 });

  // Daily Missions State
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('arab_chat_daily_missions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'send_5_messages',
        title: 'إرسال 5 رسائل في الشات',
        description: 'شارك وتفاعل بالرسائل في أي غرفة أو مجلس',
        icon: '💬',
        rewardCoins: 50,
        currentProgress: 0,
        targetProgress: 5,
        isCompleted: false,
        isClaimed: false
      },
      {
        id: 'join_voice_room',
        title: 'دخول مجلس صوتي والتفاعل',
        description: 'ادخل أي غرفة صوتية واستمع للمتحدثين أو شارك بالحديث',
        icon: '🎙️',
        rewardCoins: 75,
        currentProgress: 0,
        targetProgress: 1,
        isCompleted: false,
        isClaimed: false
      },
      {
        id: 'send_gift',
        title: 'إرسال هدية مميزة',
        description: 'أرسل هدية لأحد المتحدثين أو مضيف المجلس لإشعال الأجواء',
        icon: '🎁',
        rewardCoins: 100,
        currentProgress: 0,
        targetProgress: 1,
        isCompleted: false,
        isClaimed: false
      },
      {
        id: 'update_profile',
        title: 'تحديث الصورة والملف الشخصي',
        description: 'قم بتغيير صورتك الرمزية أو تحديث النبذة التعريفية',
        icon: '✨',
        rewardCoins: 50,
        currentProgress: 0,
        targetProgress: 1,
        isCompleted: false,
        isClaimed: false
      }
    ];
  });

  // Daily Mission progress updater
  const updateMissionProgress = (missionId: string, incrementValue: number = 1) => {
    setDailyMissions(prev => {
      const updated = prev.map(m => {
        if (m.id === missionId && !m.isCompleted) {
          const nextVal = Math.min(m.targetProgress, m.currentProgress + incrementValue);
          return {
            ...m,
            currentProgress: nextVal,
            isCompleted: nextVal >= m.targetProgress
          };
        }
        return m;
      });
      localStorage.setItem('arab_chat_daily_missions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClaimMissionReward = (missionId: string) => {
    setDailyMissions(prev => {
      const target = prev.find(m => m.id === missionId);
      if (!target || target.isClaimed || !target.isCompleted) return prev;

      const updated = prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m);
      localStorage.setItem('arab_chat_daily_missions', JSON.stringify(updated));

      const newCoins = currentUser.coins + target.rewardCoins;
      const updatedUser = { ...currentUser, coins: newCoins };
      setCurrentUser(updatedUser);
      syncUserProfileToFirebase(updatedUser);

      return updated;
    });
  };

  const handleRequestJoinPrivateRoom = async (roomId: string): Promise<boolean> => {
    await sendRoomJoinRequest(roomId, currentUser);
    return true;
  };

  // Persist User Changes & Sync to Firebase
  useEffect(() => {
    localStorage.setItem('arab_chat_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Subscribe to real-time User Profile updates from Firebase Realtime Database
  useEffect(() => {
    const unsub = subscribeToUserProfile(currentUser.id, (profileUpdate) => {
      setCurrentUser(prev => ({
        ...prev,
        ...profileUpdate
      }));
    });
    return () => unsub();
  }, [currentUser.id]);

  // 1. Initialize Real-Time WebSocket Connection across all devices
  useEffect(() => {
    realtimeSocket.connect(currentUser);

    // Listen to global presence updates (real connected users)
    const unsubGlobal = realtimeSocket.subscribeToGlobalPresence((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setGlobalOnlineUsers(liveUsers);
      }
    });

    // Listen to admin actions (instant VIP, ban, mute, coins)
    const unsubAdmin = realtimeSocket.subscribeToAdminEvents((targetUserId, updates) => {
      if (targetUserId === currentUser.id) {
        setCurrentUser(prev => ({ ...prev, ...updates }));
      }
      setGlobalOnlineUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, ...updates } : u));
    });

    // Listen to friend requests in real-time
    const unsubFriend = realtimeSocket.subscribeToFriendRequests((req) => {
      if (req.receiverId === currentUser.id) {
        setPendingFriendRequests(prev => [req, ...prev]);
        sounds.playMessageReceived();
      }
    });

    return () => {
      unsubGlobal();
      unsubAdmin();
      unsubFriend();
    };
  }, [currentUser.id]);

  // Subscribe to real-time User Profile updates from Firebase Realtime Database
  useEffect(() => {
    const unsub = subscribeToUserProfile(currentUser.id, (profileUpdate) => {
      setCurrentUser(prev => ({
        ...prev,
        ...profileUpdate
      }));
    });
    return () => unsub();
  }, [currentUser.id]);

  // Persist Rooms Changes
  useEffect(() => {
    localStorage.setItem('arab_chat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Subscribe to real friend requests
  useEffect(() => {
    const unsub = subscribeToFriendRequests(currentUser.id, (reqs) => {
      setPendingFriendRequests(reqs.filter(r => r.status === 'pending'));
    });
    return () => unsub();
  }, [currentUser.id]);

  // Real-Time Room WebSocket & Firebase synchronization for active room
  useEffect(() => {
    if (!activeRoom) {
      setActiveRoomMessages([]);
      return;
    }

    // Join room on real-time server
    realtimeSocket.joinRoom(activeRoom.id, currentUser);

    // Subscribe to server-side room presence (real live users)
    const unsubPresence = realtimeSocket.subscribeToPresence(activeRoom.id, (count, occupants) => {
      setRoomActiveCount(count);
      setRoomActiveUsers(occupants);
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, activeUsers: count } : r));
    });

    const isDuplicateMsg = (existing: Message, incoming: Message) => {
      if (existing.id === incoming.id) return true;
      const textA = (existing.content || existing.text || '').trim();
      const textB = (incoming.content || incoming.text || '').trim();
      if (
        existing.senderId === incoming.senderId &&
        textA === textB &&
        textA.length > 0 &&
        Math.abs((existing.timestamp || 0) - (incoming.timestamp || 0)) < 4000
      ) {
        return true;
      }
      return false;
    };

    // Subscribe to server-side messages & history
    const unsubMessages = realtimeSocket.subscribeToRoom(
      activeRoom.id,
      (newMsg) => {
        setActiveRoomMessages(prev => {
          if (prev.some(m => isDuplicateMsg(m, newMsg))) return prev;
          return [...prev, newMsg];
        });
      },
      (history) => {
        if (history && history.length > 0) {
          setActiveRoomMessages(prev => {
            const merged = [...prev];
            for (const h of history) {
              if (!merged.some(e => isDuplicateMsg(e, h))) {
                merged.push(h);
              }
            }
            return merged.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          });
        }
      }
    );

    // Also attach Firebase listener
    const unsubFirebase = subscribeToRoomMessages(activeRoom.id, (msgs) => {
      if (msgs && msgs.length > 0) {
        setActiveRoomMessages(prev => {
          const merged = [...prev];
          for (const m of msgs) {
            if (!merged.some(e => isDuplicateMsg(e, m))) {
              merged.push(m);
            }
          }
          return merged.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        });
      }
    });

    return () => {
      realtimeSocket.leaveRoom(activeRoom.id, currentUser.id);
      unsubPresence();
      unsubMessages();
      unsubFirebase();
    };
  }, [activeRoom?.id, currentUser.id]);

  // Realtime Gift Broadcast Listener
  useEffect(() => {
    const channel = new BroadcastChannel('arab_egypt_chat_bus');
    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'LUXURY_GIFT') {
        const { gift, senderName, recipientName } = payload;
        setActiveFullscreenGift({ gift, senderName, recipientName });
        sounds.playGiftFanfare();
      }
    };
    return () => channel.close();
  }, []);

  // Send Message: Allows smooth consecutive messages without button freeze or artificial delays
  const handleSendMessage = async (msgData: Partial<Message>) => {
    if (!activeRoom) return;

    if (currentUser.isBanned) {
      alert('عفواً، حسابك محظور من قِبل الإدارة ولا يمكنك إرسال الرسائل 🚫');
      return;
    }

    if (currentUser.isMuted) {
      alert('عفواً، تم كتمك بواسطة الإدارة ولا يمكنك المشاركة بالكتابة حالياً 🔇');
      return;
    }

    const content = (msgData.content || msgData.text || '').trim();
    if (!content && !msgData.audioUrl && !msgData.gift) return;

    try {
      sounds.playMessageSent();
      const newMsg: Message = {
        id: msgData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId: activeRoom.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderRole: currentUser.role,
        senderVipBadge: currentUser.vipBadge,
        badges: currentUser.badges || ['عضو نشط'],
        type: msgData.type || 'text',
        content: content,
        text: content,
        gift: msgData.gift,
        replyTo: msgData.replyTo,
        audioDuration: msgData.audioDuration,
        audioUrl: msgData.audioUrl,
        createdAt: Date.now(),
        timestamp: Date.now(),
        status: 'read'
      };

      // Optimistically add to active messages so sender immediately sees their message
      setActiveRoomMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // 1. Broadcast via WebSocket directly to ALL other connected devices in real time
      realtimeSocket.sendMessage(activeRoom.id, newMsg);

      // 2. Also send to Firebase Realtime Database
      sendFirestoreMessage(activeRoom.id, newMsg).catch(err => {
        console.warn("Realtime DB message write notice:", err);
      });

      // 3. Track Daily Mission: "إرسال 5 رسائل"
      updateMissionProgress('send_5_messages', 1);

      // Award "عضو نشط" badge if not yet granted
      if (!currentUser.badges?.includes('عضو نشط')) {
        const updated = await awardBadgeToUser(currentUser.id, 'عضو نشط');
        const updatedUser = { ...currentUser, badges: updated };
        setCurrentUser(updatedUser);
        realtimeSocket.updateProfile(updatedUser);
        syncUserProfileToFirebase(updatedUser);
      }
    } catch (e) {
      console.warn("Send message error:", e);
    }
  };

  // Send Luxury Gift Handler (Admin/Owner bypass: Requirement 2)
  const handleSendGift = async (gift: GiftItem, recipientName: string) => {
    if (!activeRoom) return;

    const isOwner = isUserAdminOrOwner(currentUser);

    // Bypass coin requirement and recharge modal if Owner or Admin
    if (!isOwner && currentUser.coins < gift.cost) {
      alert(`عفواً، رصيد الكوينز غير كافٍ! تحتاج إلى ${gift.cost} كوينز لإرسال هذه الهدية.`);
      setIsGiftModalOpen(false);
      setIsWalletOpen(true);
      return;
    }

    // Deduct coins only if not admin/owner
    const newCoins = isOwner ? currentUser.coins : Math.max(0, currentUser.coins - gift.cost);
    const updatedUser: User = {
      ...currentUser,
      coins: newCoins,
      level: currentUser.level + 1,
      totalGiftsSent: (currentUser.totalGiftsSent || 0) + 1,
      badges: currentUser.badges?.includes('أكثر الهدايا') ? currentUser.badges : [...(currentUser.badges || []), 'أكثر الهدايا']
    };
    setCurrentUser(updatedUser);
    syncUserProfileToFirebase(updatedUser);

    // Track Daily Mission: "إرسال هدية مميزة"
    updateMissionProgress('send_gift', 1);

    // Save Top Gifter badge
    awardBadgeToUser(currentUser.id, 'أكثر الهدايا');

    // Trigger Fullscreen Animation locally
    setActiveFullscreenGift({
      gift,
      senderName: currentUser.name,
      recipientName,
    });
    sounds.playGiftFanfare();

    // Broadcast across tabs/users
    try {
      const channel = new BroadcastChannel('arab_egypt_chat_bus');
      channel.postMessage({
        type: 'LUXURY_GIFT',
        payload: { gift, senderName: currentUser.name, recipientName },
      });
      channel.close();
    } catch {}

    // Save gift message to Firestore
    await sendFirestoreMessage(activeRoom.id, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      badges: updatedUser.badges,
      type: 'gift',
      content: `أرسل هدية ${gift.name} بقيمة ${gift.cost} كوينز!`,
      gift: {
        giftId: gift.id,
        name: gift.name,
        icon: gift.icon,
        cost: gift.cost,
        recipientName,
      }
    });
  };

  // Enter Room Handler with Private Room Protection (Requirement 7)
  const handleSelectRoom = (room: Room) => {
    if (room.isPrivate) {
      const isAllowed = 
        room.ownerId === currentUser.id ||
        room.hostId === currentUser.id ||
        (room.allowedUserIds || []).includes(currentUser.id) ||
        isUserAdminOrOwner(currentUser);

      if (!isAllowed) {
        setPrivatePromptRoom(room);
        setIsPrivatePromptOpen(true);
        return;
      }
    }

    setActiveRoom(room);
    sounds.playMessageReceived();

    // Track Daily Mission: "دخول مجلس صوتي"
    if (room.type === 'voice' || room.roomType === 'voice' || room.isVoiceActive) {
      updateMissionProgress('join_voice_room', 1);
    }
  };

  // Direct Avatar Photo Upload Callback with immediate Firebase & WebSocket sync
  const handleAvatarChanged = (newAvatarUrl: string) => {
    const updated: User = {
      ...currentUser,
      avatar: newAvatarUrl
    };
    setCurrentUser(updated);
    sounds.playCoinsReward();
    realtimeSocket.updateAvatar(currentUser.id, newAvatarUrl);
    syncUserProfileToFirebase(updated);

    // Track Daily Mission: "تحديث الصورة والملف الشخصي"
    updateMissionProgress('update_profile', 1);
  };

  // Create Room Handler
  const handleOpenCreateVoiceRoom = () => {
    setCreateRoomType('voice');
    setIsCreateRoomOpen(true);
  };

  const handleOpenCreateTextRoom = () => {
    setCreateRoomType('text_only');
    setIsCreateRoomOpen(true);
  };

  const handleCreateRoom = (newRoom: Room, cost: number) => {
    if (cost > 0) {
      setCurrentUser(prev => ({
        ...prev,
        coins: Math.max(0, prev.coins - cost)
      }));
    }
    const created: Room = {
      ...newRoom,
      activeUsers: 1,
      visitorsCount: '1',
      ownerId: currentUser.id,
      hostId: currentUser.id
    };
    setRooms([created, ...rooms]);
    handleSelectRoom(created);
  };

  // Update Speakers on Stage
  const handleUpdateSpeakers = (updatedSpeakers: SpeakerSeat[]) => {
    if (!activeRoom) return;
    const updated = { ...activeRoom, speakers: updatedSpeakers };
    setActiveRoom(updated);
    setRooms(rooms.map((r) => (r.id === activeRoom.id ? updated : r)));
  };

  // Upgrade VIP Tier
  const handleUpgradeTier = (tier: VipTier) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: tier.id as any,
      vipBadge: tier.badge,
      coins: prev.coins + tier.coinsBonus,
      frameStyle:
        tier.id === 'vip_diamond'
          ? 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.8)]'
          : 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
    }));
  };

  // Update Balance
  const handleUpdateUserBalance = (newCoins: number, newEarningsEgp: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      coins: newCoins,
      earningsEgp: newEarningsEgp,
      earningsUsd: Number((newEarningsEgp / 47.5).toFixed(2)),
    }));
  };

  // Radio Station Toggle
  const handleToggleRadioStation = (station: RadioStation) => {
    if (activeRadioStation?.id === station.id && isRadioPlaying) {
      setIsRadioPlaying(false);
      sounds.playMicToggle(false);
    } else {
      setActiveRadioStation(station);
      setIsRadioPlaying(true);
      sounds.playMicToggle(true);
    }
  };

  // Host Invite to Mic
  const handleInviteUserToMic = (user: User) => {
    if (activeRoom) {
      alert(`تم إرسال دعوة المايك إلى ${user.name} بنجاح! 🎤`);
    } else {
      alert(`يرجى دخول أي مجلس أولاً لدعوة ${user.name} إلى المايك.`);
    }
  };

  // Open Direct Chat With User
  const handleOpenPrivateChatWith = (user: User) => {
    setSelectedProfileUser(null);
    setIsOnlineUsersOpen(false);
    setCurrentTab('chat');
    setActiveRoom(null);
  };

  // Friend Request Accept / Decline
  const handleAcceptFriendRequest = (req: FriendRequest) => {
    sounds.playCoinsReward();
    setPendingFriendRequests(prev => prev.filter(r => r.id !== req.id));
    alert(`🎉 أصبحت صديقاً مع ${req.senderName} الآن!`);
  };

  const handleDeclineFriendRequest = (reqId: string) => {
    setPendingFriendRequests(prev => prev.filter(r => r.id !== reqId));
  };

  const fontClass =
    currentUser.fontPreference === 'amiri'
      ? 'font-["Amiri"]'
      : currentUser.fontPreference === 'tajawal'
      ? 'font-["Tajawal"]'
      : 'font-["Cairo"]';

  return (
    <div className={`min-h-screen bg-[#080c15] text-slate-100 ${fontClass}`}>
      
      {/* 1. Top Header Bar: Unified compact mobile-responsive header - ONLY shown on main screen, hidden inside active room */}
      {!activeRoom && (
        <Header
          currentUser={currentUser}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenVip={() => setIsVipOpen(true)}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenOnlineUsers={() => setIsOnlineUsersOpen(true)}
          onOpenFriendRequests={() => setIsFriendRequestsOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          pendingFriendRequestsCount={pendingFriendRequests.length}
          onlineUsersCount={globalOnlineUsers.length}
          onOpenRadio={() => setIsRadioModalOpen(true)}
          isRadioPlaying={isRadioPlaying}
          onAvatarChanged={handleAvatarChanged}
        />
      )}

      {/* Banned Alert Banner */}
      {currentUser.isBanned && (
        <div className="bg-red-600/95 text-white px-4 py-2.5 text-center text-xs font-black flex flex-wrap items-center justify-center gap-2 shadow-xl sticky top-0 z-50 animate-in slide-in-from-top">
          <span>🚫 حسابك محظور حالياً من قِبل إدارة شات مصر والعرب (تم تطبيق الحظر عبر Firebase RTDB).</span>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-[11px] font-bold border border-white/20 transition-all"
          >
            فتح لوحة الإدارة لفك الحظر
          </button>
        </div>
      )}

      {/* Muted Alert Banner */}
      {currentUser.isMuted && !currentUser.isBanned && (
        <div className="bg-amber-600/90 text-slate-950 px-4 py-1.5 text-center text-xs font-black flex items-center justify-center gap-2 shadow sticky top-0 z-50">
          <span>🔇 أنت مكتوم حالياً بواسطة الإدارة، يمكنك الاستماع فقط ولا يمكنك إرسال الرسائل.</span>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/40 text-slate-950 text-[10px] underline font-bold"
          >
            إلغاء الكتم من الإدارة
          </button>
        </div>
      )}

      {/* 2. Main View Routing */}
      <main className={activeRoom ? "w-full h-screen overflow-hidden" : "max-w-7xl mx-auto min-h-[calc(100vh-56px)]"}>
        {activeRoom ? (
          <RoomActiveView
            room={{
              ...activeRoom,
              activeUsers: roomActiveCount
            }}
            currentUser={currentUser}
            messages={activeRoomMessages}
            onBack={() => setActiveRoom(null)}
            onSendMessage={handleSendMessage}
            onOpenGiftModal={() => setIsGiftModalOpen(true)}
            onUpdateSpeakers={handleUpdateSpeakers}
            onOpenUserProfile={(u) => setSelectedProfileUser(u)}
            onOpenOnlineUsers={() => setIsOnlineUsersOpen(true)}
          />
        ) : (
          <>
            {currentTab === 'rooms' && (
              <RoomsView
                rooms={rooms}
                onSelectRoom={handleSelectRoom}
                onOpenCreateVoiceRoom={handleOpenCreateVoiceRoom}
                onOpenCreateTextRoom={handleOpenCreateTextRoom}
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenVip={() => setIsVipOpen(true)}
                onOpenMissions={() => setIsDailyMissionsOpen(true)}
                totalActiveUsersCount={globalOnlineUsers.length}
                onOpenOnlineUsers={() => setIsOnlineUsersOpen(true)}
              />
            )}

            {currentTab === 'chat' && (
              <PrivateChatView
                currentUser={currentUser}
                onOpenWallet={() => setIsWalletOpen(true)}
              />
            )}

            {currentTab === 'games' && (
              <GamesView
                currentUser={currentUser}
                onUpdateCoins={(coins) => handleUpdateUserBalance(coins, currentUser.earningsEgp)}
                onOpenWallet={() => setIsWalletOpen(true)}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenVip={() => setIsVipOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Bottom Navigation Bar */}
      {!activeRoom && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          unreadChatsCount={pendingFriendRequests.length}
        />
      )}

      {/* 4. Fullscreen Luxury Gift Overlay */}
      <FullscreenGiftOverlay
        gift={activeFullscreenGift?.gift || null}
        senderName={activeFullscreenGift?.senderName || ''}
        recipientName={activeFullscreenGift?.recipientName || ''}
        onDismiss={() => setActiveFullscreenGift(null)}
      />

      {/* 5. Modals */}
      <LuxuryGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        currentUser={currentUser}
        speakers={activeRoom?.speakers || []}
        onSendGift={handleSendGift}
        onOpenWallet={() => {
          setIsGiftModalOpen(false);
          setIsWalletOpen(true);
        }}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={currentUser}
        onUpdateUserBalance={handleUpdateUserBalance}
        currency={currency}
      />

      <VipUpgradeModal
        isOpen={isVipOpen}
        onClose={() => setIsVipOpen(false)}
        currentUser={currentUser}
        onUpgradeTier={handleUpgradeTier}
        onOpenWallet={() => {
          setIsVipOpen(false);
          setIsWalletOpen(true);
        }}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        currentUser={currentUser}
        onCreateRoom={handleCreateRoom}
        defaultRoomType={createRoomType}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Online Users List Modal with real presence occupants */}
      <OnlineUsersModal
        isOpen={isOnlineUsersOpen}
        onClose={() => setIsOnlineUsersOpen(false)}
        currentUser={currentUser}
        roomTitle={activeRoom?.title}
        roomUsers={roomActiveUsers}
        allActiveUsers={globalOnlineUsers}
        onSelectUserForProfile={(user) => {
          setIsOnlineUsersOpen(false);
          setSelectedProfileUser(user);
        }}
        onInviteToMic={handleInviteUserToMic}
        onOpenPrivateChatWith={handleOpenPrivateChatWith}
      />

      {/* User Profile Card Modal with Friend Request & Earned Badges */}
      <UserProfileModal
        user={selectedProfileUser}
        currentUser={currentUser}
        onClose={() => setSelectedProfileUser(null)}
        onOpenPrivateChatWith={handleOpenPrivateChatWith}
        onSendGiftToUser={(u) => {
          setSelectedProfileUser(null);
          setIsGiftModalOpen(true);
        }}
        onAvatarChanged={handleAvatarChanged}
      />

      {/* Friend Requests Modal */}
      <FriendRequestsModal
        isOpen={isFriendRequestsOpen}
        onClose={() => setIsFriendRequestsOpen(false)}
        requests={pendingFriendRequests}
        onAccept={handleAcceptFriendRequest}
        onDecline={handleDeclineFriendRequest}
      />

      {/* Music & Radio Stations Modal */}
      <MusicRadioModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
        activeStation={activeRadioStation}
        isPlaying={isRadioPlaying}
        onToggleStation={handleToggleRadioStation}
      />

      {/* Admin Control Panel Modal */}
      <AdminControlPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        allUsers={globalOnlineUsers}
        onUserModified={(updated) => {
          realtimeSocket.sendAdminAction(updated.id, updated);
          if (updated.id === currentUser.id) {
            setCurrentUser(prev => ({ ...prev, ...updated }));
          }
          setGlobalOnlineUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        }}
      />

      {/* Daily Missions Modal */}
      <DailyMissionsModal
        isOpen={isDailyMissionsOpen}
        onClose={() => setIsDailyMissionsOpen(false)}
        missions={dailyMissions}
        onClaimReward={handleClaimMissionReward}
        currentUser={currentUser}
      />

      {/* Private Room Locked Prompt Modal (Requirement 7) */}
      <PrivateRoomPromptModal
        isOpen={isPrivatePromptOpen}
        onClose={() => {
          setIsPrivatePromptOpen(false);
          setPrivatePromptRoom(null);
        }}
        room={privatePromptRoom}
        currentUser={currentUser}
        onRequestJoin={handleRequestJoinPrivateRoom}
      />

    </div>
  );
}
