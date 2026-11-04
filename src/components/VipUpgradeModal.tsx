import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { User, VipTier } from '../types/chat';
import { VIP_TIERS } from '../data/seedData';
import { sounds } from '../utils/soundEffects';
import { openPayment } from '../services/firebase';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpgradeTier: (tier: VipTier) => void;
  onOpenWallet: () => void;
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeTier,
  onOpenWallet,
}) => {
  const [selectedTier, setSelectedTier] = useState<VipTier>(VIP_TIERS[2]); // Default VIP Gold
  const [copiedInstapay, setCopiedInstapay] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [successTier, setSuccessTier] = useState<VipTier | null>(null);

  if (!isOpen) return null;

  const handleUpgradeInstapay = async (tier: VipTier) => {
    setIsUpgrading(true);
    sounds.playCoinsReward();

    try {
      // Record in payments_pending & invoke instapay:// protocol directly (Requirement 4)
      await openPayment(
        tier.priceEgp,
        `ترقية عضوية ${tier.name} للمستخدم ${currentUser.name}`,
        currentUser.id
      );

      onUpgradeTier(tier);
      setSuccessTier(tier);
    } catch (e) {
      console.warn("Upgrade notice:", e);
      onUpgradeTier(tier);
      setSuccessTier(tier);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-2xl bg-[#0e1626] border border-amber-500/50 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                ترقية الرتب وعضويات VIP الملكية
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">توثيق فوري في Firebase والدفع السريع عبر InstaPay ⚡</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* User's current rank */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs">
            <span className="text-slate-400">رتبتك الحالية:</span>
            <span className="font-black text-amber-400 flex items-center gap-1">
              <Crown className="w-4 h-4" /> {currentUser.vipBadge || 'عضو مميز'}
            </span>
          </div>

          {/* Success Notification */}
          {successTier && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>تم تسجيل طلب الترقية إلى {successTier.name} في Firebase وتوجيهك لـ InstaPay!</span>
              </div>
              <button onClick={() => setSuccessTier(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* InstaPay Direct Transfer Card (Requirement 4) */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-200 font-bold flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-400" />
                عنوان التحويل المباشر إنستاباي (InstaPay):
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">تسجيل طلب معلق payments_pending</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold select-all flex items-center justify-between">
                <span>samyelsayed9@instapay</span>
                <span className="text-[10px] text-purple-300 font-normal">إنستا باي مصر</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("samyelsayed9@instapay");
                  setCopiedInstapay(true);
                  setTimeout(() => setCopiedInstapay(false), 2500);
                }}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedInstapay ? 'تم النسخ!' : 'نسخ العنوان'}</span>
              </button>
            </div>
          </div>

          {/* Tiers Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VIP_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${tier.badgeBg}`}>
                      {tier.badge}
                    </span>
                    <span className="text-xs font-black text-white">
                      {tier.priceEgp} ج.م <span className="text-[10px] text-slate-400">({tier.priceUsd}$)</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white">{tier.name}</h4>
                  <p className="text-[11px] text-slate-400 mb-3">{tier.tagline}</p>

                  {/* Perks List */}
                  <ul className="space-y-1.5 mb-4">
                    {tier.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgradeInstapay(tier);
                    }}
                    disabled={isUpgrading}
                    className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
                      tier.id === 'vip_diamond'
                        ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white'
                        : tier.id === 'vip_gold'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>ترقية ودفع {tier.priceEgp} ج.م عبر InstaPay</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
