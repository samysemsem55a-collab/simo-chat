import React, { useState } from 'react';
import { 
  Compass, 
  Crown, 
  Coins, 
  Search, 
  Mic, 
  Users, 
  Sparkles, 
  MessageSquare,
  Lock,
  Eye,
  Target,
  ArrowLeft,
  Flame,
  Radio,
  Volume2
} from 'lucide-react';
import { Room } from '../types/chat';

export interface SuggestedVoiceRoom {
  id: string;
  title: string;
  description: string;
  interestCategory: 'sports' | 'art' | 'culture' | 'tech' | 'gaming';
  interestLabel: string;
  interestIcon: string;
  matchScore: string;
  icon: string;
  accentGradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  activeSpeakers: number;
  activeListeners: number;
  topics: string[];
}

export const SUGGESTED_VOICE_ROOMS: SuggestedVoiceRoom[] = [
  {
    id: 'voice_room_sports',
    title: 'مجلس عشاق الرياضة والكرة العربية ⚽',
    description: 'تحليل مباشر لمباريات اليوم، الدوري المصري، الدوري السعودي، وديربيات العالم',
    interestCategory: 'sports',
    interestLabel: 'الرياضة وكرة القدم',
    interestIcon: '⚽',
    matchScore: '98% تطابق مع اهتمامك بالرياضة',
    icon: '⚽',
    accentGradient: 'from-emerald-500 via-teal-600 to-indigo-700',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    activeSpeakers: 4,
    activeListeners: 42,
    topics: ['مباريات اليوم', 'الدوري المصري', 'كلاسيكو', 'تحليل تكتيكي']
  },
  {
    id: 'voice_room_art',
    title: 'صالون الطرب الأصيل وروائع النغم 🎨',
    description: 'أمسية طربية، عزف عود حي، ومواهب غنائية واستماع لأعذب روائع الست وحليم وفيروز',
    interestCategory: 'art',
    interestLabel: 'الفن والموسيقى والطرب',
    interestIcon: '🎨',
    matchScore: '99% تطابق مع اهتمامك بالفن والطرب',
    icon: '🎨',
    accentGradient: 'from-purple-500 via-pink-600 to-indigo-700',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300',
    activeSpeakers: 5,
    activeListeners: 58,
    topics: ['طربيات زمان', 'عزف عود', 'مواهب غنائية', 'فيروزيات']
  },
  {
    id: 'voice_room_culture',
    title: 'ديوان الأدب والثقافة والشعر العربي 📚',
    description: 'أمسيات شعرية نبطية وفصحى، نقاش كتب التراث والروايات، وحوارات فكرية راقية',
    interestCategory: 'culture',
    interestLabel: 'الثقافة والأدب والشعر',
    interestIcon: '📚',
    matchScore: '96% تطابق مع اهتمامك بالثقافة',
    icon: '📚',
    accentGradient: 'from-amber-500 via-orange-600 to-amber-800',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
    activeSpeakers: 3,
    activeListeners: 35,
    topics: ['شعر فصيح', 'شعر نبطي', 'نقاش كتب', 'حوار فكري']
  },
  {
    id: 'voice_room_tech',
    title: 'ملتقى التقنية والذكاء الاصطناعي ورواد الأعمال 💡',
    description: 'حوارات تقنية في البرمجة، مشاريع الذكاء الاصطناعي، التجارة الرقمية وبناء الشركات',
    interestCategory: 'tech',
    interestLabel: 'التقنية وريادة الأعمال',
    interestIcon: '💡',
    matchScore: '94% تطابق مع اهتمامك بالتقنية',
    icon: '💡',
    accentGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
    activeSpeakers: 3,
    activeListeners: 29,
    topics: ['ذكاء اصطناعي', 'برمجة', 'ريادة أعمال', 'تسويق']
  },
  {
    id: 'voice_room_gaming',
    title: 'مجلس بطولات الجيمنج وتحديات الألغاز 🎮',
    description: 'تحديات ألعاب جماعية، بطولات حية، أسئلة ذكاء وفوازير مع جوائز كوينز فورية',
    interestCategory: 'gaming',
    interestLabel: 'الألعاب والجيمنج',
    interestIcon: '🎮',
    matchScore: '92% تطابق مع اهتمامك بالألعاب',
    icon: '🎮',
    accentGradient: 'from-rose-500 via-pink-600 to-purple-800',
    badgeBg: 'bg-rose-950/80',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300',
    activeSpeakers: 4,
    activeListeners: 46,
    topics: ['بطولات حية', 'ألغاز وفوازير', 'تحديات مايك', 'جوائز كوينز']
  }
];

interface RoomsViewProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onOpenCreateVoiceRoom: () => void;
  onOpenCreateTextRoom: () => void;
  onOpenWallet: () => void;
  onOpenVip: () => void;
  onOpenMissions?: () => void;
  totalActiveUsersCount?: number;
  onOpenOnlineUsers?: () => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  onSelectRoom,
  onOpenCreateVoiceRoom,
  onOpenCreateTextRoom,
  onOpenWallet,
  onOpenVip,
  onOpenMissions,
  totalActiveUsersCount = 1,
  onOpenOnlineUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  
  // Active Interest Filter: 'all' or specific interest
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  
  // Section tab toggle: 'all' (عرض الكل) | 'suggestions' (المقترحة فقط)
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'suggestions'>('all');

  // Filter available rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.subtext.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCountryFilter === 'all') return true;
    if (selectedCountryFilter === 'egypt') return room.id.includes('egypt') || room.title.includes('مصر');
    if (selectedCountryFilter === 'ksa') return room.id.includes('ksa') || room.title.includes('السعودية');
    if (selectedCountryFilter === 'morocco') return room.id.includes('morocco') || room.title.includes('المغرب');
    if (selectedCountryFilter === 'iraq') return room.id.includes('iraq') || room.title.includes('العراق');
    if (selectedCountryFilter === 'religious') return room.category === 'religious';

    return true;
  });

  // Filter suggested voice rooms by selected interest
  const filteredSuggestedRooms = SUGGESTED_VOICE_ROOMS.filter(s => {
    const matchesInterest = selectedInterest === 'all' || s.interestCategory === selectedInterest;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesInterest && matchesSearch;
  });

  // Launch a suggested voice room
  const handleJoinSuggestedVoiceRoom = (suggested: SuggestedVoiceRoom) => {
    const voiceRoomPayload: Room = {
      id: suggested.id,
      title: suggested.title,
      description: suggested.description,
      subtext: `مجلس صوتي حي مخصص لـ ${suggested.interestLabel}`,
      category: 'music',
      type: 'voice',
      roomType: 'voice',
      icon: suggested.icon,
      iconBg: suggested.accentGradient,
      activeUsers: suggested.activeListeners + suggested.activeSpeakers,
      visitorsCount: `${(suggested.activeListeners + suggested.activeSpeakers) * 2}`,
      isLive: true,
      isVoiceActive: true,
      accentGradient: suggested.accentGradient,
      speakers: Array.from({ length: 8 }, (_, i) => ({
        seatId: i + 1,
        user: i < suggested.activeSpeakers ? {
          id: `speaker_${suggested.id}_${i}`,
          name: i === 0 ? 'مضيف المجلس' : `متحدث ${i + 1}`,
          username: `user_${suggested.interestCategory}_${i}`,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=speaker_${suggested.id}_${i}`,
          bio: `شغوف بـ ${suggested.interestLabel}`,
          country: 'مصر',
          countryFlag: '🇪🇬',
          role: i === 0 ? 'owner' : 'vip_gold',
          coins: 1000,
          earningsEgp: 0,
          earningsUsd: 0,
          vipBadge: i === 0 ? 'مضيف المجلس 👑' : 'متحدث ذهبي 🎙️',
          badges: ['متحدث صوتي', 'صوت ماسي'],
          ratingPoints: 85,
          frameStyle: 'border-amber-400',
          profileWallpaper: '',
          fontPreference: 'cairo',
          isOnline: true,
          status: 'in_mic',
          joinedAt: '2024-01-01',
          gender: 'male',
          level: 7,
          likesReceived: 45,
          giftsReceivedCount: 15
        } : null,
        isMuted: false,
        isTalking: i === 0,
        isVideo: false
      })),
      moderators: [`speaker_${suggested.id}_0`]
    };

    onSelectRoom(voiceRoomPayload);
  };

  return (
    <div className="pb-24 pt-2 px-2.5 sm:px-4 max-w-4xl mx-auto space-y-3">
      
      {/* 1. Real-time Live Counters: Separate Small Square Boxes for Online Users & Visitors */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        
        {/* Box 1: Online Connected Users */}
        <div 
          onClick={onOpenOnlineUsers}
          className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-lg flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          title="اضغط لعرض قائمة المتصلين الآن"
        >
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>المتصلين الآن</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-emerald-400 drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                {totalActiveUsersCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400">عضو نشط</span>
            </div>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Box 2: Total Active Visitors */}
        <div 
          className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg flex items-center justify-between transition-all group"
          title="إجمالي زوار المنصة النشطين حالياً"
        >
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>إجمالي الزوار</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                {Math.max(1, totalActiveUsersCount * 3 + 2)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">زائر نشط</span>
            </div>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-110 transition-transform shrink-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

      </div>

      {/* 2. Header with Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
            <span>غرف الدردشة والمجالس العربية</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-300">
            شات كل العرب • غرف كتابية ومجالس صوتية مقترحة حسب اهتماماتك
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateVoiceRoom}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="إنشاء مجلس صوتي جديد"
          >
            <Mic className="w-3.5 h-3.5 text-purple-200" />
            <span>إنشاء مجلس صوتي 🎙️</span>
          </button>

          <button
            onClick={onOpenCreateTextRoom}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="إنشاء غرفة دردشة كتابية"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-200" />
            <span>إنشاء غرفة دردشة 💬</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Utility Navigation: Missions & Wallet & VIP */}
      <div className="grid grid-cols-3 gap-2">
        {onOpenMissions && (
          <button
            onClick={onOpenMissions}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 hover:border-purple-400 transition-all text-xs font-bold shadow-sm active:scale-95"
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate">المهام اليومية 🎯</span>
          </button>
        )}

        <button
          onClick={onOpenWallet}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 hover:border-amber-400 transition-all text-xs font-bold shadow-sm active:scale-95"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">شحن الكوينز 🪙</span>
        </button>

        <button
          onClick={onOpenVip}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 hover:border-indigo-400 transition-all text-xs font-bold shadow-sm active:scale-95"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="truncate">عضويات VIP 👑</span>
        </button>
      </div>

      {/* 4. Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن دولة، مجلس صوتي، اهتمام، أو اسم الغرفة..."
          className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl px-3 py-2 pr-9 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* 5. SUGGESTED VOICE ROOMS SECTION (اقتراحات غرف صوتية حسب الاهتمامات المشتركة) */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 p-3 sm:p-4 space-y-3 shadow-xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                <Mic className="w-4 h-4 animate-pulse text-pink-400" />
              </span>
              <span>مجالس صوتية مقترحة بناءً على اهتماماتك المشتركة</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-[11px] text-indigo-200/80">
              انضم وتحدث على المايك مباشرة مع أصدقاء يشاركونك نفس الشغف والهوايات 🎙️
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveTabSection('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTabSection === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              عرض الكل
            </button>
            <button
              onClick={() => setActiveTabSection('suggestions')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTabSection === 'suggestions'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>المقترحة فقط</span>
              <span className="px-1 py-0.2 rounded-full bg-pink-500 text-[9px] font-black">{SUGGESTED_VOICE_ROOMS.length}</span>
            </button>
          </div>
        </div>

        {/* Interest Selector Pills (الرياضة، الفن، الثقافة، التقنية، الألعاب) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <span className="text-[11px] font-black text-slate-400 shrink-0 whitespace-nowrap ml-1">
            اختر اهتمامك:
          </span>
          {[
            { id: 'all', label: 'جميع الاهتمامات ⭐' },
            { id: 'sports', label: '⚽ الرياضة والكرة' },
            { id: 'art', label: '🎨 الفن والطرب' },
            { id: 'culture', label: '📚 الثقافة والشعر' },
            { id: 'tech', label: '💡 التقنية وريادة الأعمال' },
            { id: 'gaming', label: '🎮 الألعاب والتحديات' },
          ].map((interest) => (
            <button
              key={interest.id}
              onClick={() => setSelectedInterest(interest.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 text-xs font-bold shrink-0 ${
                selectedInterest === interest.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {interest.label}
            </button>
          ))}
        </div>

        {/* Suggested Voice Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSuggestedRooms.map((suggested) => (
            <div
              key={suggested.id}
              onClick={() => handleJoinSuggestedVoiceRoom(suggested)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#090f1d] border border-indigo-500/30 hover:border-indigo-400/80 p-3 transition-all duration-150 hover:shadow-xl active:scale-[0.99] flex flex-col justify-between"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${suggested.accentGradient}`} />

              <div className="space-y-2">
                {/* Top Badge: Match Score & Live Audio Wave */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-950/80 border border-pink-500/40 text-pink-300 text-[10px] font-black animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                    <Mic className="w-3 h-3 text-pink-400" />
                    <span>صوت حي 🎙️</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg ${suggested.badgeBg} border ${suggested.badgeBorder} ${suggested.badgeText} text-[10px] font-black flex items-center gap-1`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{suggested.matchScore}</span>
                  </span>
                </div>

                {/* Room Info */}
                <div className="flex items-start gap-2.5 text-right">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    {suggested.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                      {suggested.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                      {suggested.description}
                    </p>
                  </div>
                </div>

                {/* Topics / Tags */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  {suggested.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[9.5px] font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action: Speakers count & 1-Click Join Button */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Users className="w-3 h-3" />
                    <span>{suggested.activeSpeakers} على المايك</span>
                  </span>
                  <span>•</span>
                  <span>{suggested.activeListeners} مستمع</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinSuggestedVoiceRoom(suggested);
                  }}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <span>انضمام للمجلس 🎙️</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 6. All Available Rooms List Section */}
      {activeTabSection === 'all' && (
        <div className="space-y-2.5 pt-1">
          
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>جميع الغرف والمجالس المتاحة حالياً</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                {filteredRooms.length}
              </span>
            </h3>

            {/* Country Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-bold">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'egypt', label: 'مصر 🇪🇬' },
                { id: 'ksa', label: 'السعودية 🇸🇦' },
                { id: 'morocco', label: 'المغرب 🇲🇦' },
                { id: 'iraq', label: 'العراق 🇮🇶' },
                { id: 'religious', label: 'دينية 🕌' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCountryFilter(tab.id)}
                  className={`px-2 py-1 rounded-lg whitespace-nowrap transition-all ${
                    selectedCountryFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0d1424]/95 border border-slate-800 hover:border-indigo-500/60 p-3.5 transition-all duration-150 hover:shadow-lg active:scale-[0.99]"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${room.accentGradient}`} />

                <div className="flex items-center justify-between gap-3">
                  
                  {/* Left Action & Real-Time Presence Counter */}
                  <div className="flex flex-col items-start gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <Users className="w-3.5 h-3.5" />
                      <span>{Math.max(1, room.activeUsers || 1)} متواجد الآن</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoom(room);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>دخول</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Center Content: Room Info */}
                  <div className="flex-1 text-right space-y-1 overflow-hidden">
                    {room.isPrivate && (
                      <div className="flex items-center justify-end">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>غرفة خاصة مغلقة</span>
                        </span>
                      </div>
                    )}

                    <h2 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                      {room.title}
                    </h2>

                    <p className="text-xs text-slate-300 truncate">
                      {room.description}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate">
                      {room.subtext}
                    </p>
                  </div>

                  {/* Right Side: Large Circular Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 border-indigo-500/40 shadow-md flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                    {room.icon}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
