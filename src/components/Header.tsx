import React, { useState, useRef } from 'react';
import { 
  Bell, 
  Share2, 
  Users, 
  Crown, 
  Radio,
  MessagesSquare,
  UserPlus,
  Camera,
  Check,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types/chat';

interface HeaderProps {
  currentUser: User;
  onOpenWallet: () => void;
  onOpenVip: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenOnlineUsers: () => void;
  onOpenFriendRequests: () => void;
  onOpenAdmin?: () => void;
  pendingFriendRequestsCount: number;
  onlineUsersCount: number;
  onOpenRadio: () => void;
  isRadioPlaying: boolean;
  onAvatarChanged?: (newAvatarUrl: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenWallet,
  onOpenVip,
  onOpenProfile,
  onOpenNotifications,
  onOpenOnlineUsers,
  onOpenFriendRequests,
  pendingFriendRequestsCount,
  onlineUsersCount,
  onOpenRadio,
  isRadioPlaying,
  onAvatarChanged,
  onOpenAdmin
}) => {
  const [showShareNotification, setShowShareNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <header className="sticky top-0 z-40 bg-[#080c15]/95 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 py-2 sm:py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 flex-nowrap">
        
        {/* Hidden File Input for Direct Avatar Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleAvatarFileChange} 
        />

        {/* Right Side (in RTL): Avatar, Brand Logo, VIP Badge, Real Coins Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* User Profile Avatar with Direct Upload & Online Dot */}
          <div className="relative group shrink-0">
            <button 
              onClick={onOpenProfile}
              title="عرض الملف الشخصي"
              className="relative flex items-center justify-center p-0.5 rounded-full hover:scale-105 active:scale-95 transition-transform"
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm ${currentUser.frameStyle || 'border-amber-400'}`}>
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#080c15] rounded-full shadow-[0_0_5px_#10b981]"></span>
            </button>

            {/* Quick Change Avatar Overlay Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="تغيير الصورة الشخصية مباشرة من جهازك"
              className="absolute -top-1 -left-1 w-4 h-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md border border-slate-800 transition-transform active:scale-90"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-900/70 border border-slate-800/80 rounded-xl px-2 py-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0">
              <MessagesSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap">
              شات مصر والعرب
            </span>
          </div>

          {/* VIP Upgrade Button */}
          <button 
            onClick={onOpenVip}
            title="ترقية الرتبة VIP"
            className="px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-xs font-black">VIP</span>
          </button>

          {/* Admin Panel Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="لوحة تحكم المدير والإشراف العام"
              className="px-2 py-1 rounded-xl bg-red-950/60 border border-red-500/50 hover:bg-red-900/60 text-red-300 hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] sm:text-xs font-black">الإدارة 🛡️</span>
            </button>
          )}

          {/* Real Coins Balance Chip (No EGP label) */}
          <button 
            onClick={onOpenWallet}
            title="المحفظة وشحن الكوينز"
            className="px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:border-amber-400 transition-colors shrink-0"
          >
            <span>🪙</span>
            <span>{currentUser.coins.toLocaleString()}</span>
          </button>

          {/* Standalone Single File Link */}
          <a
            href="/chat.html"
            target="_blank"
            rel="noopener noreferrer"
            title="فتح منصة الشات المستقلة ذات الملف الواحد (Single-File HTML/CSS/JS)"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs font-bold transition-all shrink-0"
          >
            <span>⚡</span>
            <span>نسخة HTML</span>
          </a>

        </div>

        {/* Left Side (in RTL): Friend Requests, Online Users, Notifications, Radio, Share */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Friend Requests Notification Button ("طلبات الصداقة") */}
          <button 
            onClick={onOpenFriendRequests}
            title="طلبات الصداقة"
            className="relative p-1.5 sm:p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white transition-all shrink-0 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            {pendingFriendRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-pink-600 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow">
                {pendingFriendRequestsCount}
              </span>
            )}
          </button>

          {/* Real Connected Users Counter */}
          <button 
            onClick={onOpenOnlineUsers}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/70 border border-emerald-600/50 hover:bg-emerald-900/60 text-emerald-300 text-[10px] sm:text-xs font-bold active:scale-95 transition-transform shrink-0"
            title="المتواجدون حالياً"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{Math.max(1, onlineUsersCount)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Notifications Button */}
          <button 
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            title="الإشعارات"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Radio Player Button */}
          <button
            onClick={onOpenRadio}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
              isRadioPlaying
                ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)] animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="راديو ومكتبة الطرب العربي"
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative shrink-0"
            title="مشاركة رابط المنصة"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {showShareNotification && (
              <span className="absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-xl flex items-center gap-1 z-50">
                <Check className="w-3 h-3" /> تم نسخ الرابط!
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
