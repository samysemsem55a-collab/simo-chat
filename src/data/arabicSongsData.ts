// 100 Authentic Arabic Songs Library for Private Rooms (المكتبة الموسيقية العربية)
export interface ArabicSong {
  id: string;
  title: string;
  artist: string;
  category: 'tarab' | 'classic' | 'modern' | 'khaleeji' | 'shaabi' | 'levantine' | 'maghreb';
  categoryLabel: string;
  duration: string;
  durationSeconds: number;
  melodyNotes?: number[]; // Audio frequencies in Hz for realistic playback synthesis
}

export const ARABIC_100_SONGS: ArabicSong[] = [
  // --- 1. كوكب الشرق أم كلثوم ---
  { id: 'song_1', title: 'أنت عمري', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:40', durationSeconds: 340, melodyNotes: [293, 329, 369, 392, 440, 493, 587] },
  { id: 'song_2', title: 'ألف ليلة وليلة', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '6:15', durationSeconds: 375, melodyNotes: [329, 369, 392, 440, 493, 523] },
  { id: 'song_3', title: 'سيرة الحب', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:10', durationSeconds: 310, melodyNotes: [261, 293, 329, 349, 392] },
  { id: 'song_4', title: 'الأطلال', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '6:30', durationSeconds: 390, melodyNotes: [349, 392, 440, 466, 523] },
  { id: 'song_5', title: 'دارت الأيام', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:50', durationSeconds: 350, melodyNotes: [293, 329, 349, 392, 440] },
  { id: 'song_6', title: 'فكروني', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:20', durationSeconds: 320, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_7', title: 'حب إيه', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:45', durationSeconds: 285, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_8', title: 'بعيد عنك', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:15', durationSeconds: 315, melodyNotes: [293, 349, 392, 440, 493] },
  { id: 'song_9', title: 'هوا هوايا (للصبر حدود)', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:35', durationSeconds: 335, melodyNotes: [329, 369, 440, 493, 523] },
  { id: 'song_10', title: 'لسه فاكر', artist: 'أم كلثوم', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:55', durationSeconds: 295, melodyNotes: [293, 329, 369, 440, 493] },

  // --- 2. العندليب عبد الحليم حافظ ---
  { id: 'song_11', title: 'قارئة الفنجان', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '5:30', durationSeconds: 330, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_12', title: 'سواح', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '4:20', durationSeconds: 260, melodyNotes: [293, 349, 392, 440, 523] },
  { id: 'song_13', title: 'جانا الهوى', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '4:15', durationSeconds: 255, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_14', title: 'زي الهوا', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '5:05', durationSeconds: 305, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_15', title: 'حاول تفتكرني', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '5:45', durationSeconds: 345, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_16', title: 'أي دمعة حزن لا', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '4:50', durationSeconds: 290, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_17', title: 'موعود', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '5:10', durationSeconds: 310, melodyNotes: [329, 369, 415, 440, 493] },
  { id: 'song_18', title: 'على حسب وداد قلبي', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '4:30', durationSeconds: 270, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_19', title: 'أهواك', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '3:45', durationSeconds: 225, melodyNotes: [293, 329, 392, 440, 523] },
  { id: 'song_20', title: 'توبة', artist: 'عبد الحليم حافظ', category: 'classic', categoryLabel: 'كلاسيك مصري', duration: '3:50', durationSeconds: 230, melodyNotes: [329, 369, 392, 440, 493] },

  // --- 3. جارة القمر فيروز ---
  { id: 'song_21', title: 'نسم علينا الهوى', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:20', durationSeconds: 200, melodyNotes: [392, 440, 493, 523, 587] },
  { id: 'song_22', title: 'سألوني الناس', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:50', durationSeconds: 230, melodyNotes: [329, 369, 392, 440, 493] },
  { id: 'song_23', title: 'كيفك إنت', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:40', durationSeconds: 220, melodyNotes: [293, 349, 392, 440, 523] },
  { id: 'song_24', title: 'حبيتك بالصيف', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:15', durationSeconds: 195, melodyNotes: [349, 392, 440, 493, 587] },
  { id: 'song_25', title: 'أنا لحبيبي', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:35', durationSeconds: 215, melodyNotes: [329, 392, 440, 523, 659] },
  { id: 'song_26', title: 'قديش كان في ناس', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:30', durationSeconds: 210, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_27', title: 'شايف البحر شو كبير', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:45', durationSeconds: 225, melodyNotes: [293, 369, 440, 493, 587] },
  { id: 'song_28', title: 'بكتب اسمك يا حبيبي', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:25', durationSeconds: 205, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_29', title: 'سهر الليالي', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:10', durationSeconds: 190, melodyNotes: [349, 440, 523, 587, 659] },
  { id: 'song_30', title: 'كان عنا طاحون', artist: 'فيروز', category: 'levantine', categoryLabel: 'شامي ولبناني', duration: '3:15', durationSeconds: 195, melodyNotes: [293, 349, 392, 440, 523] },

  // --- 4. الهضبة عمرو دياب ---
  { id: 'song_31', title: 'نور العين', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:15', durationSeconds: 255, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_32', title: 'تملي معاك', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:30', durationSeconds: 270, melodyNotes: [293, 349, 392, 440, 523] },
  { id: 'song_33', title: 'قمرين', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:05', durationSeconds: 245, melodyNotes: [349, 392, 440, 493, 587] },
  { id: 'song_34', title: 'يا أنا يا لأ', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:50', durationSeconds: 230, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_35', title: 'وياه', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:00', durationSeconds: 240, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_36', title: 'ريحة الحبايب', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:45', durationSeconds: 225, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_37', title: 'أنت الحظ', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:30', durationSeconds: 210, melodyNotes: [329, 392, 440, 523, 587] },
  { id: 'song_38', title: 'ليلي نهاري', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:10', durationSeconds: 250, melodyNotes: [349, 392, 440, 523, 659] },
  { id: 'song_39', title: 'ميال', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:20', durationSeconds: 260, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_40', title: 'راجعين', artist: 'عمرو دياب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:12', durationSeconds: 252, melodyNotes: [293, 349, 440, 493, 587] },

  // --- 5. شيرين عبد الوهاب ---
  { id: 'song_41', title: 'مشاعر', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:55', durationSeconds: 235, melodyNotes: [293, 329, 349, 440, 523] },
  { id: 'song_42', title: 'حبة جنة', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:45', durationSeconds: 225, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_43', title: 'جرح تاني', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:20', durationSeconds: 260, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_44', title: 'كلي ملكك', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:10', durationSeconds: 250, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_45', title: 'على بالي', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '4:05', durationSeconds: 245, melodyNotes: [293, 349, 392, 440, 493] },
  { id: 'song_46', title: 'آه يا ليل', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:35', durationSeconds: 215, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_47', title: 'الوتر الحساس', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:50', durationSeconds: 230, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_48', title: 'نساي', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:30', durationSeconds: 210, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_49', title: 'تاج راسك', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:40', durationSeconds: 220, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_50', title: 'زمان', artist: 'شيرين عبد الوهاب', category: 'modern', categoryLabel: 'موسيقى معاصرة', duration: '3:25', durationSeconds: 205, melodyNotes: [293, 329, 392, 440, 523] },

  // --- 6. روائع الخليج العربي ---
  { id: 'song_51', title: 'الأماكن', artist: 'محمد عبده', category: 'khaleeji', categoryLabel: 'خليجي', duration: '5:40', durationSeconds: 340, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_52', title: 'مذهلة', artist: 'محمد عبده', category: 'khaleeji', categoryLabel: 'خليجي', duration: '5:10', durationSeconds: 310, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_53', title: 'صوتك يناديني', artist: 'محمد عبده', category: 'khaleeji', categoryLabel: 'خليجي', duration: '4:50', durationSeconds: 290, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_54', title: 'مقادير', artist: 'طلال مداح', category: 'khaleeji', categoryLabel: 'خليجي', duration: '4:30', durationSeconds: 270, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_55', title: 'تصدق ولا أحلفلك', artist: 'طلال مداح', category: 'khaleeji', categoryLabel: 'خليجي', duration: '4:45', durationSeconds: 285, melodyNotes: [293, 349, 392, 440, 493] },
  { id: 'song_56', title: 'غلطة', artist: 'عبد المجيد عبد الله', category: 'khaleeji', categoryLabel: 'خليجي', duration: '4:15', durationSeconds: 255, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_57', title: 'يا بعدهم كلهم', artist: 'عبد المجيد عبد الله', category: 'khaleeji', categoryLabel: 'خليجي', duration: '3:55', durationSeconds: 235, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_58', title: 'تناديك', artist: 'ماجد المهندس', category: 'khaleeji', categoryLabel: 'خليجي', duration: '4:20', durationSeconds: 260, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_59', title: 'هدوء', artist: 'ماجد المهندس', category: 'khaleeji', categoryLabel: 'خليجي', duration: '3:50', durationSeconds: 230, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_60', title: 'بشرة خير', artist: 'حسين الجسمي', category: 'khaleeji', categoryLabel: 'خليجي ومصري', duration: '3:30', durationSeconds: 210, melodyNotes: [329, 392, 440, 523, 659] },

  // --- 7. روائع العراق والفرات ---
  { id: 'song_61', title: 'زيديني عشقاً', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '5:20', durationSeconds: 320, melodyNotes: [293, 329, 349, 440, 523] },
  { id: 'song_62', title: 'قولي أحبك', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '4:50', durationSeconds: 290, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_63', title: 'مدرسة الحب', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '5:35', durationSeconds: 335, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_64', title: 'أنا وليلى', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '6:10', durationSeconds: 370, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_65', title: 'هل عندك شك', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '4:40', durationSeconds: 280, melodyNotes: [293, 349, 392, 440, 493] },
  { id: 'song_66', title: 'عيد وحب', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '4:15', durationSeconds: 255, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_67', title: 'عبرت الشط', artist: 'كاظم الساهر', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '4:25', durationSeconds: 265, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_68', title: 'يمر عجل', artist: 'ناظم الغزالي', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '3:45', durationSeconds: 225, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_69', title: 'طالعة من بيت أبوها', artist: 'ناظم الغزالي', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '3:50', durationSeconds: 230, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_70', title: 'ميلي علي ميلي', artist: 'ناظم الغزالي', category: 'tarab', categoryLabel: 'طرب عراقي', duration: '3:30', durationSeconds: 210, melodyNotes: [293, 329, 392, 440, 523] },

  // --- 8. روائع الطرب الكلاسيكي الأصيل ---
  { id: 'song_71', title: 'مضناك جفاه مرقده', artist: 'محمد عبد الوهاب', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:15', durationSeconds: 315, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_72', title: 'يا مسافر وحدك', artist: 'محمد عبد الوهاب', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:10', durationSeconds: 250, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_73', title: 'كل ده كان ليه', artist: 'محمد عبد الوهاب', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:40', durationSeconds: 280, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_74', title: 'في يوم وليلة', artist: 'وردة الجزائرية', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:45', durationSeconds: 345, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_75', title: 'بتونس بيك', artist: 'وردة الجزائرية', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:35', durationSeconds: 275, melodyNotes: [293, 349, 392, 440, 493] },
  { id: 'song_76', title: 'حرمت أحبك', artist: 'وردة الجزائرية', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:20', durationSeconds: 260, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_77', title: 'أكدب عليك', artist: 'وردة الجزائرية', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:55', durationSeconds: 295, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_78', title: 'قدود حلبية (قل للمليحة)', artist: 'صباح فخري', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '5:20', durationSeconds: 320, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_79', title: 'خمرة الحب', artist: 'صباح فخري', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:45', durationSeconds: 285, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_80', title: 'يا مال الشام', artist: 'صباح فخري', category: 'tarab', categoryLabel: 'طرب أصيل', duration: '4:10', durationSeconds: 250, melodyNotes: [293, 329, 392, 440, 523] },

  // --- 9. روائع المغرب العربي ---
  { id: 'song_81', title: 'دي دي (Didi)', artist: 'الشاب خالد', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '3:50', durationSeconds: 230, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_82', title: 'عايشة (Aïcha)', artist: 'الشاب خالد', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '4:15', durationSeconds: 255, melodyNotes: [293, 349, 392, 440, 523] },
  { id: 'song_83', title: 'عبد القادر يا بو علام', artist: 'الشاب خالد ورشيد طه', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '4:30', durationSeconds: 270, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_84', title: 'يا رايح وين مسافر', artist: 'رشيد طه', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '4:05', durationSeconds: 245, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_85', title: 'المعلم', artist: 'سعد لمجرد', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '3:40', durationSeconds: 220, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_86', title: 'إنت باغية واحد', artist: 'سعد لمجرد', category: 'maghreb', categoryLabel: 'مغربي وراي', duration: '3:30', durationSeconds: 210, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_87', title: 'سيدي منصور (الله الله يا بابا)', artist: 'صابر الرباعي', category: 'maghreb', categoryLabel: 'مغربي وتونسي', duration: '3:50', durationSeconds: 230, melodyNotes: [329, 392, 440, 523, 587] },
  { id: 'song_88', title: 'برشا برشا', artist: 'صابر الرباعي', category: 'maghreb', categoryLabel: 'مغربي وتونسي', duration: '3:45', durationSeconds: 225, melodyNotes: [349, 392, 440, 523, 659] },
  { id: 'song_89', title: 'أتحدى العالم', artist: 'صابر الرباعي', category: 'maghreb', categoryLabel: 'مغربي وتونسي', duration: '4:20', durationSeconds: 260, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_90', title: 'ريتك ما نعرف وين', artist: 'لطفي بوشناق', category: 'maghreb', categoryLabel: 'مغربي وتونسي', duration: '4:40', durationSeconds: 280, melodyNotes: [293, 349, 440, 493, 587] },

  // --- 10. روائع الطرب الشعبي والمصري الأصيل ---
  { id: 'song_91', title: 'زحمة يا دنيا زحمة', artist: 'أحمد عدوية', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:40', durationSeconds: 220, melodyNotes: [329, 392, 440, 493, 587] },
  { id: 'song_92', title: 'حبة فوق وحبة تحت', artist: 'أحمد عدوية', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:35', durationSeconds: 215, melodyNotes: [293, 349, 392, 440, 523] },
  { id: 'song_93', title: 'السح الدح إمبو', artist: 'أحمد عدوية', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:20', durationSeconds: 200, melodyNotes: [349, 392, 440, 523, 587] },
  { id: 'song_94', title: 'الليلة يا سمرا', artist: 'محمد منير', category: 'shaabi', categoryLabel: 'نوبي ومصري', duration: '4:10', durationSeconds: 250, melodyNotes: [329, 369, 440, 493, 659] },
  { id: 'song_95', title: 'سو يا سو', artist: 'محمد منير', category: 'shaabi', categoryLabel: 'نوبي ومصري', duration: '3:45', durationSeconds: 225, melodyNotes: [261, 329, 392, 440, 523] },
  { id: 'song_96', title: 'حلاوة روح', artist: 'حكيم', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:30', durationSeconds: 210, melodyNotes: [293, 329, 369, 440, 493] },
  { id: 'song_97', title: 'آه يا قلبي', artist: 'حكيم', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:40', durationSeconds: 220, melodyNotes: [329, 392, 440, 523, 587] },
  { id: 'song_98', title: 'السلام عليكم', artist: 'حكيم', category: 'shaabi', categoryLabel: 'شعبي مصري', duration: '3:25', durationSeconds: 205, melodyNotes: [349, 392, 440, 523, 659] },
  { id: 'song_99', title: 'كلام الناس', artist: 'جورج وسوف', category: 'tarab', categoryLabel: 'طرب شامي', duration: '4:50', durationSeconds: 290, melodyNotes: [261, 293, 349, 392, 440] },
  { id: 'song_100', title: 'طبيب جراح', artist: 'جورج وسوف', category: 'tarab', categoryLabel: 'طرب شامي', duration: '4:35', durationSeconds: 275, melodyNotes: [293, 349, 440, 493, 587] }
];

// Real High-Fidelity Audio Engine for Authentic Arabic Music & Radio Streams
class RealArabicAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentStreamUrl: string = '';
  private isPlayingStream = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'none';
    }
  }

  playStream(url: string, onPlay?: () => void, onError?: () => void) {
    if (!this.audio) {
      this.audio = new Audio();
    }
    this.audio.src = url;
    this.currentStreamUrl = url;
    this.isPlayingStream = true;
    this.audio.play()
      .then(() => onPlay && onPlay())
      .catch(err => {
        console.warn("Audio stream playback notice:", err);
        if (onError) onError();
      });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.isPlayingStream = false;
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlayingStream = false;
    }
  }

  resume() {
    if (this.audio && this.currentStreamUrl) {
      this.isPlayingStream = true;
      this.audio.play().catch(e => console.warn(e));
    }
  }

  setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  isPlaying() {
    return this.isPlayingStream;
  }
}

export const realArabicAudioPlayer = new RealArabicAudioPlayer();

// Backwards-compatible song player mapping songs to authentic high-fidelity live music streams
export const arabicMelodySynth = {
  playSong(song: ArabicSong) {
    let url = 'https://medinatarab.ice.infomaniak.ch/medinatarab-128.mp3'; // Tarab default
    if (song.category === 'levantine' || song.artist.includes('فيروز')) {
      url = 'https://stream.zeno.fm/xkhnk4vee18uv'; // Fairuz 24/7
    } else if (song.category === 'classic' || song.artist.includes('عمرو دياب') || song.category === 'modern') {
      url = 'https://stream.zeno.fm/8a4eqkd0pnhvv'; // 90s FM Egypt
    } else if (song.category === 'khaleeji') {
      url = 'http://philae.shoutca.st:8250/stream'; // Rotana FM
    } else if (song.category === 'tarab') {
      url = 'https://medinatarab.ice.infomaniak.ch/medinatarab-128.mp3'; // Tarab Zaman
    }
    realArabicAudioPlayer.playStream(url);
  },
  stop() {
    realArabicAudioPlayer.stop();
  }
};

