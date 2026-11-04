import React from 'react';
import { 
  X, 
  Target, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  Coins, 
  MessageSquare, 
  Mic, 
  UserCheck, 
  Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyMission, User } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: DailyMission[];
  onClaimReward: (missionId: string) => void;
  currentUser: User;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaimReward,
  currentUser,
}) => {
  if (!isOpen) return null;

  const totalRewards = missions.reduce((acc, m) => acc + m.rewardCoins, 0);
  const completedCount = missions.filter(m => m.isCompleted).length;

  const handleClaim = (mission: DailyMission) => {
    sounds.playCoinsReward();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClaimReward(mission.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-[#0e1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-purple-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                المهام اليومية والمكافآت
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">أكمل مهامك اليومية واحصل على كوينز مجانية 🪙</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              إنجاز اليوم:
            </span>
            <span className="text-amber-400 font-black">
              {completedCount} من {missions.length} مكتملة
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(completedCount / missions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Missions List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {missions.map((mission) => {
            const isReadyToClaim = mission.isCompleted && !mission.isClaimed;
            const progressPercent = Math.min(100, Math.round((mission.currentProgress / mission.targetProgress) * 100));

            return (
              <div 
                key={mission.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  mission.isClaimed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : isReadyToClaim
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {mission.icon}
                  </div>

                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white">{mission.title}</h4>
                      <span className="text-[11px] font-black text-amber-400 flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />
                        +{mission.rewardCoins}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">{mission.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {mission.currentProgress}/{mission.targetProgress}
                      </span>
                    </div>
                  </div>

                  {/* Claim Button / Status */}
                  <div className="shrink-0">
                    {mission.isClaimed ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        تم الاستلام
                      </span>
                    ) : isReadyToClaim ? (
                      <button
                        onClick={() => handleClaim(mission)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        استلام
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-[10px] font-bold">
                        قيد الإنجاز
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400">
          تتجدد المهام يومياً في تمام الساعة 12:00 منتصف الليل بتوقيت القاهرة 🇪🇬
        </div>

      </div>
    </div>
  );
};
