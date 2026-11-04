import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Mic, 
  Crown, 
  MessageCircle, 
  UserPlus, 
  Check, 
  Star,
  Award
} from 'lucide-react';
import { User } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface OnlineUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUserForProfile: (user: User) => void;
  onInviteToMic: (user: User) => void;
  onOpenPrivateChatWith: (user: User) => void;
  roomTitle?: string;
  roomUsers?: User[];
  allActiveUsers?: User[];
}

export const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUserForProfile,
  onInviteToMic,
  onOpenPrivateChatWith,
  roomTitle,
  roomUsers = [],
  allActiveUsers = []
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'general'>(roomTitle ? 'room' : 'general');
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  // Use provided users or ensure at least currentUser is present
  const baseUsersList = activeTab === 'room' && roomTitle 
    ? (roomUsers.length > 0 ? roomUsers : [currentUser])
    : (allActiveUsers.length > 0 ? allActiveUsers : [currentUser]);

  // Sort by rating points (descending) as requested: "تؤثر على ترتيبهم في قائمة المتواجدين"
  const sortedUsers = [...baseUsersList].sort((a, b) => {
    const pointsA = a.ratingPoints || 0;
    const pointsB = b.ratingPoints || 0;
    return pointsB - pointsA;
  });

  const filteredUsers = sortedUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.country && u.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInvite = (user: User) => {
    sounds.playMessageSent();
    setInvitedUserIds(prev => new Set(prev).add(user.id));
    onInviteToMic(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-[#0e1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                {roomTitle ? `المتصلون (${roomTitle})` : 'المتصلون الآن في شات مصر والعرب'}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {filteredUsers.length} متصلين • مرتبين حسب نقاط التقييم ⭐
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {roomTitle && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('room')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'room'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              في هذه الغرفة ({roomUsers.length || 1})
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'general'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              جميع المتصلين ({allActiveUsers.length || 1})
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/40">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الدولة..."
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Users List Sorted by Rating */}
        <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1">
          {filteredUsers.map((user, idx) => {
            const isMe = user.id === currentUser.id;
            const hasInvited = invitedUserIds.has(user.id);
            const userBadges = user.badges || ['عضو نشط'];

            return (
              <div
                key={user.id || idx}
                onClick={() => onSelectUserForProfile(user)}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-slate-800/40"
              >
                {/* Left Side: Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!isMe && (
                    <>
                      {/* Invite to Mic */}
                      {roomTitle && (
                        <button
                          onClick={() => handleInvite(user)}
                          disabled={hasInvited}
                          className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-0.5 shadow transition-all ${
                            hasInvited
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white'
                          }`}
                          title="دعوة للصعود إلى المايك"
                        >
                          {hasInvited ? <Check className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                          <span>{hasInvited ? 'تمت الدعوة' : 'دعوة للمايك'}</span>
                        </button>
                      )}

                      {/* Direct Message */}
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPrivateChatWith(user);
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                        title="محادثة خاصة"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isMe && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      أنت
                    </span>
                  )}
                </div>

                {/* Right Side (in RTL): Avatar, Name, VIP, Rating Points, Badges */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-right min-w-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs font-black text-white truncate hover:underline">
                        {user.name}
                      </span>
                      <span className="text-sm shrink-0">{user.countryFlag || '🇪🇬'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end text-[10px] text-slate-400 mt-0.5">
                      {/* Rating Points Badge */}
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{user.ratingPoints || 0} تقييم</span>
                      </span>

                      {/* VIP Badge */}
                      {user.vipBadge && (
                        <span className="text-amber-300 font-bold">
                          {user.vipBadge}
                        </span>
                      )}
                    </div>

                    {/* Earned Badges chips */}
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {userBadges.slice(0, 2).map((b, bI) => (
                        <span key={bI} className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0e1626]"></span>
                  </div>

                  {/* Rank Number */}
                  <span className="text-xs font-black text-slate-500 w-4 text-center">
                    #{idx + 1}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
