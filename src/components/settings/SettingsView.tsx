import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, AlertTriangle, RotateCcw, Info, Check } from 'lucide-react';
import { AppSettings, Grade, Difficulty } from '../../types';
import { GRADES, DIFFICULTIES } from '../../config/olympiadConfig';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetProgress: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto py-5 px-4 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
          Settings
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Customize your Olympiad Buddy learning experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Grade Selection */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <label className="block font-bold text-slate-800 text-base mb-1">
            Grade Level
          </label>
          <p className="text-xs text-slate-600 mb-4">
            Adapts all questions and difficulty algorithms to the selected grade.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {GRADES.map((grade) => {
              const isSelected = settings.selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => onUpdateSettings({ selectedGrade: grade })}
                  className={`py-3 px-2 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'
                  }`}
                >
                  <span>{grade}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Default Difficulty */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <label className="block font-bold text-slate-800 text-base mb-1">
            Preferred Default Difficulty
          </label>
          <p className="text-xs text-slate-600 mb-4">
            Default difficulty level used for random and practice sessions.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = settings.defaultDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onUpdateSettings({ defaultDifficulty: diff })}
                  className={`py-2.5 px-2 rounded-xl border-2 font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Audio & Animations */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Sound & Visuals</h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 block">Sound Effects</span>
                <span className="text-xs text-slate-600">
                  Encouraging chimes for correct answers & timer ticks
                </span>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Animation Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 block">Confetti & Animations</span>
                <span className="text-xs text-slate-600">
                  Celebration effects when finishing milestones
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateSettings({ animationEnabled: !settings.animationEnabled })
              }
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                settings.animationEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.animationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 4: About Olympiad Buddy */}
        <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <Info className="w-4 h-4 text-amber-700" />
            <span>About Olympiad Buddy</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            Designed for young learners preparing for International Mathematics Olympiad (IMO),
            International Science Olympiad (ISO), and International Computer Science Olympiad (ICSO).
            All student progress is safely stored locally on this device.
          </p>
          <div className="text-[11px] text-amber-800 font-semibold pt-1">
            Version 1.0.0 • Mobile-first Olympiad Platform
          </div>
        </div>

        {/* Section 5: Reset Progress */}
        <div className="bg-rose-50/60 rounded-3xl p-5 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-rose-900 text-sm">Reset All Progress</h4>
              <p className="text-xs text-rose-700">
                Clear all questions history, stars, streak and test scores.
              </p>
            </div>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Resetting */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Progress?"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">
            Are you sure you want to reset all progress?
          </h4>
          <p className="text-slate-600 text-sm mb-5">
            This will permanently remove your earned stars, streaks, badges, and test records on this device. This action cannot be undone.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                onResetProgress();
                setIsResetModalOpen(false);
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl active:scale-98"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl active:scale-98"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
