import React, { useState, useRef } from 'react';
import { 
  X, 
  Crown, 
  MessageCircle, 
  Gift, 
  Heart, 
  Star,
  UserPlus,
  Check,
  Camera,
  Pencil,
  Award,
  Sparkles
} from 'lucide-react';
import { User } from '../types/chat';
import { BADGES_CATALOG } from '../data/seedData';
import { sendFriendRequest, submitUserRating } from '../services/firebase';
import { sounds } from '../utils/soundEffects';

interface UserProfileModalProps {
  user: User | null;
  currentUser: User;
  onClose: () => void;
  onOpenPrivateChatWith: (user: User) => void;
  onSendGiftToUser: (user: User) => void;
  onAvatarChanged?: (url: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  onClose,
  onOpenPrivateChatWith,
  onSendGiftToUser,
  onAvatarChanged,
}) => {
  if (!user) return null;

  const isMe = user.id === currentUser.id;
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(user.ratingPoints || 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendFriendReq = async () => {
    if (isMe || friendRequestSent) return;
    sounds.playMessageSent();
    await sendFriendRequest(currentUser, user.id);
    setFriendRequestSent(true);
  };

  const handleGiveRating = async () => {
    if (isMe || hasRated) return;
    sounds.playCoinsReward();
    const updated = await submitUserRating(currentUser.id, user.id, 10);
    setUserRating(updated);
    setHasRated(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChanged) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAvatarChanged(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Badges list
  const userBadges = user.badges && user.badges.length > 0 ? user.badges : ['عضو نشط'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0e1626] border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100">
        
        {/* Hidden Avatar Uploader */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Cover Header */}
        <div className="h-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pt-0 -mt-12 text-center space-y-3">
          
          {/* Avatar with Live Indicator & Direct Edit for Owner */}
          <div className="relative inline-block">
            <div className={`w-22 h-22 rounded-full overflow-hidden border-4 bg-slate-900 shadow-xl mx-auto ${user.frameStyle || 'border-amber-400'}`}>
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={user.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Live Indicator Dot */}
            <span 
              className={`absolute bottom-1 right-2 w-4 h-4 rounded-full border-2 border-[#0e1626] ${
                user.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'
              }`}
              title={user.isOnline ? 'متصل الآن' : 'غير متصل'}
            />

            {/* If Current User, Show Quick Photo Change Button (Pencil Icon) */}
            {isMe && (
              <button
                onClick={() => fileInputRef.current?.click()}
                title="تغيير الصورة الشخصية وتحديثها فوراً في Firebase"
                className="absolute top-0 right-0 p-1.5 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl border border-slate-700 active:scale-90 transition-transform flex items-center justify-center"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Name & Country */}
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-base font-black text-white">{user.name}</h3>
              <span className="text-lg">{user.countryFlag || '🇪🇬'}</span>
            </div>

            {/* VIP Tier Badge */}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {user.vipBadge || 'عضو مميز'}
              </span>
              <span className="text-xs text-slate-400 font-normal">(@{user.username || 'user'})</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-1">
              <span className={user.isOnline ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {user.isOnline ? '● متصل الآن' : '○ غير متصل'}
              </span>
              <span>•</span>
              <span>{user.country || 'مصر'}</span>
            </div>
          </div>

          {/* Earned Badges Section */}
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-right space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>شارات الإنجاز المكتسبة</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-black">{userBadges.length} شارات</span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-end">
              {userBadges.map((badgeName, idx) => {
                const catalogItem = BADGES_CATALOG.find(b => b.name === badgeName);
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-200 shadow-sm"
                    title={catalogItem?.description || badgeName}
                  >
                    <span>{catalogItem?.icon || '🏅'}</span>
                    <span className="font-bold">{badgeName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Bio */}
          {user.bio && (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              {user.bio}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">نقاط التقييم ⭐</span>
              <span className="font-black text-amber-400">{userRating}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الهدايا 🎁</span>
              <span className="font-black text-pink-400">{user.giftsReceivedCount || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الإعجابات ❤️</span>
              <span className="font-black text-red-400">{user.likesReceived || 0}</span>
            </div>
          </div>

          {/* Social Interactions for Other Users: Friend Request, Direct Message, Gift, Rate */}
          {!isMe && (
            <div className="space-y-2 pt-1">
              
              {/* Primary Row: Friend Request & Direct Message */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSendFriendReq}
                  disabled={friendRequestSent}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    friendRequestSent
                      ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {friendRequestSent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم إرسال الطلب</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>طلب صداقة</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPrivateChatWith(user);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>إرسال رسالة</span>
                </button>
              </div>

              {/* Secondary Row: Gift & Member Rating */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onSendGiftToUser(user);
                  }}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>إهداء هدية</span>
                </button>

                <button
                  onClick={handleGiveRating}
                  disabled={hasRated}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    hasRated
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hasRated ? 'تم التقييم (+10)' : 'تقييم العضو'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
