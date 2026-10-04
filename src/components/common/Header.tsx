import React, { useState } from 'react';
import { Sparkles, Flame, ChevronDown, Check } from 'lucide-react';
import { Grade, AppView } from '../../types';
import { GRADES } from '../../config/olympiadConfig';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedGrade: Grade;
  onGradeChange: (grade: Grade) => void;
  stars: number;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedGrade,
  onGradeChange,
  stars,
  streak,
}) => {
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white font-extrabold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform text-xl">
            OB
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg text-slate-800 tracking-tight font-['Fredoka',sans-serif]">
                Olympiad Buddy
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse hidden sm:inline" />
            </div>
            <p className="text-[10px] text-amber-700 font-semibold tracking-wide uppercase hidden sm:block">
              Learn • Practice • Challenge
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {[
            { id: 'home', label: 'Home' },
            { id: 'practice_selector', label: 'Practice' },
            { id: 'daily_challenge', label: 'Daily Challenge' },
            { id: 'progress', label: 'Progress & Parent' },
            { id: 'settings', label: 'Settings' },
          ].map((item) => {
            const active =
              currentView === item.id ||
              (item.id === 'practice_selector' &&
                ['practice_session', 'mock_setup', 'mock_exam', 'mock_result', 'previous_year'].includes(
                  currentView
                ));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AppView)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-amber-100 text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Stats & Grade Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Grade Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setGradeDropdownOpen(!gradeDropdownOpen)}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-95"
              aria-label="Select Grade"
            >
              <span>{selectedGrade}</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {gradeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setGradeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white border border-amber-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Select Grade
                  </div>
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        onGradeChange(g);
                        setGradeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-left transition-colors ${
                        selectedGrade === g
                          ? 'bg-amber-50 text-amber-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{g}</span>
                      {selectedGrade === g && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Daily Streak */}
          <div
            title="Daily Practice Streak"
            className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xs"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streak}</span>
          </div>

          {/* Stars Pill */}
          <div
            title="Earned Stars"
            className="flex items-center gap-1 bg-amber-500 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-amber-500/20"
          >
            <span className="text-sm">⭐</span>
            <span>{stars}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
