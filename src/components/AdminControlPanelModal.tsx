import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  Ban, 
  VolumeX, 
  Volume2, 
  Coins, 
  Award, 
  Search, 
  Check, 
  Radio, 
  UserCheck, 
  Megaphone,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { User, UserRole } from '../types/chat';
import { 
  adminUpdateUser, 
  subscribeToAllUsers, 
  sendFirestoreMessage,
  subscribeToPendingPayments,
  approvePendingPayment,
  rejectPendingPayment,
  PendingPaymentOrder
} from '../services/firebase';
import { sounds } from '../utils/soundEffects';

interface AdminControlPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onUserModified?: (updatedUser: Partial<User> & { id: string }) => void;
}

export const AdminControlPanelModal: React.FC<AdminControlPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUserModified
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<User[]>(allUsers);
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentOrder[]>([]);

  useEffect(() => {
    setUsersList(allUsers);
  }, [allUsers]);

  // Subscribe to real-time users from Firebase Realtime Database
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToAllUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsersList(prev => {
          const map = new Map<string, User>();
          prev.forEach(u => map.set(u.id, u));
          liveUsers.forEach(u => map.set(u.id, { ...map.get(u.id), ...u }));
          return Array.from(map.values());
        });
      }
    });
    return () => unsub();
  }, [isOpen]);

  // Subscribe to pending InstaPay payments from Firebase RTDB
  useEffect(() => {
    if (!isOpen) return;
    const unsubPay = subscribeToPendingPayments((orders) => {
      setPendingPayments(orders);
    });
    return () => unsubPay();
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Approve Pending Payment and Deposit Coins
  const handleApprovePayment = async (order: PendingPaymentOrder) => {
    sounds.playCoinsReward();
    // Calculate coins if not stored: 50 EGP -> 1000, 200 -> 5000, 350 -> 10000, 800 -> 25000 or 25 coins per EGP
    const coinsToAdd = order.coins || (order.amount === 50 ? 1000 : order.amount === 200 ? 5000 : order.amount === 350 ? 10000 : order.amount === 800 ? 25000 : Math.round(order.amount * 25));
    
    await approvePendingPayment(order.id, order.userId, coinsToAdd);
    setPendingPayments(prev => prev.map(p => p.id === order.id ? { ...p, status: 'approved' } : p));
    showNotification(`تمت الموافقة وإيداع +${coinsToAdd.toLocaleString()} كوينز في حساب العضو بنجاح! 🪙`);
  };

  // Reject Pending Payment
  const handleRejectPayment = async (orderId: string) => {
    sounds.playMessageReceived();
    await rejectPendingPayment(orderId);
    setPendingPayments(prev => prev.map(p => p.id === orderId ? { ...p, status: 'rejected' } : p));
    showNotification(`تم رفض طلب الشحن.`);
  };

  // 1. Upgrade User VIP Tier
  const handleSetRole = async (targetUser: User, newRole: UserRole, badgeName: string) => {
    sounds.playCoinsReward();
    const updates: Partial<User> = {
      role: newRole,
      vipBadge: badgeName,
      frameStyle: newRole === 'vip_diamond' 
        ? 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.8)]' 
        : newRole === 'vip_gold' 
        ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
        : 'border-slate-600'
    };

    await adminUpdateUser(targetUser.id, updates);
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updates } : u));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onUserModified) onUserModified({ id: targetUser.id, ...updates });
    showNotification(`تمت ترقية ${targetUser.name} إلى ${badgeName} بنجاح! ⭐`);
  };

  // 2. Ban / Unban User
  const handleToggleBan = async (targetUser: User) => {
    const isNowBanned = !targetUser.isBanned;
    sounds.playMessageReceived();
    const updates = { isBanned: isNowBanned };

    await adminUpdateUser(targetUser.id, updates);
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updates } : u));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onUserModified) onUserModified({ id: targetUser.id, ...updates });
    showNotification(isNowBanned ? `تم حظر ${targetUser.name} من المنصة فورياً 🚫` : `تم فك حظر ${targetUser.name} بنجاح ✅`);
  };

  // 3. Mute / Unmute User
  const handleToggleMute = async (targetUser: User) => {
    const isNowMuted = !targetUser.isMuted;
    sounds.playMicToggle(false);
    const updates = { isMuted: isNowMuted };

    await adminUpdateUser(targetUser.id, updates);
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updates } : u));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onUserModified) onUserModified({ id: targetUser.id, ...updates });
    showNotification(isNowMuted ? `تم كتم صوت ورسائل ${targetUser.name} 🔇` : `تم إلغاء كتم ${targetUser.name} 🔊`);
  };

  // 4. Grant Coins to User
  const handleAddCoins = async (targetUser: User, amount: number) => {
    sounds.playCoinsReward();
    const newCoins = (targetUser.coins || 0) + amount;
    const updates = { coins: newCoins };

    await adminUpdateUser(targetUser.id, updates);
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updates } : u));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onUserModified) onUserModified({ id: targetUser.id, ...updates });
    showNotification(`تمت إضافة +${amount.toLocaleString()} كوينز إلى حساب ${targetUser.name} 🪙`);
  };

  // 5. Award Badge to User
  const handleAddBadge = async (targetUser: User, badgeTitle: string) => {
    sounds.playCoinsReward();
    const existing = targetUser.badges || [];
    if (existing.includes(badgeTitle)) {
      showNotification(`العضو يمتلك شارة "${badgeTitle}" بالفعل!`);
      return;
    }
    const updatedBadges = [...existing, badgeTitle];
    const updates = { badges: updatedBadges };

    await adminUpdateUser(targetUser.id, updates);
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updates } : u));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onUserModified) onUserModified({ id: targetUser.id, ...updates });
    showNotification(`تم منح شارة "${badgeTitle}" لـ ${targetUser.name} بنجاح! 🎖️`);
  };

  // 6. Send Broadcast Announcement to Room
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    sounds.playMessageSent();
    await sendFirestoreMessage('room_general', {
      senderId: currentUser.id,
      senderName: 'إدارة شات مصر والعرب 🛡️',
      senderRole: 'owner',
      senderVipBadge: 'مدير النظام',
      type: 'text',
      content: `📢 [إعلان رسمي من الإدارة]: ${broadcastText.trim()}`,
      timestamp: Date.now()
    });

    setBroadcastText('');
    showNotification('تم بث الإعلان الإداري للجميع بنجاح في الغرفة العامة! 📢');
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0b111e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">لوحة تحكم المدير والإشراف العام</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  قاعدة البيانات متصلة لحظياً
                </span>
              </div>
              <p className="text-xs text-slate-300">ترقية VIP، الحظر والكتم الفوري، شحن الكوينز، ومنح الشارات</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Notice Notification */}
        {actionNotice && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-inner animate-in fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Switcher: Users vs Pending InstaPay Payments */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900 border-b border-slate-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>إدارة الأعضاء والرتب ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>شحنات InstaPay المعلقة</span>
            {pendingPayments.filter(p => p.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {pendingPayments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {activeTab === 'payments' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <span>طلبات تحويلات InstaPay المسجلة (payments_pending)</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    مراجعة التحويلات المالية الحقيقية المحولة لعنوان samyelsayed9@instapay واعتماد الكوينز يدوياً
                  </p>
                </div>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                  <Coins className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-bold">لا توجد طلبات شحن مسجلة حالياً</p>
                  <p className="text-[11px] text-slate-500">عند قيام أي عضو بتسجيل تحويل إنستاباي ستظهر بياناته هنا فورياً</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingPayments.map((order) => {
                    const targetUser = usersList.find(u => u.id === order.userId);
                    const isPending = order.status === 'pending';
                    const coinsCalculated = order.coins || (order.amount === 50 ? 1000 : order.amount === 200 ? 5000 : order.amount === 350 ? 10000 : order.amount === 800 ? 25000 : Math.round(order.amount * 25));

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isPending 
                            ? 'bg-slate-900/90 border-amber-500/50 shadow-md' 
                            : order.status === 'approved'
                            ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                            : 'bg-red-950/20 border-red-800/40 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                                {order.amount} ج.م EGP
                              </span>
                              <span className="text-xs font-black text-white">
                                🪙 +{coinsCalculated.toLocaleString()} كوينز
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isPending 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                                  : order.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {isPending ? '⏳ قيد المراجعة المعلقة' : order.status === 'approved' ? '✅ تم الاعتماد والإيداع' : '❌ مرفوض'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-200">
                              <span className="text-slate-400">العضو: </span>
                              <span className="font-bold text-white">{targetUser?.name || order.userId}</span>
                              <span className="text-slate-400 mr-2"> ({order.userId})</span>
                            </p>

                            <p className="text-[11px] text-slate-300 font-medium">
                              <span className="text-slate-400">بيانات التحويل/الملاحظة: </span>
                              {order.note || 'تحويل إنستاباي'}
                            </p>

                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(order.timestamp).toLocaleString('ar-EG')}
                            </div>
                          </div>

                          {/* Actions if Pending */}
                          {isPending && (
                            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                              <button
                                onClick={() => handleApprovePayment(order)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1 shadow active:scale-95 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>موافقة وإيداع الكوينز</span>
                              </button>

                              <button
                                onClick={() => handleRejectPayment(order.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-bold transition-all active:scale-95"
                              >
                                <span>رفض</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
          {/* Quick Broadcast Section */}
          <form onSubmit={handleSendBroadcast} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Megaphone className="w-4 h-4" />
              <span>إرسال تعميم إداري فوري لجميع الغرف المتصلة:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="اكتب رسالة الإعلان الإداري هنا لتظهر لجميع الأعضاء لحظياً..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all shrink-0"
              >
                بث الآن 📢
              </button>
            </div>
          </form>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عضو بالاسم أو المعرف أو الرتبة..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Users List Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
              <span>الأعضاء المسجلون والمتصلون ({filteredUsers.length}):</span>
              <span className="text-[11px] text-amber-400">التغييرات تنفذ فوراً في Firebase RTDB</span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    user.isBanned
                      ? 'bg-red-950/30 border-red-800/60'
                      : user.isMuted
                      ? 'bg-amber-950/20 border-amber-800/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          user.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                        }`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{user.name}</h4>
                          <span className="text-xs">{user.countryFlag || '🇪🇬'}</span>
                          
                          {/* Badges / Roles */}
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px] border border-amber-500/30">
                            {user.vipBadge || user.role || 'عضو'}
                          </span>

                          {user.isBanned && (
                            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px]">
                              محظور 🚫
                            </span>
                          )}

                          {user.isMuted && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-black text-[9px]">
                              مكتوم 🔇
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Coins className="w-3 h-3" />
                            {user.coins?.toLocaleString() || 0} كوينز
                          </span>
                          <span>المعرف: {user.id}</span>
                          {user.badges && user.badges.length > 0 && (
                            <span className="text-cyan-300">
                              الشارات: {user.badges.join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      
                      {/* VIP Upgrades */}
                      <button
                        onClick={() => handleSetRole(user, 'vip_gold', 'VIP ذهبي 🌟')}
                        title="ترقية إلى VIP ذهبي"
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>VIP ذهبي</span>
                      </button>

                      <button
                        onClick={() => handleSetRole(user, 'vip_diamond', 'VIP ماسي 💎')}
                        title="ترقية إلى VIP ماسي"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Crown className="w-3 h-3 text-cyan-400" />
                        <span>VIP ماسي</span>
                      </button>

                      <button
                        onClick={() => handleSetRole(user, 'admin', 'مشرف عام 🛡️')}
                        title="ترقية إلى مشرف عام"
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                        <span>مشرف</span>
                      </button>

                      {/* Add Coins */}
                      <button
                        onClick={() => handleAddCoins(user, 1000)}
                        title="إضافة 1,000 كوينز للحساب"
                        className="px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <span>+1,000</span>
                        <span>🪙</span>
                      </button>

                      {/* Mute Toggle */}
                      <button
                        onClick={() => handleToggleMute(user)}
                        title={user.isMuted ? 'إلغاء الكتم' : 'كتم العضو'}
                        className={`p-1.5 rounded-xl border text-xs font-bold active:scale-95 transition-all ${
                          user.isMuted
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                        }`}
                      >
                        {user.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Ban Toggle */}
                      <button
                        onClick={() => handleToggleBan(user)}
                        title={user.isBanned ? 'فك الحظر' : 'حظر العضو'}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all ${
                          user.isBanned
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-red-950/40 hover:bg-red-950/70 text-red-400 border-red-800/50'
                        }`}
                      >
                        <Ban className="w-3 h-3" />
                        <span>{user.isBanned ? 'فك الحظر' : 'حظر'}</span>
                      </button>

                      {/* Award Badges Dropdown/Pills */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddBadge(user, 'أكثر الهدايا')}
                          title="منح شارة أكثر الهدايا"
                          className="px-1.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[9px] font-bold"
                        >
                          🎁 أكثر الهدايا
                        </button>
                        <button
                          onClick={() => handleAddBadge(user, 'صوت ماسي')}
                          title="منح شارة صوت ماسي"
                          className="px-1.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[9px] font-bold"
                        >
                          🎙️ صوت ماسي
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
          </>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080d17] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>نظام الإدارة الفوري لـ شات مصر والعرب - صلاحيات المدير الحصرية</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
