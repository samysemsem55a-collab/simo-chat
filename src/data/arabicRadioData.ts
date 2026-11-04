// Verified Real High-Quality Arabic & Egyptian Live Radio Stations (محطات الراديو المصرية والعربية للبث المباشر)
export interface ArabicRadioStation {
  id: string;
  name: string;
  category: 'tarab' | 'egypt' | 'hits' | 'fairuz' | 'quran' | 'classic';
  categoryLabel: string;
  streamUrl: string;
  description: string;
  country: string;
  countryFlag: string;
  bitrate: string;
  color: string;
  icon: string;
}

export const ARABIC_RADIO_STATIONS: ArabicRadioStation[] = [
  {
    id: 'radio_tarab_zaman',
    name: 'راديو طرب زمان الأصيل',
    category: 'tarab',
    categoryLabel: 'طرب أصيل',
    streamUrl: 'https://medinatarab.ice.infomaniak.ch/medinatarab-128.mp3',
    description: 'روائع أم كلثوم، عبد الحليم حافظ، فريد الأطرش، وردة الجزائرية، محمد عبد الوهاب على مدار الساعة',
    country: 'مصر والعالم العربي',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-amber-600 to-yellow-600',
    icon: '🎻'
  },
  {
    id: 'radio_90s_egypt',
    name: 'تسعينات إف إم (90s FM مصر)',
    category: 'egypt',
    categoryLabel: 'كلاسيك مصري',
    streamUrl: 'https://stream.zeno.fm/8a4eqkd0pnhvv',
    description: 'أجمل ذكريات التسعينات المصرية: عمرو دياب، محمد فؤاد، إيهاب توفيق، مصطفى قمر، حميد الشاعري',
    country: 'مصر',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-blue-600 to-indigo-600',
    icon: '📼'
  },
  {
    id: 'radio_fairuz',
    name: 'إذاعة فيروزيات الصباح',
    category: 'fairuz',
    categoryLabel: 'فيروز وشامي',
    streamUrl: 'https://stream.zeno.fm/xkhnk4vee18uv',
    description: 'أغاني السيدة فيروز والأخوين رحباني وصوت جارة القمر فيروز على مدار 24 ساعة',
    country: 'لبنان وبلاد الشام',
    countryFlag: '🇱🇧',
    bitrate: '128 kbps',
    color: 'from-teal-600 to-emerald-600',
    icon: '☕'
  },
  {
    id: 'radio_rotana_fm',
    name: 'إذاعة روتانا إف إم (Rotana FM)',
    category: 'hits',
    categoryLabel: 'أغاني ومنوعات',
    streamUrl: 'http://philae.shoutca.st:8250/stream',
    description: 'أحدث وأشهر الأغاني العربية والخليجية والمصرية المعاصرة لكبار نجوم الوطن العربي',
    country: 'العالم العربي والخليج',
    countryFlag: '🇸🇦',
    bitrate: '128 kbps',
    color: 'from-purple-600 to-pink-600',
    icon: '🌟'
  },
  {
    id: 'radio_oriental_instrumental',
    name: 'راديو شرقيات وموسيقى العود والكمان',
    category: 'classic',
    categoryLabel: 'تقاسيم وعزف',
    streamUrl: 'https://oriental-high.rautemusik.fm/?ref=radiobrowser',
    description: 'تقاسيم شرقية ساحرة، صولوهات عود، قانون، وكمان شرقي لأجواء راقية وهادئة',
    country: 'موسيقى شرقية',
    countryFlag: '🎶',
    bitrate: '192 kbps',
    color: 'from-rose-600 to-orange-600',
    icon: '🪕'
  },
  {
    id: 'radio_quran_cairo',
    name: 'إذاعة القرآن الكريم من القاهرة',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'http://n0c.radiojar.com/8s5u5tpdtwzuv',
    description: 'البث المباشر لإذاعة القرآن الكريم من جمهورية مصر العربية بأصوات عمالقة التلاوة',
    country: 'مصر - القاهرة',
    countryFlag: '🇪🇬',
    bitrate: '80 kbps',
    color: 'from-emerald-700 to-teal-800',
    icon: '🕌'
  },
  {
    id: 'radio_tarateel_khashia',
    name: 'إذاعة التراتيل الخاشعة',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/tarateel',
    description: 'تلاوات قرآنية خاشعة ومؤثرة لكبار قراء العالم الإسلامي على مدار اليوم',
    country: 'العالم الإسلامي',
    countryFlag: '✨',
    bitrate: '128 kbps',
    color: 'from-cyan-700 to-blue-800',
    icon: '📖'
  },
  {
    id: 'radio_abdulbasit',
    name: 'إذاعة الشيخ عبد الباسط عبد الصمد',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    description: 'تلاوات نادرة ومجودة لصوت مكة الحبيب الشيخ عبد الباسط عبد الصمد رحمه الله',
    country: 'مصر',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-amber-700 to-yellow-800',
    icon: '🎙️'
  },
  {
    id: 'radio_minshawi',
    name: 'إذاعة الشيخ محمد صديق المنشاوي',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad',
    description: 'الصوت الباكي العذب فضيلة الشيخ محمد صديق المنشاوي المصحف المجود',
    country: 'مصر',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-green-700 to-emerald-800',
    icon: '🕊️'
  },
  {
    id: 'radio_hussary',
    name: 'إذاعة الشيخ محمود خليل الحصري',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/mahmoud_khalil_alhussary',
    description: 'شيخ عموم المقارئ المصرية وأستاذ التجويد الشيخ محمود خليل الحصري',
    country: 'مصر',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-blue-700 to-slate-800',
    icon: '📿'
  },
  {
    id: 'radio_mustafa_ismail',
    name: 'إذاعة الشيخ مصطفى إسماعيل',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/mustafa_ismail',
    description: 'قارئ الملوك والرؤساء وأسطورة المقامات القرآنية الشيخ مصطفى إسماعيل',
    country: 'مصر',
    countryFlag: '🇪🇬',
    bitrate: '128 kbps',
    color: 'from-indigo-700 to-purple-800',
    icon: '👑'
  },
  {
    id: 'radio_alafasi',
    name: 'إذاعة الشيخ مشاري راشد العفاسي',
    category: 'quran',
    categoryLabel: 'قرآن كريم',
    streamUrl: 'https://qurango.net/radio/mishary_alafasi',
    description: 'المصحف المرتل والأدعية والأذكار بصوت القارئ الشيخ مشاري بن راشد العفاسي',
    country: 'الكويت',
    countryFlag: '🇰🇼',
    bitrate: '128 kbps',
    color: 'from-teal-700 to-cyan-800',
    icon: '🌿'
  }
];
