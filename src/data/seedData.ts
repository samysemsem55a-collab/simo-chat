import { Room, GiftItem, VipTier, TriviaQuestion, LeaderboardEntry, User } from '../types/chat';

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const BADGES_CATALOG: BadgeDefinition[] = [
  { id: 'top_gifter', name: 'أكثر الهدايا', icon: '🎁', description: 'أرسل هدايا فاخرة للمتحدثين والمجالس', color: 'from-pink-500 to-rose-600' },
  { id: 'active_member', name: 'عضو نشط', icon: '⚡', description: 'عضو دائم التواجد والتفاعل والمشاركة', color: 'from-amber-400 to-orange-500' },
  { id: 'diamond_voice', name: 'صوت ماسي', icon: '🎙️', description: 'مشارك مميز على منصات المايك والبث', color: 'from-cyan-400 to-blue-600' },
  { id: 'distinguished_host', name: 'مضيف متميز', icon: '👑', description: 'مضيف مجلس عربي راقي وناجح', color: 'from-purple-500 to-indigo-600' },
];

export const CURRENT_USER: User = {
  id: 'usr_me',
  name: 'ضيف عربي',
  username: 'arab_guest',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'مرحباً بكم في شات مصر والعرب 🇪🇬 🌸',
  country: 'مصر',
  countryFlag: '🇪🇬',
  role: 'member',
  coins: 0, // Starts at 0 per requirement
  earningsEgp: 0,
  earningsUsd: 0,
  vipBadge: 'عضو نشط',
  badges: ['عضو نشط'],
  ratingPoints: 0,
  frameStyle: 'border-slate-700',
  profileWallpaper: '',
  fontPreference: 'cairo',
  isOnline: true,
  status: 'online',
  joinedAt: new Date().toISOString().split('T')[0],
  gender: 'male',
  level: 1,
  likesReceived: 0,
  giftsReceivedCount: 0
};

export function isUserAdminOrOwner(user?: User | null): boolean {
  if (!user) return false;
  return (
    user.role === 'owner' || 
    user.role === 'admin' || 
    user.role === 'super_admin' || 
    user.username === 'admin' || 
    user.username === 'developer' || 
    user.username === 'owner' || 
    user.id === 'usr_owner' ||
    user.id.startsWith('usr_owner_') ||
    (user.badges || []).includes('مالك المنصة') ||
    user.vipBadge === 'مالك المنصة 👑'
  );
}

export function getOrCreateUser(): User {
  if (typeof window === 'undefined') return CURRENT_USER;

  try {
    let savedId = localStorage.getItem('arab_chat_userId');
    if (!savedId) {
      savedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('arab_chat_userId', savedId);
    }

    const saved = localStorage.getItem('arab_chat_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.id || parsed.id === 'usr_me') {
          parsed.id = savedId;
        }
        if (!parsed.name || parsed.name === 'عضو 380') {
          parsed.name = `مستخدم_${savedId.slice(-4)}`;
        }
        localStorage.setItem('arab_chat_user', JSON.stringify(parsed));
        return parsed;
      }
    }

    const displayNum = savedId.slice(-4);
    const newUser: User = {
      ...CURRENT_USER,
      id: savedId,
      name: `مستخدم_${displayNum}`,
      username: `user_${displayNum}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${savedId}`,
      coins: 100, // Welcome gift coins
    };

    localStorage.setItem('arab_chat_user', JSON.stringify(newUser));
    return newUser;
  } catch {
    return CURRENT_USER;
  }
}

// Rooms definitions: Start with 0 active users and 0 visitors (dynamically calculated)
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_general',
    title: 'الغرفة العامة (شات مصر وكل العرب 💬)',
    description: 'شات كل العرب • ملتقى المحبة والأخوة العربية والمسابقات',
    subtext: 'دردشة كتابية حرة، تعارف، سوالف عربية راقية، وتبادل الثقافات والآراء',
    category: 'general',
    type: 'text',
    roomType: 'text_only',
    icon: '🌐',
    iconBg: 'from-blue-600 to-cyan-500',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    moderators: [],
    ownerId: '',
    hostId: '',
    pinnedAnnouncement: 'أهلاً بكم في الغرفة العامة لشات مصر والعرب! مرحباً بالجميع.',
    speakers: [],
    cameraAllowedUserIds: [],
    joinRequests: [],
    cameraRequests: []
  },
  {
    id: 'room_egypt',
    title: 'غرفة مصر أم الدنيا 🇪🇬',
    description: 'ملتقى شباب وبنات مصر - إسكندرية، القاهرة، الصعيد والقناة',
    subtext: 'دردشة كتابية، ضحك وفرفشة، ونقاشات ممتعة مع ولاد البلد وأحلى صحبة',
    category: 'egypt',
    type: 'text',
    roomType: 'text_only',
    icon: '🇪🇬',
    iconBg: 'from-red-600 via-white to-black',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-red-500 via-amber-500 to-slate-900',
    moderators: [],
    ownerId: '',
    hostId: '',
    speakers: [],
    cameraAllowedUserIds: []
  },
  {
    id: 'room_egypt2',
    title: 'غرفة مصر 2 🇪🇬 (دردشة ولاد البلد)',
    description: 'ملتقى الأصدقاء والصحبة الحلوة - دردشة حية لشباب وبنات مصر وكل العرب',
    subtext: 'سوالف وضحك وفرفشة مع ولاد البلد في الغرفة الثانية',
    category: 'egypt',
    type: 'text',
    roomType: 'text_only',
    icon: '🇪🇬',
    iconBg: 'from-amber-600 via-rose-600 to-slate-900',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-amber-500 via-rose-600 to-indigo-700',
    moderators: [],
    ownerId: '',
    hostId: '',
    speakers: [],
    cameraAllowedUserIds: []
  },
  {
    id: 'room_text_chat',
    title: 'شات الدردشة العامة (كتابي فقط 💬)',
    description: 'دردشة حرة بالرسائل النصية والملصقات بدون صوت أو مايكات',
    subtext: 'مجلس نصي سريع للكتابة والتواصل المباشر بين الجميع',
    category: 'general',
    type: 'text',
    roomType: 'text_only',
    icon: '💬',
    iconBg: 'from-cyan-600 to-teal-500',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-teal-500 via-cyan-600 to-blue-600',
    moderators: [],
    ownerId: '',
    speakers: []
  },
  {
    id: 'room_ksa',
    title: 'مجلس المملكة العربية السعودية 🇸🇦',
    description: 'مجلس كرم الضيافة والترحيب بأهل الرياض، جدة، الحجاز والشرقية',
    subtext: 'دردشة كتابية هادئة، شعر نبطي وأصالة المجلس السعودي',
    category: 'gulf',
    type: 'text',
    roomType: 'text_only',
    icon: '🇸🇦',
    iconBg: 'from-emerald-700 to-green-600',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    moderators: [],
    ownerId: '',
    hostId: '',
    speakers: []
  },
  {
    id: 'room_morocco',
    title: 'المملكة المغربية الشريفة 🇲🇦',
    description: 'مرحباً بكم عند خوتكم فالمغرب - الدار البيضاء، مراكش، فاس وطنجة',
    subtext: 'دردشة كتابية راقية، حوارات ممتعة ومحبة تجمعنا',
    category: 'maghreb',
    type: 'text',
    roomType: 'text_only',
    icon: '🇲🇦',
    iconBg: 'from-red-600 to-emerald-700',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-red-600 via-rose-700 to-slate-900',
    moderators: [],
    ownerId: '',
    hostId: '',
    speakers: []
  },
  {
    id: 'room_iraq',
    title: 'العراق أرض الرافدين والحضارات 🇮🇶',
    description: 'يا هلا بأهل الغيرة والكرم - بغداد، البصرة، أربيل والموصل',
    subtext: 'دردشة كتابية، شعر عراقي أصيل، ودفء المجلس البغدادي',
    category: 'sham',
    type: 'text',
    roomType: 'text_only',
    icon: '🇮🇶',
    iconBg: 'from-red-600 via-white to-black',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-red-600 via-amber-600 to-slate-900',
    moderators: [],
    ownerId: '',
    hostId: '',
    speakers: []
  },
  {
    id: 'room_religious',
    title: 'الغرفة الدينية (تلاوات وأدعية) 🕌',
    description: 'مجلس الذكر والمواعظ والأدعية وتلاوات القرآن الكريم',
    subtext: 'أحاديث نبوية، أدعية مأثورة، تلاوات خاشعة، وأذكار الصباح والمساء',
    category: 'religious',
    type: 'text',
    roomType: 'text_only',
    icon: '🕌',
    iconBg: 'from-amber-600 to-emerald-600',
    activeUsers: 0,
    visitorsCount: '0',
    isLive: false,
    isVoiceActive: false,
    accentGradient: 'from-emerald-500 via-teal-600 to-indigo-700',
    moderators: [],
    ownerId: '',
    hostId: '',
    pinnedAnnouncement: 'قال رسول الله ﷺ: «مَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ، وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلَّا نَزَلَتْ عَلَيْهِمِ السَّكِينَةُ»',
    speakers: []
  }
];

// ZERO FAKE MESSAGES: Start empty!
export const INITIAL_MESSAGES: Record<string, import('../types/chat').Message[]> = {};

export const RADIO_STATIONS: import('../types/chat').RadioStation[] = [
  {
    id: 'rad_om_kalthoum',
    name: 'إذاعة كوكب الشرق أم كلثوم',
    artist: 'سيدة الغناء العربي',
    category: 'طرب كلاسيكي',
    icon: '🎙️',
    description: 'أروع روائع الست: إنت عمري، الأطلال، سيرة الحب، ألف ليلة وليلة',
    streamUrl: 'https://stream.zeno.fm/4wv912y0zrhvv'
  },
  {
    id: 'rad_fairouz',
    name: 'إذاعة فيروزيات الصباح',
    artist: 'جارة القمر فيروز',
    category: 'طرب شامي',
    icon: '☕',
    description: 'نسمات الصباح: سهر الليالي، حبيتك بالصيف، كيفك إنت، نسم علينا الهوى',
    streamUrl: 'https://stream.zeno.fm/f3wvbbq0zrhvv'
  },
  {
    id: 'rad_quran_cairo',
    name: 'إذاعة القرآن الكريم من القاهرة',
    artist: 'كبار قراء مصر والعالم الإسلامي',
    category: 'تلاوات خاشعة',
    icon: '🕌',
    description: 'تلاوات خاشعة للشيخ عبد الباسط، المنشاوي، الحصري، ومصطفى إسماعيل',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv'
  },
  {
    id: 'rad_oud_tarab',
    name: 'إذاعة العود والطرب الأصيل',
    artist: 'فريد الأطرش ومحمد عبد الوهاب',
    category: 'تقاسيم وعود',
    icon: '🪕',
    description: 'تقاسيم عود هادئة وموشحات أندلسية وألحان الخلود',
    streamUrl: 'https://stream.zeno.fm/tarab'
  }
];

export const LUXURY_GIFTS: GiftItem[] = [
  { id: 'gift_rose', name: 'وردة المحبة', icon: '🌹', cost: 50, animation: 'rose', bannerText: 'أهدى باقة ورد أنيقة تعبيراً عن الود!' },
  { id: 'gift_coffee', name: 'فنجان قهوة عربي', icon: '☕', cost: 100, animation: 'coffee', bannerText: 'حيّاك الله بفنجان قهوة وكرم ضيافة!' },
  { id: 'gift_horus', name: 'عين حورس الذهبية', icon: '🧿', cost: 250, animation: 'diamond', bannerText: 'أرسل تميمة المحبة والحماية المصرية!' },
  { id: 'gift_crown', name: 'التاج الملكي الفاخر', icon: '👑', cost: 500, animation: 'crown', bannerText: 'توّج المضيف بتاج العز والملوك!' },
  { id: 'gift_tower', name: 'برج القاهرة المضيء', icon: '🗼', cost: 1000, animation: 'cairo_tower', bannerText: 'أضاء سماء الروم ببرج القاهرة الشامخ!' },
  { id: 'gift_ferrari', name: 'فيراري حمراء سبيد', icon: '🏎️', cost: 2500, animation: 'car', bannerText: 'انطلق بأقوى سرعة وفخامة الفيراري!' },
  { id: 'gift_lion', name: 'الأسد المصري الملكي', icon: '🦁', cost: 5000, animation: 'lion', bannerText: 'زأر الأسد الملكي لتهتز أركان المجلس بالهيبة!' },
  { id: 'gift_rocket', name: 'الصاروخ الذهبي العملاق', icon: '🚀', cost: 10000, animation: 'rocket', bannerText: 'أطلق الصاروخ الذهبي إلى الفضاء مع عاصفة ذهبية!' }
];

export const QUICK_PHRASES = [
  'السلام عليكم ورحمة الله وبركاته 🌹',
  'مساء الخير والورد والياسمين ✨',
  'منورين المجلس جميعاً يا هلا وغلا 👋',
  'أهلاً وسهلاً بك نورت الغرفة 👑',
  'اللهم صل وسلم وبارك على نبينا محمد 🤍',
  'صوتكم واضح وما شاء الله تبارك الله 🎙️',
  'تحياتي لكل الحضور المحترمين 🌟',
  'تسلم يا ذوق على الكلام الراقي 💫'
];

export const AVATAR_PRESETS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'كليوباترا الملكية' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'الشيخ الشهم' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', label: 'فارس الأطلس' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', label: 'نور الياسمين' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', label: 'ابن النيل الأنيق' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', label: 'أمير الرافدين' },
  { id: 'av7', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', label: 'ملكة الشرق' },
  { id: 'av8', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', label: 'شاب عربي عصري' },
];

// VIP Tiers with exact pricing requested:
// Bronze (50 EGP/mo), Silver (150 EGP/mo), Super VIP (300 EGP/mo)
export const VIP_TIERS: VipTier[] = [
  {
    id: 'vip_bronze',
    name: 'VIP برونزي',
    badge: '🥉 VIP برونزي',
    tagline: 'بداية التميز والظهور المميز',
    priceEgp: 50,
    priceUsd: 1.5,
    coinsBonus: 1000,
    gradient: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-800 text-amber-200 border-amber-600',
    perks: [
      'شارة برونزية بجوار اسمك في كل الغرف',
      'إطار برونزي يحيط بصورتك الشخصية',
      'رصيد إضافي +1,000 كوينز فورية',
      'أولوية إرسال الرسائل وتثبيتها'
    ]
  },
  {
    id: 'vip_silver',
    name: 'VIP فضي',
    badge: '🥈 VIP فضي',
    tagline: 'حضور لامع وتأثير أكبر في المحادثات',
    priceEgp: 150,
    priceUsd: 3.5,
    coinsBonus: 3500,
    gradient: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-700 text-slate-100 border-slate-400',
    perks: [
      'شارة فضية براقة مع توهج عند الكتابة',
      'خط ديواني مميز مخصص لك في الشات',
      'رصيد إضافي +3,500 كوينز فورية',
      'دخول الغرف بتنبيه ترحيب خاص',
      'إمكانية فتح مايك إضافي دون انتظار'
    ]
  },
  {
    id: 'vip_diamond',
    name: 'Super VIP سوبر ملكي',
    badge: '👑 Super VIP',
    tagline: 'أعلى رتبة في شات العرب - فخامة مطلقة',
    priceEgp: 300,
    priceUsd: 7.0,
    coinsBonus: 10000,
    gradient: 'from-cyan-500 via-indigo-600 to-purple-700',
    badgeBg: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-extrabold border-cyan-200',
    perks: [
      'شارة سوبر VIP إمبراطورية مشعة نادرة',
      'إشعار شاشة كاملة عند دخول أي غرفة',
      'رصيد ضخم +10,000 كوينز فورية',
      'حصانة تامة من الطرد والكتم التلقائي',
      'أولوية مقعد المايك الأول وتحكم كامل بالكاميرا',
      'سحب أرباح فوري بدون أي عمولات'
    ]
  }
];

// Trivia Contest Questions - strictly 10 coins reward each!
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q1',
    question: 'ما هي عاصمة جمهورية مصر العربية وأكبر مدنها سكاناً؟',
    category: 'جغرافيا وتاريخ',
    options: ['الإسكندرية', 'القاهرة', 'الجيزة', 'أسوان'],
    correctIndex: 1,
    explanation: 'القاهرة هي العاصمة وأكبر مدن مصر، وتُعرف بمدينة الألف مئذنة.',
    coinsReward: 10
  },
  {
    id: 'q2',
    question: 'أي من المعالم الأثرية التالية يعد من عجائب الدنيا السبع القديمة التي ما زالت قائمة؟',
    category: 'آثار وتراث',
    options: ['حدائق بابل المعلقة', 'منارة الإسكندرية', 'الهرم الأكبر (خوفو)', 'تمثال رودس'],
    correctIndex: 2,
    explanation: 'هرم خوفو بالجيزة هو الأعجوبة الوحيدة الباقية من عجائب الدنيا السبع القديمة.',
    coinsReward: 10
  },
  {
    id: 'q3',
    question: 'من هو الشاعر العربي الملقب بـ "أمير الشعراء"؟',
    category: 'أدب وشعر',
    options: ['حافظ إبراهيم', 'أحمد شوقي', 'المتنبي', 'إيليا أبو ماضي'],
    correctIndex: 1,
    explanation: 'أحمد شوقي هو الشاعر المصري الذي بويع بإمارة الشعر عام 1927.',
    coinsReward: 10
  },
  {
    id: 'q4',
    question: 'ما هو أطول أنهار العالم والذي يمر بعدة دول أفريقية منها مصر والسودان؟',
    category: 'جغرافيا طبيعية',
    options: ['نهر الأمازون', 'نهر الدانوب', 'نهر النيل', 'نهر الفرات'],
    correctIndex: 2,
    explanation: 'نهر النيل هو شريان الحياة وأطول نهر في العالم بطول يقارب 6,650 كم.',
    coinsReward: 10
  },
  {
    id: 'q5',
    question: 'كم عدد سور القرآن الكريم؟',
    category: 'إسلاميات',
    options: ['110 سورة', '114 سورة', '120 سورة', '112 سورة'],
    correctIndex: 1,
    explanation: 'يتكون القرآن الكريم من 114 سورة، تبدأ بسورة الفاتحة وتنتهي بسورة الناس.',
    coinsReward: 10
  }
];

export const LEADERBOARD_USERS: LeaderboardEntry[] = [];
