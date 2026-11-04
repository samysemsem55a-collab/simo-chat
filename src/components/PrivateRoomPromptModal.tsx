import React, { useState } from 'react';
import { Lock, ShieldAlert, Send, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Room, User } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface PrivateRoomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  currentUser: User;
  onRequestJoin: (roomId: string, message?: string) => Promise<boolean>;
}

export const PrivateRoomPromptModal: React.FC<PrivateRoomPromptModalProps> = ({
  isOpen,
  onClose,
  room,
  currentUser,
  onRequestJoin,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  if (!isOpen || !room) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    sounds.playMessageSent();
    const success = await onRequestJoin(room.id);
    setIsSubmitting(false);
    if (success) {
      setRequestSent(true);
      setTimeout(() => {
        setRequestSent(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0e1626] border border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl p-5 text-center space-y-4">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/30">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1.5">
            <span>مجلس خاص مغلق 🔒</span>
          </div>
          <h3 className="text-base font-black text-white">{room.title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            هذه الغرفة خاصة ومحمية. الدخول مقتصر على مضيف الغرفة والأعضاء المصرح لهم. يمكنك إرسال طلب انضمام للمضيف المالك الآن.
          </p>
        </div>

        {requestSent ? (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تم إرسال طلب الانضمام إلى المضيف بنجاح! بانتظار الموافقة.</span>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إرسال الطلب...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 -rotate-90" />
                  <span>إرسال طلب انضمام للمضيف (Join Request)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition"
            >
              إلغاء والعودة للغرف العامة
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
