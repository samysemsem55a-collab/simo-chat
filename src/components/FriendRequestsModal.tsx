import React from 'react';
import { 
  X, 
  UserPlus, 
  Check, 
  X as XIcon, 
  MessageCircle,
  Clock
} from 'lucide-react';
import { FriendRequest } from '../types/chat';

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (req: FriendRequest) => void;
  onDecline: (reqId: string) => void;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-[#0e1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">طلبات الصداقة الواردة</h3>
              <p className="text-[11px] text-slate-400">
                لديك {requests.length} طلبات جديدة
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Requests List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-xl">
                👥
              </div>
              <p className="text-xs font-bold">لا توجد طلبات صداقة معلقة حالياً</p>
              <p className="text-[11px] text-slate-400">انضم للمجالس وتعرف على أصدقاء جدد وأرسل واستقبل طلبات الصداقة!</p>
            </div>
          ) : (
            requests.map((req) => (
              <div 
                key={req.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/40 bg-slate-800 shrink-0">
                    {req.senderAvatar ? (
                      <img src={req.senderAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-xs font-bold text-white">
                        {req.senderName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate">{req.senderName}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAccept(req)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>قبول</span>
                  </button>
                  <button
                    onClick={() => onDecline(req.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors"
                    title="رفض الطلب"
                  >
                    <XIcon className="w-3.5 h-3.5" />
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
