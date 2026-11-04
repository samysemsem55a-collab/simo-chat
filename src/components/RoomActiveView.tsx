import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Send, 
  Mic, 
  Gift, 
  Sparkles, 
  Pin, 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  X, 
  VolumeX, 
  BookOpen, 
  Reply, 
  Users, 
  ShieldCheck, 
  Music,
  Smile,
  Heart,
  Flame,
  ThumbsUp,
  MessageSquare,
  Crown
} from 'lucide-react';
import { Room, Message, User, SpeakerSeat } from '../types/chat';
import { JoinRequestsManagerModal } from './JoinRequestsManagerModal';
import { ArabicMusicPlayerModal } from './ArabicMusicPlayerModal';
import { subscribeToRoomJoinRequests, resolveRoomJoinRequest, RoomJoinRequest } from '../services/firebase';
import { sounds } from '../utils/soundEffects';

interface RoomActiveViewProps {
  room: Room;
  currentUser: User;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (msg: Partial<Message>) => void;
  onOpenGiftModal: () => void;
  onUpdateSpeakers: (speakers: SpeakerSeat[]) => void;
  onOpenUserProfile: (user: User) => void;
  onOpenOnlineUsers: () => void;
}

const EMOJI_CATEGORIES = {
  faces: ['😊', '😂', '😍', '❤️', '🔥', '✨', '🌹', '👍', '👏', '🎉', '🥰', '😎', '🤲', '🤍', '👑', '💯', '🙌', '😘', '🤩', '🌸', '☕', '💎', '🕊️', '🌿'],
  flags: ['🇪🇬', '🇸🇦', '🇦🇪', '🇲🇦', '🇮🇶', '🇰🇼', '🇩🇿', '🇸🇾', '🇯🇴', '🇵🇸', '🇱🇧', '🇹🇳', '🇴🇲', '🇧🇭', '🇶🇦', '🇾🇪', '🇸🇩', '🇱🇾', '🕌', '🕋', '📿', '🧿', '🦁', '🦅'],
  fun: ['😂', '🤣', '😭', '🥺', '😡', '😱', '🥳', '🤔', '👀', '💪', '🤝', '👌', '⚡', '🌟', '💥', '🎶', '🎵', '🎤', '🏆', '🥇', '💫', '🎯', '🚀', '⭐']
};

export const WELCOME_PHRASES = [
  "يا هلا والله، نورت المجلس 🌸",
  "أهلاً وسهلاً بيك يا غالي 🇪🇬",
  "مساء الورد والياسمين والفل 🌹",
  "منور الشات يا ابن الأصول ☕",
  "حيّاك الله وبيّاك يا طيب ✨",
  "يا مرحب بيك وسط أهلك وناسك 👑",
  "سلام عليكم ورحمة الله وبركاته 🕊️",
  "شرفتنا وأسعدتنا بطلتك الحلوة 🌟",
  "أحلى مسا على عيون كل الحبايب 💖",
  "يا صباح ومساء الجمال والروقان 💫"
];

export const RoomActiveView: React.FC<RoomActiveViewProps> = ({
  room,
  currentUser,
  messages,
  onBack,
  onSendMessage,
  onOpenGiftModal,
  onUpdateSpeakers,
  onOpenUserProfile,
  onOpenOnlineUsers,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [showTasbeeh, setShowTasbeeh] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Emoji Picker State
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<'faces' | 'flags' | 'fun'>('faces');
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Arabic Music Library Modal State (100 Songs)
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

  // Private Room Join Requests State
  const [isJoinRequestsOpen, setIsJoinRequestsOpen] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<RoomJoinRequest[]>([]);

  // Real Audio MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Moderator & Pin state
  const isModerator = room.ownerId === currentUser.id || room.moderators?.includes(currentUser.id) || currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const [isModeratorPanelOpen, setIsModeratorPanelOpen] = useState(false);
  const [newPinText, setNewPinText] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState<{ id: string; senderName: string; content: string } | null>(
    room.pinnedMessage || (room.pinnedAnnouncement ? { id: 'ann_1', senderName: 'المشرف', content: room.pinnedAnnouncement } : null)
  );
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(room.bannedUserIds || []);

  // Swipe detection ref
  const touchStartXRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 3-Second Auto-Dismiss Welcome Toast State (Fade-in / Slide-up) for ANY user entering
  const [welcomeToast, setWelcomeToast] = useState<{
    user: { name: string; avatar?: string; vipBadge?: string };
    state: 'initial' | 'visible' | 'exiting' | 'hidden';
  }>({
    user: { name: currentUser.name, avatar: currentUser.avatar, vipBadge: currentUser.vipBadge },
    state: 'hidden'
  });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerWelcomeToast = (targetUser: { name: string; avatar?: string; vipBadge?: string }) => {
    // Clear any previous timers
    toastTimeoutRef.current.forEach(t => clearTimeout(t));
    toastTimeoutRef.current = [];

    setWelcomeToast({
      user: targetUser,
      state: 'initial'
    });
    try { sounds.playMessageReceived(); } catch {}

    // 1. Smooth Fade-in & Slide-up animation
    const enterTimer = setTimeout(() => {
      setWelcomeToast(prev => ({ ...prev, state: 'visible' }));
    }, 40);

    // 2. Smooth Slide-up fade-out start before 3s mark
    const exitTimer = setTimeout(() => {
      setWelcomeToast(prev => ({ ...prev, state: 'exiting' }));
    }, 2550);

    // 3. Exactly 3.0 seconds (3000ms) auto-disappearance
    const hideTimer = setTimeout(() => {
      setWelcomeToast(prev => ({ ...prev, state: 'hidden' }));
    }, 3000);

    toastTimeoutRef.current.push(enterTimer, exitTimer, hideTimer);
  };

  // Welcome Toast Lifecycle on room entry for current user (auto-disappears after exactly 3s)
  useEffect(() => {
    triggerWelcomeToast({
      name: currentUser.name,
      avatar: currentUser.avatar,
      vipBadge: currentUser.vipBadge
    });

    return () => {
      toastTimeoutRef.current.forEach(t => clearTimeout(t));
    };
  }, [room.id]);

  // Welcome Toast trigger when ANY other user enters the room via system messages
  const lastProcessedMsgIdRef = useRef<string>('');
  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (latest && latest.id !== lastProcessedMsgIdRef.current) {
      lastProcessedMsgIdRef.current = latest.id;
      if (latest.type === 'system_welcome' && latest.senderName && latest.senderId !== currentUser.id) {
        triggerWelcomeToast({
          name: latest.senderName,
          avatar: latest.senderAvatar,
          vipBadge: latest.senderVipBadge || 'عضو جديد'
        });
      }
    }
  }, [messages.length]);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEmojiPickerOpen]);

  // Deduplicate messages by ID and content fingerprint
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((msg) => {
      const key = msg.id || `${msg.senderId}_${msg.content}_${Math.floor((msg.timestamp || 0) / 3000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [messages]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uniqueMessages.length]);

  // Subscribe to room join requests if private & host
  useEffect(() => {
    if (!room.isPrivate) return;
    const unsub = subscribeToRoomJoinRequests(room.id, (reqs) => {
      setPendingJoinRequests(reqs);
    });
    return () => unsub();
  }, [room.id, room.isPrivate]);

  // Voice recording timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Send Text Message
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    onSendMessage({
      roomId: room.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      badges: currentUser.badges || ['عضو نشط'],
      type: 'text',
      content: text,
      text: text,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        content: replyingTo.content || replyingTo.text || ''
      } : undefined,
      timestamp: Date.now(),
      status: 'read'
    });

    setInputText('');
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Instant Welcoming Phrase Sender (الجمل الترحيبية)
  const handleSendWelcomePhrase = (phrase: string) => {
    if (currentUser.isBanned || currentUser.isMuted) return;
    sounds.playMessageSent();
    onSendMessage({
      roomId: room.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      badges: currentUser.badges || ['عضو نشط'],
      type: 'text',
      content: phrase,
      text: phrase,
      timestamp: Date.now(),
      status: 'read'
    });
  };

  // Toggle audio play
  const togglePlayVoice = (msgId: string, audioUrl?: string, duration?: number) => {
    if (playingVoiceId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setPlayingVoiceId(msgId);
      audio.play().catch(e => {
        console.warn("Audio playback error:", e);
        sounds.playMessageReceived();
      });
      audio.onended = () => {
        setPlayingVoiceId(null);
        audioPlayerRef.current = null;
      };
    } else {
      sounds.playMessageReceived();
      setPlayingVoiceId(msgId);
      setTimeout(() => setPlayingVoiceId(null), (duration || 3) * 1000);
    }
  };

  // Start voice record
  const handleStartVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      sounds.playMicToggle(true);
      setIsRecordingVoice(true);
    } catch (err) {
      console.warn("Mic access notice:", err);
      sounds.playMicToggle(true);
      setIsRecordingVoice(true);
    }
  };

  // Stop voice record & send
  const handleStopVoiceRecordAndSend = () => {
    const recorder = mediaRecorderRef.current;
    const duration = recordingSeconds || 3;

    if (!recorder || recorder.state === 'inactive') {
      sounds.playMessageSent();
      onSendMessage({
        roomId: room.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderRole: currentUser.role,
        senderVipBadge: currentUser.vipBadge,
        badges: currentUser.badges || ['عضو نشط'],
        type: 'voice',
        content: `🎤 رسالة صوتية (0:${duration < 10 ? '0' : ''}${duration})`,
        audioDuration: duration,
        timestamp: Date.now(),
        status: 'read'
      });
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
      return;
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        sounds.playMessageSent();
        onSendMessage({
          roomId: room.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderRole: currentUser.role,
          senderVipBadge: currentUser.vipBadge,
          badges: currentUser.badges || ['عضو نشط'],
          type: 'voice',
          content: `🎤 رسالة صوتية (0:${duration < 10 ? '0' : ''}${duration})`,
          audioUrl: base64Audio,
          audioDuration: duration,
          timestamp: Date.now(),
          status: 'read'
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
    sounds.playMicToggle(false);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleCancelVoiceRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    sounds.playMicToggle(false);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  // Join request handlers for host
  const handleAcceptJoinRequest = async (targetUserId: string) => {
    await resolveRoomJoinRequest(room.id, targetUserId, 'accepted');
    setPendingJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
    onSendMessage({
      roomId: room.id,
      senderId: currentUser.id,
      senderName: 'المضيف',
      senderAvatar: currentUser.avatar,
      senderRole: 'admin',
      senderVipBadge: 'مضيف الغرفة',
      type: 'system_welcome',
      content: `✅ وافق المضيف على انضمام عضو جديد إلى المجلس الخاص.`,
      timestamp: Date.now(),
      status: 'read'
    });
  };

  const handleRejectJoinRequest = async (targetUserId: string) => {
    await resolveRoomJoinRequest(room.id, targetUserId, 'rejected');
    setPendingJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
  };

  const handlePinCustomMessage = () => {
    if (!newPinText.trim()) return;
    sounds.playMessageSent();
    const pin = {
      id: `pin_${Date.now()}`,
      senderName: currentUser.name,
      content: newPinText.trim()
    };
    setPinnedMessage(pin);
    setNewPinText('');
    setIsModeratorPanelOpen(false);
    onSendMessage({
      roomId: room.id,
      senderId: currentUser.id,
      senderName: 'المشرف',
      senderAvatar: currentUser.avatar,
      senderRole: 'admin',
      senderVipBadge: 'مشرف الغرفة',
      type: 'system_welcome',
      content: `📌 قام المشرف بتثبيت رسالة في أعلى الشات: "${pin.content}"`,
      timestamp: Date.now(),
      status: 'read'
    });
  };

  const handleUnpin = () => {
    sounds.playMicToggle(false);
    setPinnedMessage(null);
  };

  const handleMuteAllSpeakers = () => {
    if (!isModerator) return;
    sounds.playMicToggle(false);
    const updated = (room.speakers || []).map(s => ({ ...s, isMuted: true, isTalking: false }));
    onUpdateSpeakers(updated);
    setIsModeratorPanelOpen(false);
  };

  const handleKickUser = (userId: string, userName: string) => {
    if (!isModerator) return;
    sounds.playMicToggle(false);
    setBannedUserIds(prev => [...prev, userId]);
    const updated = (room.speakers || []).map(s => s.user?.id === userId ? { ...s, user: null, isMuted: true, isTalking: false } : s);
    onUpdateSpeakers(updated);
    setIsModeratorPanelOpen(false);
    onSendMessage({
      roomId: room.id,
      senderId: currentUser.id,
      senderName: 'المشرف',
      senderAvatar: currentUser.avatar,
      senderRole: 'admin',
      senderVipBadge: 'مشرف الغرفة',
      type: 'system_welcome',
      content: `🚪 قام المشرف بطرد العضو [${userName}] من الغرفة.`,
      timestamp: Date.now(),
      status: 'read'
    });
  };

  const handleTasbeehClick = () => {
    sounds.playTasbeehClick();
    setTasbeehCount(prev => prev + 1);
  };

  const openProfileFromMsg = (msg: Message) => {
    const isFromMe = msg.senderId === currentUser.id;
    onOpenUserProfile({
      id: msg.senderId,
      name: msg.senderName,
      username: msg.senderName.replace(/\s+/g, '_').toLowerCase(),
      avatar: msg.senderAvatar,
      bio: isFromMe ? currentUser.bio : 'عضو في شات مصر والعرب',
      country: isFromMe ? currentUser.country : 'مصر',
      countryFlag: isFromMe ? currentUser.countryFlag : '🇪🇬',
      role: msg.senderRole,
      coins: isFromMe ? currentUser.coins : 0,
      earningsEgp: 0,
      earningsUsd: 0,
      vipBadge: msg.senderVipBadge || 'عضو مميز',
      badges: msg.badges || ['عضو نشط'],
      ratingPoints: isFromMe ? currentUser.ratingPoints : 0,
      frameStyle: 'border-amber-400',
      profileWallpaper: '',
      fontPreference: 'cairo',
      isOnline: true,
      status: 'online',
      joinedAt: new Date().toISOString().split('T')[0],
      gender: 'male',
      level: isFromMe ? currentUser.level : 1,
      likesReceived: isFromMe ? currentUser.likesReceived : 0,
      giftsReceivedCount: isFromMe ? currentUser.giftsReceivedCount : 0
    });
  };

  // Strictly text-only room unless created explicitly as voice room with active voice
  const isTextOnly = room.type === 'text' || room.roomType === 'text_only' || !room.isVoiceActive;

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#080c15] text-slate-100 overflow-hidden select-none">
      
      {/* 1. ROOM HEADER: Replaces main header entirely inside rooms */}
      <header className="bg-[#0b101e]/98 backdrop-blur-md border-b border-slate-800/90 px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-xl z-20">
        
        {/* Left Side (in RTL): Back Button, Flag/Icon, Room Title, and Online Count Badge right beside it */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          
          {/* Back Navigation Button */}
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all shrink-0"
            title="الرجوع لقائمة الغرف"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Room Icon & Title & Online Count Badge directly beside title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl shrink-0">{room.icon}</span>
            
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-white truncate leading-tight flex items-center gap-1.5">
                <span>{room.title}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              </h2>

              {/* Online Users in Room Badge - Directly Beside Room Name */}
              <button
                onClick={onOpenOnlineUsers}
                className="px-2 py-0.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 text-[10px] sm:text-[11px] font-black flex items-center gap-1 active:scale-95 shadow-sm transition-transform cursor-pointer shrink-0"
                title="المتصلون الآن في هذه الغرفة"
              >
                <Users className="w-3 h-3 text-emerald-400" />
                <span>{Math.max(1, room.activeUsers || 1)} متصل</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side (in RTL): Music Library, Requests, Gift Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* 100 Arabic Songs Music Library Button */}
          <button
            onClick={() => setIsMusicModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/60 hover:to-indigo-800/60 border border-purple-500/40 text-purple-200 text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="مكتبة الـ 100 أغنية طربية عربية"
          >
            <Music className="w-3.5 h-3.5 text-purple-300 animate-bounce" />
            <span className="hidden sm:inline">100 أغنية طربية</span>
            <span className="sm:hidden">أغاني 🎵</span>
          </button>

          {/* Private Room Join Requests Button for Host */}
          {isModerator && room.isPrivate && (
            <button
              onClick={() => setIsJoinRequestsOpen(true)}
              className="px-2 py-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-[10px] font-bold flex items-center gap-1 active:scale-95 shadow-sm relative"
              title="طلبات الانضمام المعلقة"
            >
              <Users className="w-3 h-3 text-purple-400" />
              <span>طلبات ({pendingJoinRequests.length})</span>
              {pendingJoinRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-ping"></span>
              )}
            </button>
          )}

          {/* Moderator Control Button - Only for voice/video rooms */}
          {isModerator && !isTextOnly && (
            <button
              onClick={() => setIsModeratorPanelOpen(true)}
              className="px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              title="لوحة تحكم المشرف"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تحكم المشرف</span>
            </button>
          )}

          {/* Tasbeeh Drawer Toggle for Religious Room */}
          {room.category === 'religious' && (
            <button
              onClick={() => setShowTasbeeh(!showTasbeeh)}
              className="px-2 py-1 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              <span>مسبحة ({tasbeehCount})</span>
            </button>
          )}

          {/* Luxury Gift Button */}
          <button
            onClick={onOpenGiftModal}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
            title="إرسال هدية فاخرة"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>هدية 🎁</span>
          </button>

        </div>
      </header>

      {/* 3. Pinned Message Banner */}
      {pinnedMessage && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between text-xs shadow-md shrink-0">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded shrink-0">
                مثبت:
              </span>
              <span className="text-[11px] text-white font-medium truncate">
                {pinnedMessage.content}
              </span>
            </div>
          </div>
          {isModerator && (
            <button
              onClick={handleUnpin}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 shrink-0 mr-1.5"
            >
              ✕ إلغاء
            </button>
          )}
        </div>
      )}

      {/* 4. Electronic Tasbeeh Drawer */}
      {showTasbeeh && (
        <div className="bg-emerald-950/70 border-b border-emerald-800/40 p-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📿</span>
            <div>
              <p className="text-[11px] font-bold text-emerald-200">سبحان الله وبحمده، سبحان الله العظيم</p>
              <p className="text-[10px] text-emerald-400">عدد التسبيحات: {tasbeehCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTasbeehClick}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm active:scale-95"
            >
              تسبيح +1
            </button>
            <button
              onClick={() => setTasbeehCount(0)}
              className="p-1 text-emerald-400 hover:text-white text-[10px]"
            >
              تصفير
            </button>
          </div>
        </div>
      )}

      {/* 5. Animated Welcome Toast (Fade-in & Slide-up for ANY user entering, auto-disappears after 3s) */}
      {welcomeToast.state !== 'hidden' && (
        <div 
          className={`fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none transition-all duration-400 ease-out transform ${
            welcomeToast.state === 'visible'
              ? 'opacity-100 translate-y-0 scale-100'
              : welcomeToast.state === 'initial'
              ? 'opacity-0 translate-y-8 scale-90'
              : 'opacity-0 -translate-y-5 scale-95'
          }`}
        >
          <div className="relative overflow-hidden rounded-full p-[1.5px] bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_24px_rgba(245,158,11,0.35)]">
            <div className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#090e1a]/95 backdrop-blur-xl flex items-center gap-2.5 sm:gap-3 text-white">
              
              {/* User Avatar with Pulsing Gold Ring */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-400 shrink-0 shadow-sm">
                {welcomeToast.user.avatar ? (
                  <img src={welcomeToast.user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {welcomeToast.user.name.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#090e1a] animate-pulse"></span>
              </div>

              {/* Greeting Text with Glowing User Name */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black whitespace-nowrap">
                <span className="text-amber-400 text-sm sm:text-base animate-bounce">✨</span>
                <span className="text-slate-200">أهلاً بك يا</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-black tracking-wide drop-shadow-sm">
                  {welcomeToast.user.name}
                </span>
                <span className="text-slate-400">في</span>
                <span className="text-cyan-300 font-bold">{room.title}</span>
                <span className="text-pink-400 text-sm">🌸</span>
              </div>

              {/* VIP / Role Badge */}
              {welcomeToast.user.vipBadge && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  {welcomeToast.user.vipBadge}
                </span>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 6. Chat Wallpaper & Feed Scroll Area: WhatsApp Doodle Pattern & Faded White Egyptian Pyramids Watermark */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Fixed Watermark & WhatsApp Pattern Wallpaper Layer */}
        <div className="absolute inset-0 pointer-events-none room-chat-background" />

        {/* Scrollable Messages Feed */}
        <div className="relative z-10 flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2.5 scroll-smooth text-right">
        {uniqueMessages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.id;
          const uniqueKey = `${msg.id || 'msg'}_${idx}`;

          // System welcome banner
          if (msg.type === 'system_welcome') {
            return (
              <div key={uniqueKey} className="flex justify-center my-1.5 animate-in fade-in">
                <div className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-200 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{msg.content}</span>
                </div>
              </div>
            );
          }

          // Luxury Gift Message
          if (msg.type === 'gift' && msg.gift) {
            return (
              <div key={uniqueKey} className="flex justify-center my-2 animate-in zoom-in-95">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-pink-950/80 border border-amber-500/50 p-2.5 max-w-sm w-full shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="text-2xl animate-bounce shrink-0">
                      {msg.gift.icon}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[11px] font-black text-amber-300 flex items-center gap-1 justify-end">
                        <span>هدية فاخرة: {msg.gift.name}</span>
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                      </div>
                      <p className="text-[11px] text-white mt-0.5">
                        <span className="font-bold text-amber-400">{msg.senderName}</span> أهدى {msg.gift.name} إلى {msg.gift.recipientName}
                      </p>
                      <span className="text-[9px] text-amber-300/80 font-bold">
                        بقيمة {msg.gift.cost} كوينز 🪙
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={uniqueKey}
              onTouchStart={(e) => {
                touchStartXRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const diff = touchStartXRef.current - e.changedTouches[0].clientX;
                if (diff > 45) {
                  sounds.playMessageSent();
                  setReplyingTo(msg);
                }
              }}
              className="flex items-start gap-1.5 sm:gap-2 justify-start group"
            >
              {/* Click Avatar to View User Profile */}
              <div 
                onClick={() => openProfileFromMsg(msg)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="عرض الملف الشخصي"
              >
                {msg.senderAvatar ? (
                  <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{msg.senderName.charAt(0)}</span>
                )}
              </div>

              {/* Message Bubble Container */}
              <div className="max-w-[85%] sm:max-w-[78%] space-y-0.5 text-right">
                
                {/* Sender Name & Badges */}
                <div className="flex items-center gap-1 text-[10px] font-bold flex-wrap">
                  <span 
                    onClick={() => openProfileFromMsg(msg)}
                    className="cursor-pointer hover:underline text-slate-200"
                  >
                    {msg.senderName}
                  </span>
                  {msg.senderVipBadge && (
                    <span className="px-1 py-0.1 rounded bg-amber-500/20 text-amber-300 text-[9px] flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      <span>{msg.senderVipBadge}</span>
                    </span>
                  )}
                  {msg.badges && msg.badges.map((bName, bIdx) => (
                    <span 
                      key={bIdx}
                      className="px-1 py-0.1 rounded bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-[8.5px] flex items-center gap-0.5"
                    >
                      <span>{bName}</span>
                    </span>
                  ))}
                  
                  {/* Reply Button on Message */}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-300 text-[10px] flex items-center gap-0.5 transition-opacity mr-1"
                    title="رد على الرسالة"
                  >
                    <Reply className="w-2.5 h-2.5" />
                    <span>رد</span>
                  </button>
                </div>

                {/* Bubble Body with Normal Inline Emojis & Smooth Styling */}
                <div className={`rounded-2xl px-3 py-1.5 sm:py-2 shadow-md text-xs sm:text-sm leading-relaxed ${
                  isMe 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none' 
                    : 'bg-[#121a2d]/95 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}>
                  
                  {/* Quoted Reply Preview */}
                  {msg.replyTo && (
                    <div className="mb-1 p-1 rounded-lg bg-black/30 border-r-2 border-amber-400 text-[10px] text-right">
                      <span className="font-bold text-amber-300 block">رد على {msg.replyTo.senderName}:</span>
                      <span className="text-slate-300 truncate block">{msg.replyTo.content}</span>
                    </div>
                  )}

                  {/* Voice Note Player */}
                  {msg.type === 'voice' ? (
                    <div className="flex items-center gap-2 py-0.5 min-w-[140px]">
                      <button
                        onClick={() => togglePlayVoice(msg.id, msg.audioUrl, msg.audioDuration)}
                        className={`p-1.5 rounded-full transition-transform active:scale-95 ${
                          isMe ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {playingVoiceId === msg.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>

                      <div className="flex items-center gap-0.5 flex-1">
                        <span className={`w-0.5 h-2.5 rounded-full ${playingVoiceId === msg.id ? 'animate-soundwave-1 bg-amber-400' : 'bg-slate-400'}`}></span>
                        <span className={`w-0.5 h-4 rounded-full ${playingVoiceId === msg.id ? 'animate-soundwave-2 bg-amber-400' : 'bg-slate-400'}`}></span>
                        <span className={`w-0.5 h-2 rounded-full ${playingVoiceId === msg.id ? 'animate-soundwave-3 bg-amber-400' : 'bg-slate-400'}`}></span>
                        <span className={`w-0.5 h-3.5 rounded-full ${playingVoiceId === msg.id ? 'animate-soundwave-4 bg-amber-400' : 'bg-slate-400'}`}></span>
                      </div>

                      <span className="text-[9px] font-mono opacity-80">
                        {msg.audioDuration ? `0:${msg.audioDuration < 10 ? '0' : ''}${msg.audioDuration}` : '0:05'}
                      </span>
                    </div>
                  ) : (
                    /* Inline compact emoji rendering matching normal text size */
                    <p className="whitespace-pre-wrap leading-relaxed break-words text-xs sm:text-sm">
                      {msg.content}
                    </p>
                  )}

                  {/* Timestamp & Read Receipts */}
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] opacity-75">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-cyan-300" />
                        ) : (
                          <Check className="w-3 h-3 text-slate-300" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 7. Replying To Banner Preview */}
      {replyingTo && (
        <div className="bg-indigo-950/90 border-t border-indigo-700/60 px-3 py-1 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Reply className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold text-amber-300">الرد على {replyingTo.senderName}:</span>
            <span className="text-[11px] text-slate-300 truncate max-w-[220px]">{replyingTo.content}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-0.5 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 8. Voice Recording Live Banner */}
      {isRecordingVoice && (
        <div className="bg-red-950/80 border-t border-red-700/60 px-3 py-1.5 flex items-center justify-between animate-pulse shrink-0">
          <div className="flex items-center gap-2 text-red-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>جاري التسجيل الصوتي... 0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCancelVoiceRecord}
              className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handleStopVoiceRecordAndSend}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>إرسال</span>
            </button>
          </div>
        </div>
      )}

      {/* 8.5. Quick Welcoming Phrases Bar (الجمل الترحيبية) */}
      <div className="bg-[#090e1a]/95 border-t border-slate-800/80 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 z-20">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black shrink-0 whitespace-nowrap shadow-sm">
          <span>🌸</span>
          <span>ترحيب:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {WELCOME_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              disabled={currentUser.isBanned || currentUser.isMuted}
              onClick={() => handleSendWelcomePhrase(phrase)}
              className="px-2.5 py-1 rounded-full bg-slate-800/85 hover:bg-slate-700/90 hover:border-amber-400/50 border border-slate-700/70 text-slate-200 hover:text-amber-200 text-[11px] font-medium whitespace-nowrap transition-all duration-150 active:scale-95 shadow-sm shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="اضغط لإرسال الترحيب فوراً"
            >
              <span>{phrase}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 9. BOTTOM INPUT BAR: Emoji Button INSIDE before send button */}
      <div className="relative bg-[#0b101e] border-t border-slate-800 p-2 sm:p-2.5 flex items-center gap-1.5 shrink-0 z-20">
        
        {/* Luxury Gift Button Shortcut */}
        <button
          onClick={onOpenGiftModal}
          className="p-2 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-md"
          title="إرسال هدية فاخرة"
        >
          <Gift className="w-4 h-4" />
        </button>

        {/* Text Input with Form */}
        <form onSubmit={handleSendText} className="flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            disabled={currentUser.isBanned || currentUser.isMuted}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentUser.isBanned
                ? "عفواً، حسابك محظور من الإدارة 🚫"
                : currentUser.isMuted
                ? "أنت مكتوم حالياً بواسطة الإدارة 🔇"
                : "اكتب رسالتك في المجلس..."
            }
            className={`w-full bg-[#121a2d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
              currentUser.isBanned || currentUser.isMuted ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''
            }`}
          />
        </form>

        {/* Inline Emoji Picker Button: Directly adjacent to input text, right before Send */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            disabled={currentUser.isBanned || currentUser.isMuted}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 active:scale-95 transition-all shrink-0"
            title="إيموجيات وتعبيرات"
          >
            <span className="text-sm sm:text-base">😊</span>
          </button>

          {/* Compact Popup Emoji Picker Modal */}
          {isEmojiPickerOpen && (
            <div className="absolute bottom-12 left-0 sm:left-auto sm:right-0 z-50 w-72 sm:w-80 bg-[#0e1626] border border-slate-700 rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in slide-in-from-bottom-2">
              
              {/* Category Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveEmojiTab('faces')}
                  className={`py-1 rounded-lg transition-all ${
                    activeEmojiTab === 'faces' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تعبيرات 😊
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEmojiTab('flags')}
                  className={`py-1 rounded-lg transition-all ${
                    activeEmojiTab === 'flags' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  أعلام 🇪🇬
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEmojiTab('fun')}
                  className={`py-1 rounded-lg transition-all ${
                    activeEmojiTab === 'fun' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تفاعل 🔥
                </button>
              </div>

              {/* Emojis Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-1 scrollbar-none">
                {EMOJI_CATEGORIES[activeEmojiTab].map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Send Button OR Voice Note Button */}
        {inputText.trim() ? (
          <button
            onClick={() => handleSendText()}
            disabled={currentUser.isBanned || currentUser.isMuted}
            className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md active:scale-95 transition-transform shrink-0 disabled:opacity-40"
            title="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={isRecordingVoice ? handleStopVoiceRecordAndSend : handleStartVoiceRecord}
            disabled={currentUser.isBanned || currentUser.isMuted}
            className={`p-2 rounded-xl transition-all shrink-0 disabled:opacity-40 ${
              isRecordingVoice 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700'
            }`}
            title="تسجيل رسالة صوتية"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

      </div>

      {/* Arabic Music Player Modal (100 Authentic Songs Library) */}
      <ArabicMusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        roomTitle={room.title}
        isHost={isModerator}
      />

      {/* Moderator Control Modal */}
      {isModeratorPanelOpen && isModerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1626] border border-amber-500/40 rounded-2xl shadow-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-white">لوحة تحكم المشرفين</h3>
              </div>
              <button onClick={() => setIsModeratorPanelOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pinned Message */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" />
                <span>تثبيت رسالة في أعلى الشات:</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newPinText}
                  onChange={(e) => setNewPinText(e.target.value)}
                  placeholder="اكتب الإعلان..."
                  className="flex-1 bg-[#121c32] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handlePinCustomMessage}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  تثبيت
                </button>
              </div>
            </div>

            {/* Mute Speakers */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5" />
                <span>كتم المايكات للمتحدثين:</span>
              </label>
              <button
                onClick={handleMuteAllSpeakers}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 text-xs font-bold flex items-center justify-center gap-1"
              >
                <VolumeX className="w-3 h-3" />
                <span>كتم جميع المايكات</span>
              </button>
            </div>

            {/* Kick user */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-red-300 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                <span>طرد مستخدم من الغرفة:</span>
              </label>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {uniqueMessages.filter(m => m.senderId !== currentUser.id && !bannedUserIds.includes(m.senderId)).slice(0, 3).map(m => (
                  <div key={m.senderId} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800 text-xs">
                    <span className="text-white font-bold truncate max-w-[180px]">{m.senderName}</span>
                    <button
                      onClick={() => handleKickUser(m.senderId, m.senderName)}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                    >
                      طرد 🚪
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Join Requests Manager Modal */}
      <JoinRequestsManagerModal
        isOpen={isJoinRequestsOpen}
        onClose={() => setIsJoinRequestsOpen(false)}
        requests={pendingJoinRequests}
        onAccept={handleAcceptJoinRequest}
        onReject={handleRejectJoinRequest}
        roomTitle={room.title}
      />

    </div>
  );
};
