import React, { useEffect } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { GiftItem } from '../types/chat';

interface FullscreenGiftOverlayProps {
  gift: GiftItem | null;
  senderName: string;
  recipientName: string;
  onDismiss: () => void;
}

export const FullscreenGiftOverlay: React.FC<FullscreenGiftOverlayProps> = ({
  gift,
  senderName,
  recipientName,
  onDismiss,
}) => {
  useEffect(() => {
    if (!gift) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [gift, onDismiss]);

  if (!gift) return null;

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-50 pointer-events-auto flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      {/* Glowing Backdrop Aura */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-600/30 blur-3xl animate-pulse pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4 max-w-md mx-auto">
        
        {/* Top VIP Announcement */}
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce">
          <Crown className="w-4 h-4 fill-slate-950" />
          <span>إهداء ملكي فاخر في سماء شات العرب</span>
          <Sparkles className="w-4 h-4 fill-slate-950" />
        </div>

        {/* Large Animated Gift Graphic */}
        <div className="relative my-4">
          <div className="text-7xl sm:text-9xl animate-gift-float filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]">
            {gift.icon}
          </div>
        </div>

        {/* Banner Details Card */}
        <div className="bg-[#0f172a]/95 border-2 border-amber-400/80 rounded-3xl p-5 shadow-[0_0_35px_rgba(245,158,11,0.4)] backdrop-blur-md space-y-2 max-w-sm w-full">
          <h2 className="text-xl sm:text-2xl font-black text-amber-300">
            {gift.name}
          </h2>
          
          <p className="text-sm sm:text-base text-white font-bold">
            <span className="text-amber-400">{senderName}</span>
            <span className="text-slate-300 mx-1">أهدى</span>
            <span className="text-pink-400">{recipientName}</span>
          </p>

          <p className="text-xs text-slate-300/90 font-medium italic">
            « {gift.bannerText} »
          </p>

          <div className="pt-2 flex items-center justify-center gap-1 text-xs font-black text-amber-400">
            <span>🪙 {gift.cost.toLocaleString()} كوينز</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 animate-pulse">
          (انقر في أي مكان للإغلاق)
        </p>

      </div>
    </div>
  );
};
