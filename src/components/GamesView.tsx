import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  ChevronRight,
  Flame,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, TriviaQuestion, LeaderboardEntry } from '../types/chat';
import { TRIVIA_QUESTIONS, LEADERBOARD_USERS } from '../data/seedData';
import { sounds } from '../utils/soundEffects';

interface GamesViewProps {
  currentUser: User;
  onUpdateCoins: (newCoins: number) => void;
  onOpenWallet: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  currentUser,
  onUpdateCoins,
  onOpenWallet,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trivia' | 'leaderboard'>('trivia');

  // Trivia State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [scoreStreak, setScoreStreak] = useState(0);
  const [totalTriviaPoints, setTotalTriviaPoints] = useState(0);

  const question = TRIVIA_QUESTIONS[currentQuestionIndex];

  // Question Timer
  useEffect(() => {
    if (activeSubTab !== 'trivia' || hasAnswered) return;

    if (timerSeconds <= 0) {
      setHasAnswered(true);
      setScoreStreak(0);
      return;
    }

    const timer = setInterval(() => {
      setTimerSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSeconds, activeSubTab, hasAnswered]);

  const handleSelectAnswer = (optionIdx: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIdx);
    setHasAnswered(true);

    const isCorrect = optionIdx === question.correctIndex;
    if (isCorrect) {
      sounds.playCoinsReward();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      // Strictly 10 coins reward for contest participation/correct answer
      const reward = 10;
      onUpdateCoins(currentUser.coins + reward);
      setScoreStreak(prev => prev + 1);
      setTotalTriviaPoints(prev => prev + reward);
    } else {
      sounds.playMessageSent();
      setScoreStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setTimerSeconds(15);
    setCurrentQuestionIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-3.5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            المسابقات الثقافية ولوحة الصدارة
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-300">
            تحديات، أسئلة ذكاء وسرعة، وجوائز كوينز كاش مباشرة
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Coins className="w-3.5 h-3.5" />
          <span>{currentUser.coins.toLocaleString()} 🪙</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('trivia')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'trivia'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>المسابقة الثقافية والجوائز</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>لوحة الصدارة العالمية</span>
        </button>
      </div>

      {/* 1. Cultural Trivia Quiz Engine */}
      {activeSubTab === 'trivia' && (
        <div className="space-y-3.5">
          
          {/* Top Status Card */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">سلسلة الفوز 🔥</span>
              <span className="font-black text-amber-400 text-sm sm:text-base">{scoreStreak} متتالية</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">الوقت المتبقي ⏳</span>
              <span className={`font-black text-sm sm:text-base ${timerSeconds <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                0:{timerSeconds < 10 ? '0' : ''}{timerSeconds}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">جائزة السؤال 🪙</span>
              <span className="font-black text-purple-400 text-sm sm:text-base">+{question.coinsReward} كوينز</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
            
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-bold text-[11px]">
                {question.category}
              </span>
              <span className="text-slate-400 text-[11px]">
                سؤال رقم {currentQuestionIndex + 1} من {TRIVIA_QUESTIONS.length}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-black text-white leading-relaxed">
              {question.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === question.correctIndex;
                let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-indigo-500/60';

                if (hasAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-950/80 border-red-500 text-red-200 font-black';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnswered}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-3 rounded-2xl border text-right text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer feedback & Explanation */}
            {hasAnswered && (
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  {selectedOption === question.correctIndex ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> أحسنت! إجابة صحيحة (+{question.coinsReward} كوينز)
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> للأسف إجابة خاطئة! حظ أوفر في السؤال القادم
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  💡 {question.explanation}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                  >
                    <span>السؤال التالي</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 2. Global Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-2.5">
          <div className="p-2.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">لوحة الشرف وتصنيف المتصدرين في شات مصر والعرب</span>
            <span className="text-amber-400 font-bold">تحديث مباشر</span>
          </div>

          <div className="space-y-1.5">
            {LEADERBOARD_USERS.map((user) => (
              <div
                key={user.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  user.rank === 1
                    ? 'bg-gradient-to-r from-amber-950/50 to-slate-900 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : user.rank === 2
                    ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-500/60'
                    : user.rank === 3
                    ? 'bg-gradient-to-r from-amber-950/20 to-slate-950 border-amber-700/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                  </div>

                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1">
                      {user.name}
                    </h4>
                    <span className="text-[9px] text-amber-400 font-bold">
                      {user.badge}
                    </span>
                  </div>
                </div>

                <div className="text-left text-xs">
                  <span className="text-emerald-400 font-black block text-xs">
                    {user.points.toLocaleString()} نقطة
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {user.giftsCount} هدية مرسلة 🎁
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
