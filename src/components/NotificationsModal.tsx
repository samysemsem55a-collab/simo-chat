import React from 'react';
import { 
  X, 
  Bell, 
  Gift, 
  Coins, 
  Sparkles, 
  Crown, 
  MessageCircle,
  TrendingUp
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenWallet,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      icon: '🎁',
      title: 'استلام هدية برج القاهرة!',
      desc: 'أرسل لك أبو فهد الكويتي هدية برج القاهرة المضيء في الغرفة العامة (+1000 كوينز أرباح).',
      time: 'منذ 5 دقائق',
      action: 'عرض الأرباح',
      isNew: true
    },
    {
      id: 'n2',
      icon: '👑',
      title: 'ترقية رتبتك إلى VIP ذهبي!',
      desc: 'تم تفعيل صلاحيات الإشراف، المايك المفتوح، وتوهج الاسم الذهبي.',
      time: 'منذ ساعتين',
      action: null,
      isNew: true
    },
    {
      id: 'n3',
      icon: '✨',
      title: 'بدء المسابقة الثقافية الكبرى!',
      desc: 'غرفة الألعاب والمسابقات تشهد الآن منافسة حية بجوائز 5,000 كوينز كاش.',
      time: 'منذ 3 ساعات',
      action: null,
      isNew: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-[#0e1626] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">مركز الإشعارات الفورية</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-3 space-y-2 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                n.isNew
                  ? 'bg-indigo-950/40 border-indigo-700/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">{n.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.desc}</p>
                {n.action && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWallet();
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:underline mt-1 block"
                  >
                    {n.action} ←
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
