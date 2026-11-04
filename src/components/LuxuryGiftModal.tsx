import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Coins, 
  Send, 
  Crown, 
  Flame, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GiftItem, User, SpeakerSeat } from '../types/chat';
import { LUXURY_GIFTS, isUserAdminOrOwner } from '../data/seedData';
import { sounds } from '../utils/soundEffects';

interface LuxuryGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  speakers: SpeakerSeat[];
  onSendGift: (gift: GiftItem, recipientName: string) => void;
  onOpenWallet: () => void;
}

export const LuxuryGiftModal: React.FC<LuxuryGiftModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  speakers,
  onSendGift,
  onOpenWallet,
}) => {
  const [selectedGift, setSelectedGift] = useState<GiftItem>(LUXURY_GIFTS[0]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>(
    speakers.find(s => s.user && s.user.id !== currentUser.id)?.user?.name || 'مضيف المجلس'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = isUserAdminOrOwner(currentUser);

  const handleSend = () => {
    if (!isOwner && currentUser.coins < selectedGift.cost) {
      setErrorMsg(`رصيدك غير كافٍ! تحتاج إلى ${selectedGift.cost - currentUser.coins} كوينز إضافية.`);
      return;
    }

    sounds.playGiftFanfare();

    // Trigger explosive celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSendGift(selectedGift, selectedRecipient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-[#0e1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-pink-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                متجر الهدايا الفاخرة
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">أبهر المجلس بمؤثرات خرافية وشاشة كاملة</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* User Balance Strip */}
          <div className="flex items-center justify-between bg-slate-900/90 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">رصيدك الحالي:</span>
              <span className="text-amber-400 font-black text-sm flex items-center gap-1">
                🪙 {currentUser.coins.toLocaleString()} كوينز
              </span>
            </div>

            {isOwner ? (
              <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>حساب المالك/المطور: هدايا مجانية ومفتوحة</span>
              </span>
            ) : (
              <button
                onClick={onOpenWallet}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                + شحن سريع
              </button>
            )}
          </div>

          {/* Recipient Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              إهداء إلى:
            </label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full bg-[#121c32] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="مضيف المجلس 👑">مضيف المجلس 👑</option>
              {speakers
                .filter(s => s.user && s.user.id !== currentUser.id)
                .map(s => (
                  <option key={s.seatId} value={s.user!.name}>
                    المقعد #{s.seatId}: {s.user!.name} ({s.user!.countryFlag})
                  </option>
                ))}
              <option value="كل المتحدثين على المنصة 🌟">كل المتحدثين على المنصة 🌟</option>
            </select>
          </div>

          {/* Luxury Gifts Grid */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              اختر هديتك:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LUXURY_GIFTS.map((gift) => {
                const isSelected = selectedGift.id === gift.id;
                return (
                  <div
                    key={gift.id}
                    onClick={() => {
                      setSelectedGift(gift);
                      setErrorMsg(null);
                    }}
                    className={`relative p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-900/60 to-indigo-950 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.03]'
                        : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Cost Tag */}
                    <span className="absolute top-1.5 right-2 text-[10px] font-black text-amber-300 flex items-center gap-0.5">
                      🪙 {gift.cost}
                    </span>

                    {/* Gift Icon */}
                    <div className="text-3xl my-2 animate-pulse">
                      {gift.icon}
                    </div>

                    {/* Gift Name */}
                    <span className="text-[11px] font-bold text-white text-center truncate w-full">
                      {gift.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Gift Banner Info */}
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 text-center space-y-1">
            <p className="text-xs font-black text-amber-300">
              « {selectedGift.bannerText} »
            </p>
            <p className="text-[11px] text-slate-400">
              سيظهر إشعار فخم على كامل شاشة الغرفة مع أنيميشن وتأثير صوتي ملكي
            </p>
          </div>

          {/* Error Message if not enough coins */}
          {errorMsg && (
            <div className="bg-red-950/60 border border-red-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={onOpenWallet}
                className="underline font-bold text-amber-300 ml-2"
              >
                شحن الآن
              </button>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>إرسال {selectedGift.name} ({selectedGift.cost} 🪙)</span>
          </button>

        </div>

      </div>
    </div>
  );
};
