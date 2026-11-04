import React from 'react';
import { X, Users, Check, UserX, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface JoinRequestItem {
  userId: string;
  userName: string;
  userAvatar?: string;
  requestedAt: number;
}

interface JoinRequestsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: JoinRequestItem[];
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
  roomTitle: string;
}

export const JoinRequestsManagerModal: React.FC<JoinRequestsManagerModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAccept,
  onReject,
  roomTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0e1626] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">طلبات الانضمام للمجلس الخاص</h3>
              <p className="text-[11px] text-slate-400">{roomTitle}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              لا توجد طلبات انضمام معلقة حالياً في هذا المجلس.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.userId}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={req.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.userId}`}
                    alt={req.userName}
                    className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-black text-white">{req.userName}</h4>
                    <span className="text-[10px] text-slate-400">
                      طلب قبل {Math.max(1, Math.round((Date.now() - req.requestedAt) / 60000))} دقيقة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      sounds.playCoinsReward();
                      onAccept(req.userId);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>قبول</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playMicToggle(false);
                      onReject(req.userId);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 font-bold text-xs border border-slate-700 transition"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
