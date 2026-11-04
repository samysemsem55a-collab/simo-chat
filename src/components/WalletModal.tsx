import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  Gift, 
  Share2, 
  Check, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { User } from '../types/chat';
import { sounds } from '../utils/soundEffects';
import { openPayment } from '../services/firebase';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUserBalance: (newCoins: number, newEarningsEgp: number) => void;
  currency: 'EGP' | 'USD' | 'SAR' | 'AED';
}

interface RechargePackage {
  coins: number;
  priceEgp: number;
  price: string;
  usd: string;
  badge: string;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUserBalance,
}) => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'free_coins'>('recharge');
  
  // InstaPay Recharge Checkout State
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null);
  const [senderReference, setSenderReference] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<{ id: string; coins: number; amountEgp: number } | null>(null);
  const [copiedInstapay, setCopiedInstapay] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  if (!isOpen) return null;

  const INSTAPAY_ADDRESS = 'samyelsayed9@instapay';
  const OWNER_NAME = 'سامي السيد (مالك المنصة)';

  const rechargePackages: RechargePackage[] = [
    { coins: 1000, price: '50 ج.م', priceEgp: 50, usd: '$1.05', badge: 'باقة المبتدئ 💫' },
    { coins: 5000, price: '200 ج.م', priceEgp: 200, usd: '$4.20', badge: 'الأكثر طلباً 🔥' },
    { coins: 10000, price: '350 ج.م', priceEgp: 350, usd: '$7.35', badge: 'باقة التوفير الملكية 👑' },
    { coins: 25000, price: '800 ج.م', priceEgp: 800, usd: '$16.80', badge: 'باقة كبار الشخصيات VIP 💎' },
  ];

  const handleCopyInstaPay = () => {
    navigator.clipboard.writeText(INSTAPAY_ADDRESS);
    setCopiedInstapay(true);
    sounds.playMessageReceived();
    setTimeout(() => setCopiedInstapay(false), 2500);
  };

  const handleCopyReferral = () => {
    const link = `${window.location.origin}/?ref=${currentUser.id}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    sounds.playCoinsReward();
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Open InstaPay Checkout
  const handleOpenInstaPayCheckout = (pkg: RechargePackage) => {
    sounds.playMessageReceived();
    setSelectedPackage(pkg);
    setPaymentSuccessOrder(null);
  };

  // Confirm and Execute InstaPay Payment Request
  const handleConfirmInstaPayPayment = async () => {
    if (!selectedPackage) return;
    setIsProcessingPayment(true);

    try {
      const note = `شحن ${selectedPackage.coins} كوينز (${selectedPackage.priceEgp} ج.م) - العضو: ${currentUser.name} (${currentUser.id}) - هاتف/مرجع: ${senderPhone.trim() || senderReference.trim() || 'تحويل إنستاباي'}`;
      
      // Registers in payments_pending in Firebase Realtime Database
      const result = await openPayment(selectedPackage.priceEgp, note, currentUser.id);

      sounds.playCoinsReward();
      setPaymentSuccessOrder({
        id: result.orderId || `IPA-${Date.now().toString().slice(-6)}`,
        coins: selectedPackage.coins,
        amountEgp: selectedPackage.priceEgp
      });
      setSelectedPackage(null);
    } catch (e) {
      console.warn("InstaPay payment registration error:", e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>محفظة الكوينز والشحن الرسمي</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-300">
                الشحن اليدوي الحقيقي عبر InstaPay المعتمد
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Current Coins Banner */}
        <div className="p-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-purple-500/10 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <span className="text-[11px] text-slate-400 block">رصيدك الحالي من الكوينز:</span>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {currentUser.coins.toLocaleString()} كوينز
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>دفع آمن 100%</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs: Strictly Recharge & Free Coins */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('recharge'); setPaymentSuccessOrder(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'recharge'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>شحن الكوينز (InstaPay)</span>
          </button>

          <button
            onClick={() => { setActiveTab('free_coins'); setPaymentSuccessOrder(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'free_coins'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>كوينز مجانية بالتفاعل 🎁</span>
          </button>
        </div>

        {/* Tab 1: Official InstaPay Recharge */}
        {activeTab === 'recharge' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Success Notification If Just Registered */}
            {paymentSuccessOrder && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-2 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>تم تسجيل طلب الشحن بنجاح وهو الآن قيد المراجعة المعلقة!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تم إرسال طلب شحن <span className="text-amber-400 font-bold">{paymentSuccessOrder.coins.toLocaleString()} كوينز</span> بقيمة <span className="text-white font-bold">{paymentSuccessOrder.amountEgp} ج.م</span> إلى لوحة إدارة صاحب المنصة. سيتم التحقق من التحويل وإيداع الكوينز في حسابك فوراً.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  رقم مرجع الطلب: {paymentSuccessOrder.id}
                </div>
              </div>
            )}

            {/* Official InstaPay Transfer Account Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <span>عنوان إنستاباي الرسمي للتحويل:</span>
                </span>
                <span className="text-[10px] text-slate-400">حساب المالك المعتمد</span>
              </div>

              {/* InstaPay Address Box with Copy Button */}
              <div className="flex items-center justify-between bg-slate-950/90 border border-purple-500/50 p-2.5 rounded-xl">
                <div className="space-y-0.5">
                  <span className="font-mono text-sm sm:text-base font-black text-amber-400 select-all tracking-wide">
                    {INSTAPAY_ADDRESS}
                  </span>
                  <p className="text-[10px] text-slate-300 font-medium">{OWNER_NAME}</p>
                </div>

                <button
                  onClick={handleCopyInstaPay}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow transition-all shrink-0"
                >
                  {copiedInstapay ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-300 flex items-center gap-1.5 bg-black/30 p-2 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>قم بالتحويل عبر تطبيق InstaPay ثم سجل بيانات التحويل أدناه لتفعيل الكوينز فوراً.</span>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white flex items-center justify-between">
                <span>اختر باقة الكوينز المطلوبة:</span>
                <span className="text-[10px] text-amber-400 font-normal">أسعار رسمية ثابتة</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rechargePackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenInstaPayCheckout(pkg)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                      selectedPackage?.coins === pkg.coins
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {pkg.badge}
                      </span>
                      <span className="text-[10px] text-slate-400">{pkg.usd}</span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xl">🪙</span>
                        <span className="text-base font-black text-white">
                          {pkg.coins.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">كوينز</span>
                      </div>
                      <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        {pkg.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form Modal / Drawer if Package is Selected */}
            {selectedPackage && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-white">
                    <span>تأكيد شحن باقة {selectedPackage.coins.toLocaleString()} كوينز</span>
                  </div>
                  <button onClick={() => setSelectedPackage(null)} className="text-slate-400 hover:text-white p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">
                      رقم الهاتف المحول منه أو اسم صاحب الحساب في إنستاباي:
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="مثال: 010xxxxxxxx أو اسمك على إنستاباي"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">
                      المرجع أو ملاحظة التحويل (اختياري):
                    </label>
                    <input
                      type="text"
                      value={senderReference}
                      onChange={(e) => setSenderReference(e.target.value)}
                      placeholder="رقم العملية المرجعي أو كود التحويل"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">المبلغ المطلوب تحويله:</span>
                    <span className="font-black text-amber-400 text-sm">{selectedPackage.price}</span>
                  </div>

                  <button
                    onClick={handleConfirmInstaPayPayment}
                    disabled={isProcessingPayment}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <span>جاري التسجيل...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تسجيل طلب الشحن المعلق</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Platform Financial Policy Notice */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300 font-bold">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>إشعار الشفافية والأمان المالي:</span>
              </div>
              <p>
                جميع التحويلات المالية في التطبيق تتم حصرياً لصالح إدارة شات مصر والعرب لتغطية تكاليف السيرفرات والتطوير. لا يوجد أي سحب أرباح للمستخدمين، وتُستخدم الكوينز حصرياً للميزات التفاعلية والإهداء داخل المنصة.
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Free Coins via Interactions & Referrals */}
        {activeTab === 'free_coins' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Invite Friends Section */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>دعوة الأصدقاء (+250 كوينز مجاناً)</span>
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  مكافأة فورية
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                شارك رابط دعوتك الخاص مع أصدقائك في واتساب ومواقع التواصل. عند انضمام أي صديق عبر رابطك، ستحصل تلقائياً على 250 كوينز مجانية تشجيعية!
              </p>

              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${currentUser.id}` : ''}
                </span>

                <button
                  onClick={handleCopyReferral}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow"
                >
                  {copiedReferral ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Daily Missions & Engagement Rewards */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>مكافآت التفاعل اليومية المجانية:</span>
              </label>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <span className="text-xs font-bold text-white block">إرسال 5 رسائل في الغرف</span>
                      <span className="text-[10px] text-slate-400">مهمة يومية متجددة</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                    +50 كوينز 🪙
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <div>
                      <span className="text-xs font-bold text-white block">التواجد 10 دقائق في الشات</span>
                      <span className="text-[10px] text-slate-400">مكافأة الحضور والتفاعل</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                    +100 كوينز 🪙
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎁</span>
                    <div>
                      <span className="text-xs font-bold text-white block">إهداء صديق في أي غرفة</span>
                      <span className="text-[10px] text-slate-400">مكافأة الكرم والود</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                    +150 كوينز 🪙
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
