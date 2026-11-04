export type UserRole = 
  | 'owner' 
  | 'super_admin' 
  | 'admin' 
  | 'vip_diamond' 
  | 'vip_gold' 
  | 'vip_silver' 
  | 'vip_bronze' 
  | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  country: string;
  countryFlag: string;
  role: UserRole;
  coins: number;
  earningsEgp: number;
  earningsUsd: number;
  vipBadge: string;
  frameStyle: string;
  profileWallpaper: string;
  fontPreference: 'cairo' | 'tajawal' | 'amiri';
  isOnline: boolean;
  status: 'online' | 'busy' | 'away' | 'in_mic' | 'offline';
  joinedAt: string;
  gender: 'male' | 'female';
  level: number;
  likesReceived: number;
  giftsReceivedCount: number;
  allowPrivateMessages?: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
  badges?: string[];
  ratingPoints?: number;
  totalGiftsSent?: number;
  totalTimeMinutes?: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface SpeakerSeat {
  seatId: number;
  user: User | null;
  isMuted: boolean;
  isTalking: boolean;
  isVideo: boolean;
}

export type RoomCategory = 
  | 'all'
  | 'general' 
  | 'religious' 
  | 'egypt' 
  | 'gulf' 
  | 'maghreb' 
  | 'sham' 
  | 'games' 
  | 'music' 
  | 'member_rooms';

export interface Room {
  id: string;
  name?: string;
  title: string;
  description: string;
  subtext: string;
  category: RoomCategory;
  type?: 'voice' | 'text';
  roomType?: 'voice' | 'text_only';
  icon: string;
  iconBg: string;
  activeUsers: number;
  visitorsCount: string;
  isLive: boolean;
  isLiveBroadcasting?: boolean;
  isVoiceActive: boolean;
  accentGradient: string;
  speakers: SpeakerSeat[];
  moderators: string[];
  pinnedAnnouncement?: string;
  pinnedMessage?: {
    id: string;
    senderName: string;
    content: string;
  };
  bannedUserIds?: string[];
  mutedUserIds?: string[];
  isPrivate?: boolean;
  ownerId?: string;
  hostId?: string;
  backgroundTheme?: string;
  createdAt?: number;
  cameraAllowedUserIds?: string[];
  allowedUserIds?: string[];
  joinRequests?: { userId: string; userName: string; userAvatar?: string; requestedAt: number }[];
  cameraRequests?: { userId: string; userName: string; requestedAt: number }[];
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  animation: 'lion' | 'car' | 'cairo_tower' | 'crown' | 'rocket' | 'rose' | 'coffee' | 'diamond';
  bannerText: string;
}

export interface Message {
  id: string;
  roomId?: string;
  recipientId?: string;
  userId?: string;
  userName?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  senderVipBadge: string;
  senderFont?: string;
  badges?: string[];
  type: 'text' | 'voice' | 'image' | 'gift' | 'system_welcome' | 'quick_phrase';
  content: string;
  text?: string;
  audioDuration?: number;
  audioUrl?: string;
  imageUrl?: string;
  gift?: {
    giftId: string;
    name: string;
    icon: string;
    cost: number;
    recipientName: string;
  };
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  createdAt?: number;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  likes?: number;
  reactions?: { [emoji: string]: number };
  userReactions?: { [userId: string]: string };
}

export interface RadioStation {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  streamUrl: string;
  artist: string;
}

export interface VipTier {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  priceEgp: number;
  priceUsd: number;
  coinsBonus: number;
  gradient: string;
  badgeBg: string;
  perks: string[];
}

export interface TriviaQuestion {
  id: string;
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  coinsReward: number;
}

export interface WithdrawalRequest {
  id: string;
  amountEgp: number;
  amountUsd: number;
  method: 'vodafone_cash' | 'instapay' | 'orange_cash' | 'etisalat_cash' | 'bank_transfer' | 'usdt';
  recipientDetails: string;
  date: string;
  status: 'pending' | 'completed' | 'processing';
  referenceId: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  flag: string;
  role: UserRole;
  badge: string;
  points: number;
  giftsCount: number;
  coinsEarned: number;
  rank: number;
}
