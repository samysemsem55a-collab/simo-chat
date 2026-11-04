import React from 'react';
import { 
  MessageCircle, 
  Compass, 
  Gamepad2, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export type NavTab = 'rooms' | 'chat' | 'games' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadChatsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadChatsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d18]/95 backdrop-blur-lg border-t border-slate-800/80 px-1 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Rooms / المجلس */}
        <button
          onClick={() => onTabChange('rooms')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all ${
            currentTab === 'rooms'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {currentTab === 'rooms' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]"></span>
            )}
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] mt-0.5 leading-tight">معاينة الغرف</span>
        </button>

        {/* Private Chat / محادثة */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all ${
            currentTab === 'chat'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[8px] font-bold px-1 py-0.1 rounded-full min-w-[14px] text-center">
                {unreadChatsCount}
              </span>
            )}
            {currentTab === 'chat' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]"></span>
            )}
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] mt-0.5 leading-tight">محادثة خاصة</span>
        </button>

        {/* Games & Cultural Quizzes / القطع الأثرية والمسابقات */}
        <button
          onClick={() => onTabChange('games')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all ${
            currentTab === 'games'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Gamepad2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <Sparkles className="w-2 h-2 text-amber-400 absolute -top-0.5 -right-1 animate-pulse" />
            {currentTab === 'games' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></span>
            )}
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] mt-0.5 leading-tight">القطع والألعاب</span>
        </button>

        {/* Profile / الملف الشخصي */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all ${
            currentTab === 'profile'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {currentTab === 'profile' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]"></span>
            )}
          </div>
          <span className="text-[9.5px] sm:text-[10.5px] mt-0.5 leading-tight">ملفي الشخصي</span>
        </button>

      </div>
    </nav>
  );
};
