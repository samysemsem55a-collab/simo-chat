import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Music, 
  Radio, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Search, 
  Sparkles, 
  Disc3, 
  Signal, 
  Clock,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';
import { ARABIC_100_SONGS, ArabicSong } from '../data/arabicSongsData';
import { ARABIC_RADIO_STATIONS, ArabicRadioStation } from '../data/arabicRadioData';
import { sounds } from '../utils/soundEffects';

export interface MusicRadioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost?: boolean;
  roomTitle?: string;
  activeStation?: any;
  activeSong?: ArabicSong | null;
  isPlaying?: boolean;
  onToggleStation?: (station: any) => void;
  onSelectSong?: (song: ArabicSong) => void;
  onTogglePlay?: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
}

export const MusicRadioModal: React.FC<MusicRadioModalProps> = ({
  isOpen,
  onClose,
  isHost = true,
  roomTitle,
}) => {
  // Navigation tabs: 'songs' (مكتبة الأغاني الـ 100) or 'radio' (محطات الراديو المباشرة)
  const [activeTab, setActiveTab] = useState<'songs' | 'radio'>('songs');

  // Currently playing state
  const [activeSong, setActiveSong] = useState<ArabicSong>(ARABIC_100_SONGS[0]);
  const [activeStation, setActiveStation] = useState<ArabicRadioStation>(ARABIC_RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(240);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongCategory, setSelectedSongCategory] = useState<string>('all');
  const [selectedRadioCategory, setSelectedRadioCategory] = useState<string>('all');

  // Host Playback Mode: 'sequential' (تسلسلي 🔁) or 'shuffle' (عشوائي 🔀) or 'repeat_one' (تكرار 🔂)
  const [playMode, setPlayMode] = useState<'sequential' | 'shuffle' | 'repeat_one'>('sequential');

  // Dedicated HTML5 Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // High-fidelity distinct Arabic songs direct audio map
  const getSongAudioSource = (song: ArabicSong): string => {
    // 1. Amr Diab hits
    if (song.artist.includes('عمرو دياب')) {
      if (song.title.includes('قمرين')) {
        return 'https://archive.org/download/y-2meta.app-amr-diab-amarain-official-music-video-hd-version-128-kbps/Y2meta.app%20-%20Amr%20Diab%20-%20Amarain%20_%20Official%20Music%20Video%20-%20HD%20Version%20_%20%D8%B9%D9%85%D8%B1%D9%88%20%D8%AF%D9%8A%D8%A7%D8%A8%20-%20%D9%82%D9%85%D8%B1%D9%8A%D9%86%20%28128%20kbps%29.mp3';
      }
      return 'https://stream.zeno.fm/8a4eqkd0pnhvv'; // 90s FM Egypt
    }

    // 2. Umm Kulthum
    if (song.artist.includes('أم كلثوم')) {
      if (song.title.includes('الأطلال') || song.id === 'song_4') {
        return 'https://archive.org/download/umm-kulthum-enta-el-hobal-ahat/02%20Al%20Ahat.mp3';
      }
      return 'https://archive.org/download/umm-kulthum-enta-el-hobal-ahat/01%20Inta%20Al%20Hob.mp3';
    }

    // 3. Abdel Halim Hafez
    if (song.artist.includes('عبد الحليم')) {
      return 'https://archive.org/download/y-2mate.com-ala-hesb-wedad-abdel-halim-hafez_202305/y2mate.com%20-%20Ala%20Hesb%20Wedad%20%20Abdel%20Halim%20Hafez%20%20%D8%B9%D9%84%D9%89%20%D8%AD%D8%B3%D8%A8%20%D9%88%D8%AF%D8%A7%D8%AF%20%D9%82%D9%84%D8%A8%D9%89%20%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%AD%D9%84%D9%8A%D9%85%20%D8%AD%D8%A7%D9%81%D8%B8.mp3';
    }

    // 4. Fairuz
    if (song.artist.includes('فيروز')) {
      return 'https://stream.zeno.fm/xkhnk4vee18uv'; // Fairuz 24/7 dedicated live stream
    }

    // 5. Khaleeji classics & Abdul Majeed
    if (song.artist.includes('عبد المجيد') || song.artist.includes('محمد عبده') || song.category === 'khaleeji') {
      return 'https://archive.org/download/y-2meta.app-amr-diab-amarain-official-music-video-hd-version-128-kbps/Y2meta.app%20-%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%85%D8%AC%D9%8A%D8%AF%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20-%20%D9%8a%D8%A7%20%D8%A3%D8%A8%D9%86%20%D8%A7%D9%84%D8%A7%D9%88%D8%A7%D8%AF%D9%85%20%28%D8%A3%D9%84%D8%A8%D9%88%D9%85%20%D8%B9%D8%A7%D9%84%D9%85%20%D9%85%D9%88%D8%A7%D8%B2%D9%8a%29%20_%202021%20%28128%20kbps%29.mp3';
    }

    // 6. Levantine & Nancy Ajram
    if (song.artist.includes('نانسي') || song.category === 'levantine') {
      return 'https://archive.org/download/y-2meta.app-amr-diab-amarain-official-music-video-hd-version-128-kbps/Y2meta.app%20-%20Nancy%20Ajram%20-%20Aam%20Betghayar%20_%20Romanized%20Lyrics%20_%20%D9%86%D8%A7%D9%86%D8%B3%D9%8A%20%D8%B9%D8%AC%D8%B1%D9%85%20-%20%D8%B9%D9%85%20%D8%A8%D8%AA%D8%BA%D9%8A%D9%91%D8%B1%20%28128%20kbps%29.mp3';
    }

    // 7. Shaabi Egyptian & Mounir & Adaweya
    if (song.category === 'shaabi') {
      return 'https://stream.zeno.fm/8a4eqkd0pnhvv';
    }

    // 8. Classic Arabic Instrumental & Oud
    if (song.category === 'classic') {
      return 'https://oriental-high.rautemusik.fm/?ref=radiobrowser';
    }

    // 9. Authentic Tarab default
    return 'https://medinatarab.ice.infomaniak.ch/medinatarab-128.mp3';
  };

  // Active song and play mode references for audio event callbacks
  const playModeRef = useRef<'sequential' | 'shuffle' | 'repeat_one'>('sequential');
  playModeRef.current = playMode;

  const activeSongRef = useRef<ArabicSong>(activeSong);
  activeSongRef.current = activeSong;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;

      audio.onplaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onwaiting = () => {
        setIsLoading(true);
      };

      audio.onpause = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.onended = () => {
        handleNextSong();
      };

      audio.onerror = (e) => {
        console.warn("Audio stream playback notice:", e);
        setIsLoading(false);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play a specific song
  const handleSelectSong = (song: ArabicSong) => {
    setActiveSong(song);
    sounds.playCoinsReward();

    const audioUrl = getSongAudioSource(song);
    if (audioRef.current) {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(song.durationSeconds || 240);
      audioRef.current.src = audioUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.warn("Song play info:", err);
          setIsLoading(false);
        });
    }
  };

  // Play a radio station
  const handleSelectStation = (station: ArabicRadioStation) => {
    setActiveStation(station);
    sounds.playCoinsReward();

    if (audioRef.current) {
      setIsLoading(true);
      audioRef.current.src = station.streamUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.warn("Station play info:", err);
          setIsLoading(false);
        });
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      let targetUrl = '';
      if (activeTab === 'songs') {
        targetUrl = getSongAudioSource(activeSong);
      } else {
        targetUrl = activeStation.streamUrl;
      }

      if (targetUrl) {
        setIsLoading(true);
        if (audioRef.current.src !== targetUrl) {
          audioRef.current.src = targetUrl;
        }
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.warn("Toggle play info:", err);
            setIsLoading(false);
          });
      }
    }
  };

  // Next / Previous song with Shuffle and Repeat support
  const handleNextSong = () => {
    const current = activeSongRef.current;
    if (playModeRef.current === 'repeat_one') {
      handleSelectSong(current);
      return;
    }
    if (playModeRef.current === 'shuffle') {
      const others = ARABIC_100_SONGS.filter(s => s.id !== current.id);
      const randomSong = others[Math.floor(Math.random() * others.length)] || ARABIC_100_SONGS[0];
      handleSelectSong(randomSong);
      return;
    }
    // Sequential
    const idx = ARABIC_100_SONGS.findIndex(s => s.id === current.id);
    const next = ARABIC_100_SONGS[(idx + 1) % ARABIC_100_SONGS.length];
    handleSelectSong(next);
  };

  const handlePrevSong = () => {
    const current = activeSongRef.current;
    if (playModeRef.current === 'shuffle') {
      const others = ARABIC_100_SONGS.filter(s => s.id !== current.id);
      const randomSong = others[Math.floor(Math.random() * others.length)] || ARABIC_100_SONGS[0];
      handleSelectSong(randomSong);
      return;
    }
    const idx = ARABIC_100_SONGS.findIndex(s => s.id === current.id);
    const prev = ARABIC_100_SONGS[(idx - 1 + ARABIC_100_SONGS.length) % ARABIC_100_SONGS.length];
    handleSelectSong(prev);
  };

  // Seek timeline handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  // Filtered lists
  const filteredSongs = ARABIC_100_SONGS.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedSongCategory === 'all') return true;
    return song.category === selectedSongCategory;
  });

  const filteredStations = ARABIC_RADIO_STATIONS.filter(st => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedRadioCategory === 'all') return true;
    return st.category === selectedRadioCategory;
  });

  const songCategories = [
    { id: 'all', label: 'الكل (100 أغنية)' },
    { id: 'tarab', label: 'طرب أصيل' },
    { id: 'classic', label: 'كلاسيك مصري' },
    { id: 'modern', label: 'معاصر وهضبة' },
    { id: 'khaleeji', label: 'روائع الخليج' },
    { id: 'levantine', label: 'فيروزيات وشامي' },
    { id: 'maghreb', label: 'مغربي وراي' },
    { id: 'shaabi', label: 'شعبي مصري' },
  ];

  const radioCategories = [
    { id: 'all', label: 'جميع المحطات (12 محطة)' },
    { id: 'tarab', label: 'طرب زمان' },
    { id: 'egypt', label: 'تسعينات ومصر' },
    { id: 'fairuz', label: 'فيروز والصباح' },
    { id: 'hits', label: 'روتانا ومنوعات' },
    { id: 'classic', label: 'شرقيات وعود' },
    { id: 'quran', label: 'القرآن الكريم' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[#0d1424] border border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/80 via-[#0d1424] to-purple-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>مشغل ومكتبة الموسيقى والراديو العربي</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-300">
                100 أغنية طربية أصيلة • 12 محطة راديو مباشرة 24/7 🎶
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Tabs: 100 Songs Library vs Live Radio */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800/80 gap-1.5">
          <button
            type="button"
            onClick={() => { setActiveTab('songs'); setSearchQuery(''); }}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'songs'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-amber-300" />
            <span>مكتبة الأغاني الـ 100 (تشغيل فردي)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('radio'); setSearchQuery(''); }}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'radio'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>محطات الراديو المباشرة (12 محطة)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>
        </div>

        {/* Active Player Deck */}
        <div className="p-3.5 bg-gradient-to-r from-[#121c32] via-[#0d1424] to-[#121c32] border-b border-slate-800 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shrink-0 shadow-md ${
                isPlaying 
                  ? 'bg-gradient-to-tr from-purple-600/30 to-amber-500/30 border-amber-400 text-amber-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}>
                {activeTab === 'songs' ? '🎵' : activeStation.icon}
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {activeTab === 'songs' ? activeSong.title : activeStation.name}
                  </h4>
                  {isPlaying && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{activeTab === 'songs' ? 'قيد التشغيل' : 'بث مباشر'}</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-purple-300 truncate mt-0.5 font-medium">
                  {activeTab === 'songs' 
                    ? `${activeSong.artist} • ${activeSong.categoryLabel}`
                    : activeStation.description
                  }
                </p>
              </div>
            </div>

            {/* Playback Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Equalizer animation */}
              {isPlaying && (
                <div className="hidden sm:flex items-end gap-0.5 h-5 px-2 bg-slate-900/80 rounded-lg border border-slate-800">
                  <span className="w-1 bg-amber-400 rounded-full animate-soundwave-1"></span>
                  <span className="w-1 bg-amber-400 rounded-full animate-soundwave-2"></span>
                  <span className="w-1 bg-amber-400 rounded-full animate-soundwave-3"></span>
                  <span className="w-1 bg-amber-400 rounded-full animate-soundwave-4"></span>
                </div>
              )}

              {/* Prev / Next in Songs mode */}
              {activeTab === 'songs' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevSong}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
                    title="الأغنية السابقة"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSong}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
                    title="الأغنية التالية"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  {/* Shuffle Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setPlayMode(playMode === 'shuffle' ? 'sequential' : 'shuffle');
                      sounds.playCoinsReward();
                    }}
                    className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                      playMode === 'shuffle'
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={playMode === 'shuffle' ? 'التشغيل العشوائي مفعّل 🔀' : 'تفعيل التشغيل العشوائي 🔀'}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  {/* Sequential / Repeat Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (playMode === 'sequential') setPlayMode('repeat_one');
                      else if (playMode === 'repeat_one') setPlayMode('sequential');
                      else setPlayMode('sequential');
                      sounds.playCoinsReward();
                    }}
                    className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                      playMode === 'repeat_one'
                        ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                        : playMode === 'sequential'
                        ? 'bg-indigo-600/30 border-indigo-400/60 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={
                      playMode === 'repeat_one'
                        ? 'تكرار نفس الأغنية 🔂'
                        : 'تشغيل تسلسلي متتالي للأغاني 🔁'
                    }
                  >
                    {playMode === 'repeat_one' ? <Repeat1 className="w-3.5 h-3.5 text-purple-300" /> : <Repeat className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Main Play/Pause Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={isLoading}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                  isPlaying
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {isLoading ? (
                  <Disc3 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>{isLoading ? 'جاري التحميل...' : isPlaying ? 'إيقاف' : 'تشغيل'}</span>
              </button>

              {/* Volume Toggle */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
                title={isMuted ? 'إلغاء الكتم' : 'كتم'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              </button>
            </div>
          </div>

          {/* Timeline Seek Bar in Songs Mode */}
          {activeTab === 'songs' && (
            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
              <span>{formatSeconds(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || activeSong.durationSeconds || 240}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span>{activeSong.duration || formatSeconds(duration)}</span>
            </div>
          )}
        </div>

        {/* Search & Categories Bar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-800 bg-[#090e1a] space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'songs'
                  ? "ابحث عن أي أغنية أو فنان (أم كلثوم، فيروز، حليم، دياب، شيرين...)"
                  : "ابحث عن محطة راديو (طرب، تسعينات، فيروز، قرآن، روتانا...)"
              }
              className="w-full bg-[#121c32] border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold scrollbar-none">
            {(activeTab === 'songs' ? songCategories : radioCategories).map((c) => {
              const isSelected = activeTab === 'songs' ? selectedSongCategory === c.id : selectedRadioCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (activeTab === 'songs') setSelectedSongCategory(c.id);
                    else setSelectedRadioCategory(c.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scroll-smooth">
          
          {/* TAB 1: 100 SONGS */}
          {activeTab === 'songs' && (
            <div className="space-y-1.5">
              {filteredSongs.map((song, idx) => {
                const isThisSelected = activeSong.id === song.id;
                const isThisPlaying = isThisSelected && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className={`p-2.5 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                      isThisSelected
                        ? 'bg-purple-950/40 border-purple-500/70 shadow-md ring-1 ring-purple-500/40'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                        isThisPlaying 
                          ? 'bg-purple-600 text-white animate-pulse' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="truncate">
                        <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                          <span>{song.title}</span>
                          {isThisSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                          {song.artist} • <span className="text-purple-400 font-bold">{song.categoryLabel}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">{song.duration}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisSelected) {
                            handleTogglePlay();
                          } else {
                            handleSelectSong(song);
                          }
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all active:scale-95 ${
                          isThisPlaying 
                            ? 'bg-purple-600 text-white shadow' 
                            : 'bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white'
                        }`}
                        title={isThisPlaying ? 'إيقاف' : 'تشغيل'}
                      >
                        {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 12 RADIO STATIONS */}
          {activeTab === 'radio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredStations.map((station) => {
                const isCurrentStation = activeStation.id === station.id;
                const isCurrentPlaying = isCurrentStation && isPlaying;

                return (
                  <div
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className={`p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                      isCurrentStation
                        ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                        isCurrentPlaying 
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white animate-pulse' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {station.icon}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-white truncate">{station.name}</h4>
                          <span className="text-xs">{station.countryFlag}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {station.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] font-bold border border-slate-700">
                            {station.categoryLabel}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                            <Signal className="w-2.5 h-2.5" /> {station.bitrate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentStation) {
                          handleTogglePlay();
                        } else {
                          handleSelectStation(station);
                        }
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 transition-all shadow-md active:scale-95 ${
                        isCurrentPlaying
                          ? 'bg-red-600 text-white shadow-red-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                      }`}
                      title={isCurrentPlaying ? 'إيقاف' : 'تشغيل المحطة'}
                    >
                      {isCurrentPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950 mr-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// Aliased export for compatibility across codebase
export const ArabicMusicPlayerModal = MusicRadioModal;
