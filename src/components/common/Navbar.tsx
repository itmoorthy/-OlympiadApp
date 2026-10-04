import React from 'react';
import { Home, BookOpen, Trophy, BarChart3, Settings } from 'lucide-react';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { id: 'practice_selector', label: 'Practice', icon: <BookOpen className="w-6 h-6" /> },
    { id: 'daily_challenge', label: 'Challenge', icon: <Trophy className="w-6 h-6" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
  ];

  const isNavActive = (id: AppView) => {
    if (id === currentView) return true;
    if (id === 'practice_selector' && (currentView === 'practice_session' || currentView === 'mock_setup' || currentView === 'mock_exam' || currentView === 'mock_result' || currentView === 'previous_year')) {
      return true;
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-amber-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isNavActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-600 hover:text-slate-800 font-medium'
              }`}
              aria-label={item.label}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-amber-100 text-amber-600 scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
