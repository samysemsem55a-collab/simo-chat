import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  ArrowRight, 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  Lock,
  Phone,
  Video,
  Sparkles
} from 'lucide-react';
import { User, Message } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface PrivateChatViewProps {
  currentUser: User;
  onOpenWallet: () => void;
}

interface ChatContact {
  id: string;
  name: string;
  countryFlag: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({
  currentUser,
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: 'c1',
      name: 'نور الشام',
      countryFlag: '🇸🇾',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      role: 'VIP ألماسي',
      status: 'online',
      lastMessage: 'أهلاً بك سامي، كيف حال مجلسك اليوم؟',
      lastMessageTime: '10:45 ص',
      unreadCount: 2
    },
    {
      id: 'c2',
      name: 'فارس الحجاز',
      countryFlag: '🇸🇦',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      role: 'مشرف الغرفة',
      status: 'online',
      lastMessage: 'يا هلا بالغالي، نلتقي بالمسابقة الليلة إن شاء الله',
      lastMessageTime: 'أمس',
      unreadCount: 0
    },
    {
      id: 'c3',
      name: 'الشيخ عبد الرحمن',
      countryFlag: '🇪🇬',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      role: 'قارئ وخطيب أزهري',
      status: 'offline',
      lastMessage: 'بارك الله فيك وجعلك من أهل القرآن',
      lastMessageTime: '24 أكتوبر',
      unreadCount: 0
    }
  ]);

  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'pm1',
      senderId: 'c1',
      senderName: 'نور الشام',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      senderRole: 'vip_diamond',
      senderVipBadge: 'VIP ألماسي',
      type: 'text',
      content: 'السلام عليكم سامي، ما شاء الله المجلس اليوم مليء بالنشاط والمسابقات 🌸',
      timestamp: Date.now() - 3600000,
      status: 'read'
    },
    {
      id: 'pm2',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      type: 'text',
      content: 'وعليكم السلام يا نور، نورتي المجلس وأسعدنا تواجدك الراقي دائماً!',
      timestamp: Date.now() - 1800000,
      status: 'read'
    },
    {
      id: 'pm3',
      senderId: 'c1',
      senderName: 'نور الشام',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      senderRole: 'vip_diamond',
      senderVipBadge: 'VIP ألماسي',
      type: 'voice',
      content: 'رسالة صوتية خاصة',
      audioDuration: 8,
      timestamp: Date.now() - 600000,
      status: 'read'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playMessageSent();
    const newMsg: Message = {
      id: `pm_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      type: 'text',
      content: inputText.trim(),
      timestamp: Date.now(),
      status: 'delivered'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleSendVoiceNote = () => {
    sounds.playMessageSent();
    const newMsg: Message = {
      id: `pm_v_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderVipBadge: currentUser.vipBadge,
      type: 'voice',
      content: 'رسالة صوتية خاصة',
      audioDuration: 5,
      timestamp: Date.now(),
      status: 'read'
    };
    setMessages([...messages, newMsg]);
  };

  return (
    <div className="pb-20 pt-2 px-3 sm:px-4 max-w-4xl mx-auto h-[calc(100vh-130px)] flex flex-col">
      
      {/* If No Contact Selected: Show Inbox List */}
      {!activeContact ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              المحادثات الخاصة
              <MessageCircle className="w-5 h-5 text-indigo-400" />
            </h1>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> مشفرة وآمنة تماماً
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في رسائلك الخاصة..."
              className="w-full bg-[#0d1424] border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Contact Threads List */}
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setActiveContact(contact);
                  // clear unread
                  setContacts(contacts.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
                }}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={contact.avatar} 
                      alt={contact.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-700" 
                      referrerPolicy="no-referrer"
                    />
                    {contact.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white">{contact.name}</h4>
                      <span>{contact.countryFlag}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {contact.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="text-left text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 block">{contact.lastMessageTime}</span>
                  {contact.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white font-black text-[10px] inline-block">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* If Contact Selected: Show Active 1-on-1 Chat */
        <div className="flex flex-col h-full bg-[#0d1424] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveContact(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative">
                <img src={activeContact.avatar} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900"></span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1">
                  {activeContact.name} {activeContact.countryFlag}
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold">متصل الآن • خاص مشفر</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => alert(`جاري بدء الاتصال الصوتي مع ${activeContact.name}... 📞`)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-emerald-400"
                title="اتصال صوتي"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => alert(`جاري بدء مكالمة الفيديو المباشرة مع ${activeContact.name}... 📹`)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-blue-400"
                title="مكالمة فيديو"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={`${msg.id || 'pm'}_${idx}`}
                  className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm space-y-1 shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}>
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <button
                          onClick={() => {
                            if (playingVoiceId === msg.id) setPlayingVoiceId(null);
                            else {
                              sounds.playMessageReceived();
                              setPlayingVoiceId(msg.id);
                              setTimeout(() => setPlayingVoiceId(null), 3000);
                            }
                          }}
                          className={`p-1.5 rounded-full ${isMe ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}
                        >
                          {playingVoiceId === msg.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <span className="text-[11px] font-bold">تسجيل صوتي (0:0{msg.audioDuration})</span>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[10px] opacity-75">
                      <span>{new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Bar */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleSendVoiceNote}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-indigo-400"
              title="إرسال تسجيل صوتي سريع"
            >
              <Mic className="w-4 h-4" />
            </button>

            <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب رسالة خاصة مشفرة..."
                className="w-full bg-[#121c32] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </form>

            <button
              onClick={() => handleSendMessage()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
