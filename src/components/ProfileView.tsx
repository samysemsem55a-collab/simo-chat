import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  Save, 
  Wallet, 
  Share2, 
  Type, 
  Palette, 
  Check, 
  Camera,
  Coins,
  Upload,
  UserCheck,
  MessageSquare,
  MessageSquareOff
} from 'lucide-react';
import { User } from '../types/chat';
import { AVATAR_PRESETS } from '../data/seedData';
import { sounds } from '../utils/soundEffects';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onOpenWallet: () => void;
  onOpenVip: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenWallet,
  onOpenVip,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [country, setCountry] = useState(currentUser.country);
  const [countryFlag, setCountryFlag] = useState(currentUser.countryFlag);
  const [fontPreference, setFontPreference] = useState(currentUser.fontPreference);
  const [selectedWallpaper, setSelectedWallpaper] = useState(currentUser.profileWallpaper);
  const [selectedFrame, setSelectedFrame] = useState(currentUser.frameStyle);
  const [isSaved, setIsSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [avatarTab, setAvatarTab] = useState<'preset' | 'upload'>('preset');
  const [allowPrivateMessages, setAllowPrivateMessages] = useState<boolean>(currentUser.allowPrivateMessages !== false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const countries = [
    { name: 'مصر', flag: '🇪🇬' },
    { name: 'السعودية', flag: '🇸🇦' },
    { name: 'الإمارات', flag: '🇦🇪' },
    { name: 'المغرب', flag: '🇲🇦' },
    { name: 'الجزائر', flag: '🇩🇿' },
    { name: 'العراق', flag: '🇮🇶' },
    { name: 'الكويت', flag: '🇰🇼' },
    { name: 'سوريا', flag: '🇸🇾' },
    { name: 'الأردن', flag: '🇯🇴' },
    { name: 'فلسطين', flag: '🇵🇸' },
    { name: 'لبنان', flag: '🇱🇧' },
    { name: 'تونس', flag: '🇹🇳' },
    { name: 'اليمن', flag: '🇾🇪' },
    { name: 'السودان', flag: '🇸🇩' },
    { name: 'ليبيا', flag: '🇱🇾' },
    { name: 'عمان', flag: '🇴🇲' },
  ];

  const wallpapers = [
    { name: 'غروب نيل القاهرة 🌅', url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&auto=format&fit=crop&q=80' },
    { name: 'سماء الأهرامات والنجوم 🌌', url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop&q=80' },
    { name: 'الفضاء والأورورا الملكية 🌠', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=800&auto=format&fit=crop&q=80' },
    { name: 'الزخارف الإسلامية العريقة 🕌', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80' },
  ];

  const frames = [
    { name: 'ذهبي ملكي متوهج', class: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]' },
    { name: 'ألماسي نيون مشع', class: 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]' },
    { name: 'إمبراطوري بنفسجي', class: 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]' },
    { name: 'بسيط كلاسيكي', class: 'border-slate-600' }
  ];

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          sounds.playMessageSent();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playMessageSent();
    onUpdateUser({
      name,
      bio,
      country,
      countryFlag,
      fontPreference,
      profileWallpaper: selectedWallpaper,
      frameStyle: selectedFrame,
      avatar: avatarUrl,
      allowPrivateMessages
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleShareInvite = () => {
    sounds.playCoinsReward();
    navigator.clipboard?.writeText(window.location.href);
    alert('🎁 تم نسخ رابط الدعوة الخاص بك! شاركه مع أصدقائك واكسب 500 كوينز مجانية عند انضمامهم.');
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-3xl mx-auto space-y-4">
      
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-900">
        
        {/* Profile Wallpaper Cover */}
        <div className="h-28 sm:h-36 w-full overflow-hidden relative">
          <img 
            src={selectedWallpaper} 
            alt="Cover" 
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-transparent to-black/30" />
        </div>

        {/* Profile Details Bar */}
        <div className="px-4 pb-4 pt-0 relative -mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          
          <div className="flex items-end gap-3">
            {/* Avatar with Live Indicator & Selected Frame */}
            <div className="relative">
              <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 bg-slate-900 shrink-0 relative ${selectedFrame}`}>
                <img 
                  src={avatarUrl} 
                  alt={name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0e1626] rounded-full shadow-[0_0_8px_#10b981]"></span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-white">{name}</h2>
                <span className="text-base">{countryFlag}</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-600/40 px-1.5 py-0.2 rounded-full">
                  ● متصل حي
                </span>
              </div>
              <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> {currentUser.vipBadge || 'VIP ذهبي'}
              </p>
              <span className="text-[10px] text-slate-400">@{currentUser.username} • عضو نشط في شات مصر والعرب</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVip}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow"
            >
              ترقية VIP 👑
            </button>
            <button
              onClick={onOpenWallet}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              المحفظة 🪙
            </button>
          </div>

        </div>

      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-[#0e1626] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <div>
              <h3 className="text-sm font-black text-white">شارات الإنجاز المكتسبة</h3>
              <p className="text-[11px] text-slate-400">شارات ملكية تظهر في بروفايلك ورسائلك في الشات</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-bold">
            {(currentUser.badges || ['عضو نشط']).length} شارات
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'top_gifter', name: 'أكثر الهدايا', icon: '🎁', desc: 'إرسال هدايا فاخرة', unlocked: currentUser.badges?.includes('أكثر الهدايا') || (currentUser.totalGiftsSent || 0) > 0 },
            { id: 'active_member', name: 'عضو نشط', icon: '⚡', desc: 'التفاعل والمشاركة المستمرة', unlocked: currentUser.badges?.includes('عضو نشط') || true },
            { id: 'diamond_voice', name: 'صوت ماسي', icon: '🎙️', desc: 'المشاركة على منصة الصوت', unlocked: currentUser.badges?.includes('صوت ماسي') },
            { id: 'distinguished_host', name: 'مضيف متميز', icon: '👑', desc: 'إدارة مجلس لايف ناجح', unlocked: currentUser.role === 'vip_diamond' || currentUser.badges?.includes('مضيف متميز') },
          ].map((badge) => (
            <div 
              key={badge.id}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <h4 className="text-xs font-black text-white">{badge.name}</h4>
              <p className="text-[10px] text-slate-400">{badge.desc}</p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                badge.unlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {badge.unlocked ? '✓ مكتسبة' : '🔒 قيد الإنجاز'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-[#0e1626] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          تعديل الملف الشخصي واختيار الصورة أو الأفتار
        </h3>

        {isSaved && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تم حفظ التعديلات بنجاح وتحديث صورتك وملفك الشخصي!</span>
          </div>
        )}

        {/* Avatar Selection: Upload or Curated Presets */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            صورة الملف الشخصي أو الأفتار:
          </label>

          <div className="flex items-center gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => setAvatarTab('preset')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                avatarTab === 'preset'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              اختيار أفتار جاهز 👤
            </button>
            <button
              type="button"
              onClick={() => setAvatarTab('upload')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                avatarTab === 'upload'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              رفع صورة من جهازي 📷
            </button>
          </div>

          {avatarTab === 'preset' ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-slate-900/60 rounded-2xl border border-slate-800">
              {AVATAR_PRESETS.map((av) => (
                <div
                  key={av.id}
                  onClick={() => setAvatarUrl(av.url)}
                  className={`relative rounded-full overflow-hidden cursor-pointer aspect-square border-2 transition-all ${
                    avatarUrl === av.url ? 'border-amber-400 scale-110 shadow-[0_0_10px_#f59e0b]' : 'border-slate-700 hover:border-slate-500'
                  }`}
                  title={av.label}
                >
                  <img src={av.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCustomFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/50 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 mx-auto"
              >
                <Upload className="w-4 h-4" />
                <span>اختر صورة من هاتفك أو حاسوبك</span>
              </button>
              <p className="text-[10px] text-slate-400">تدعم صيغ JPG، PNG، WEBP بحجم أقصى 5 ميجابايت</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">الاسم المعروض:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121c32] border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">الدولة والعلم:</label>
            <select
              value={country}
              onChange={(e) => {
                const found = countries.find(c => c.name === e.target.value);
                setCountry(e.target.value);
                if (found) setCountryFlag(found.flag);
              }}
              className="w-full bg-[#121c32] border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {countries.map(c => (
                <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">النبذة التعريفية (Bio):</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full bg-[#121c32] border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="اكتب نبذة مميزة عنك تعبر عن شخصيتك..."
          />
        </div>

        {/* Font Selection */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            نوع الخط العربي المميز في الشات:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cairo', name: 'خط كايرو العصري', font: 'font-["Cairo"]' },
              { id: 'tajawal', name: 'خط تجوال الأنيق', font: 'font-["Tajawal"]' },
              { id: 'amiri', name: 'خط أميري الملكي', font: 'font-["Amiri"]' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontPreference(f.id as 'cairo' | 'tajawal' | 'amiri')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  fontPreference === f.id
                    ? 'border-indigo-500 bg-indigo-950/60 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <span className={`text-[11px] block ${f.font}`}>{f.name}</span>
                <span className={`text-sm block mt-0.5 ${f.font}`}>شات مصر والعرب</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wallpaper Selection */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            خلفية بروفايلك الملكية:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {wallpapers.map((w, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedWallpaper(w.url)}
                className={`relative rounded-xl overflow-hidden cursor-pointer h-14 border-2 transition-all ${
                  selectedWallpaper === w.url ? 'border-amber-400 scale-[1.02]' : 'border-slate-800'
                }`}
              >
                <img src={w.url} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold text-center px-1">
                  {w.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Frames Selection */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            إطار الصورة الرمزية:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {frames.map((fr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedFrame(fr.class)}
                className={`p-2 rounded-xl border text-center font-bold transition-all text-[11px] ${
                  selectedFrame === fr.class
                    ? 'border-amber-400 bg-amber-950/50 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                {fr.name}
              </button>
            ))}
          </div>
        </div>

        {/* Private Messages Toggle (خيار إيقاف الرسائل الخاصة في الملف الشخصي) */}
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              allowPrivateMessages 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {allowPrivateMessages ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>استقبال الرسائل والمحادثات الخاصة</span>
                <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                  allowPrivateMessages ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {allowPrivateMessages ? 'مفعّل 🟢' : 'معطّل 🔴'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                {allowPrivateMessages 
                  ? 'مفعّل: يمكن للمستخدمين محادثتك وإرسال رسائل خاصة لك' 
                  : 'معطّل: تم إيقاف استقبال الرسائل الخاصة لحظر الإزعاج وحماية الخصوصية'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !allowPrivateMessages;
              setAllowPrivateMessages(next);
              sounds.playMicToggle(next);
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex items-center shrink-0 ${
              allowPrivateMessages ? 'bg-emerald-600 justify-start' : 'bg-slate-700 justify-end'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-1">
          <button
            type="submit"
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات وتفضيلات الملف الشخصي</span>
          </button>
        </div>

      </form>

      {/* Share and Referral Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-600/40 rounded-3xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            شارك التطبيق واكسب كوينز مجاناً
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5">
            احصل على 500 كوينز فورية لكل صديق يسجل عن طريق رابطك الخاص
          </p>
        </div>

        <button
          onClick={handleShareInvite}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow shrink-0 active:scale-95 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة</span>
        </button>
      </div>

    </div>
  );
};
