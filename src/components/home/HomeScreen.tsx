import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Trophy,
  Dices,
  BarChart3,
  Clock,
  BookOpen,
} from 'lucide-react';
import { SubjectId, UserProgress, Grade, AppView, Difficulty } from '../../types';
import { SUBJECT_CONFIGS, DIFFICULTIES } from '../../config/olympiadConfig';
import { ProgressService } from '../../services/progressService';
import { GamificationService } from '../../services/gamificationService';
import { Modal } from '../common/Modal';

interface HomeScreenProps {
  progress: UserProgress;
  selectedGrade: Grade;
  onSelectSubject: (subject: SubjectId) => void;
  onQuickPractice: (subject: SubjectId, count: number, difficulty: Difficulty) => void;
  onStartDailyChallenge: () => void;
  onNavigate: (view: AppView) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  selectedGrade,
  onSelectSubject,
  onQuickPractice,
  onStartDailyChallenge,
  onNavigate,
}) => {
  const [isQuickPracticeModalOpen, setIsQuickPracticeModalOpen] = useState(false);
  const [quickSubject, setQuickSubject] = useState<SubjectId>('IMO');
  const [quickCount, setQuickCount] = useState<number>(10);
  const [quickDifficulty, setQuickDifficulty] = useState<Difficulty>('Olympiad Challenge');

  const overallAccuracy = ProgressService.getOverallAccuracy(progress);
  const rank = GamificationService.getRank(progress.stars);
  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = Boolean(progress.dailyChallengeHistory?.[today]?.completed);

  const handleStartQuick = () => {
    setIsQuickPracticeModalOpen(false);
    onQuickPractice(quickSubject, quickCount, quickDifficulty);
  };

  return (
    <div className="max-w-4xl mx-auto py-5 px-4 pb-24 md:pb-8">
      {/* Friendly Hero Banner */}
      <div className="bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 mb-6 relative overflow-hidden">
        {/* Background playful circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-black/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <span>{selectedGrade} Edition</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              Olympiad Ready
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-['Fredoka',sans-serif] leading-tight mb-2">
            Olympiad Buddy
          </h1>
          <p className="text-amber-950 font-extrabold text-base sm:text-lg max-w-xl mb-5 opacity-90">
            &ldquo;Learn. Practice. Challenge Yourself.&rdquo;
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuickPracticeModalOpen(true)}
              className="min-h-[48px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-black/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Quick Practice</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={onStartDailyChallenge}
              className="min-h-[48px] px-5 py-2.5 bg-white/90 hover:bg-white text-amber-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>{isDailyDone ? 'Daily Done ⭐' : 'Daily Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* THREE LARGE EXAM CARDS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
            Select Exam Category
          </h2>
          <span className="text-xs text-slate-600 font-semibold">
            {selectedGrade} Curriculum
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* IMO Card */}
          <div
            onClick={() => onSelectSubject('IMO')}
            className="group bg-white hover:bg-amber-50/50 rounded-3xl p-5 sm:p-6 border-2 border-amber-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl p-2 rounded-2xl bg-amber-100 group-hover:scale-110 transition-transform inline-block">
                  🧮
                </span>
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                  {SUBJECT_CONFIGS.IMO.topics.length} Topics
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-['Fredoka',sans-serif] group-hover:text-amber-700 transition-colors">
                IMO
              </h3>
              <p className="text-xs font-bold text-amber-800/80 mb-1">
                Mathematics
              </p>
              <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                Numbers, fractions, geometry, patterns & logical problem-solving.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-amber-600">
              <span>Start Learning</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* ISO Card */}
          <div
            onClick={() => onSelectSubject('ISO')}
            className="group bg-white hover:bg-emerald-50/50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl p-2 rounded-2xl bg-emerald-100 group-hover:scale-110 transition-transform inline-block">
                  🔬
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  {SUBJECT_CONFIGS.ISO.topics.length} Topics
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-['Fredoka',sans-serif] group-hover:text-emerald-700 transition-colors">
                ISO
              </h3>
              <p className="text-xs font-bold text-emerald-800/80 mb-1">
                Science
              </p>
              <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                Plants, animals, food, matter, energy, universe & SOF 2025 questions.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-emerald-600">
              <span>Start Learning</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* ICSO Card */}
          <div
            onClick={() => onSelectSubject('ICSO')}
            className="group bg-white hover:bg-indigo-50/50 rounded-3xl p-5 sm:p-6 border-2 border-indigo-200 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl p-2 rounded-2xl bg-indigo-100 group-hover:scale-110 transition-transform inline-block">
                  💻
                </span>
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-xl">
                  {SUBJECT_CONFIGS.ICSO.topics.length} Topics
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-['Fredoka',sans-serif] group-hover:text-indigo-700 transition-colors">
                ICSO
              </h3>
              <p className="text-xs font-bold text-indigo-800/80 mb-1">
                Computer Science
              </p>
              <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                Hardware, cyber safety, algorithmic thinking & coding fundamentals.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-indigo-600">
              <span>Start Learning</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK MODES SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Quick Practice Card */}
        <div
          onClick={() => setIsQuickPracticeModalOpen(true)}
          className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-sm hover:border-amber-400 transition-all flex items-center justify-between cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 font-['Fredoka',sans-serif]">
                Quick Practice
              </h3>
              <p className="text-xs text-slate-600">
                Choose 10, 20, or 30 questions to test your skills right now.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-500" />
        </div>

        {/* Daily Challenge Card */}
        <div
          onClick={onStartDailyChallenge}
          className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-sm hover:border-amber-400 transition-all flex items-center justify-between cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-800 font-['Fredoka',sans-serif]">
                  Daily Challenge
                </h3>
                {isDailyDone && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md">
                    Done
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                9 mixed questions: 3 Math + 3 Science + 3 Computer.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-orange-500" />
        </div>
      </div>

      {/* MY PROGRESS SUMMARY (Visible without login) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
              My Progress & Achievements
            </h2>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Parent Dashboard</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Attempted */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Attempted
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              {progress.totalQuestionsAttempted}
            </span>
          </div>

          {/* Correct */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Correct
            </span>
            <span className="text-2xl font-black text-emerald-600 block mt-1">
              {progress.totalCorrect}
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Accuracy
            </span>
            <span className="text-2xl font-black text-amber-600 block mt-1">
              {overallAccuracy}%
            </span>
          </div>

          {/* Stars */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Stars
            </span>
            <span className="text-2xl font-black text-yellow-600 flex items-center justify-center gap-1 mt-1">
              <span>⭐</span>
              <span>{progress.stars}</span>
            </span>
          </div>

          {/* Streak */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Streak
            </span>
            <span className="text-2xl font-black text-orange-600 flex items-center justify-center gap-1 mt-1">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span>{progress.streak}d</span>
            </span>
          </div>
        </div>
      </div>

      {/* QUICK PRACTICE CONFIGURATION MODAL (Asks for 10, 20, 30 questions) */}
      <Modal
        isOpen={isQuickPracticeModalOpen}
        onClose={() => setIsQuickPracticeModalOpen(false)}
        title="Start Quick Practice"
      >
        <div className="space-y-5">
          {/* Subject choice */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Select Subject:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['IMO', 'ISO', 'ICSO'] as SubjectId[]).map((subj) => (
                <button
                  key={subj}
                  onClick={() => setQuickSubject(subj)}
                  className={`py-2.5 px-2 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer ${
                    quickSubject === subj
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'
                  }`}
                >
                  {SUBJECT_CONFIGS[subj].emoji} {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count choice: 10, 20, 30 */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Choose Number of Questions:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[10, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuickCount(num)}
                  className={`py-3.5 rounded-2xl font-extrabold text-base border-2 transition-all cursor-pointer ${
                    quickCount === num
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level (Default: Olympiad Challenge) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Difficulty Level:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setQuickDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center cursor-pointer ${
                    quickDifficulty === diff
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleStartQuick}
              className="w-full py-3.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer text-base"
            >
              Start {quickCount} Questions Practice
            </button>
            <button
              onClick={() => setIsQuickPracticeModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
