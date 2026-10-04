import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Home, Sparkles, CheckCircle2 } from 'lucide-react';
import { Question, UserAttempt } from '../../types';
import { QuestionCard } from './QuestionCard';
import { StorageService } from '../../services/storageService';
import { GamificationService } from '../../services/gamificationService';
import { soundService } from '../../services/soundService';

interface PracticeSessionProps {
  title: string;
  subtitle?: string;
  questions: Question[];
  onFinish: () => void;
  onExit: () => void;
  onRetry: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  title,
  subtitle,
  questions,
  onFinish,
  onExit,
  onRetry,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [sessionAttempts, setSessionAttempts] = useState<UserAttempt[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalStarsEarnedInSession, setTotalStarsEarnedInSession] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOptionIndex !== null || !currentQuestion) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    setSelectedOptionIndex(optionIndex);

    // Audio feedback
    if (isCorrect) {
      soundService.playCorrect();
    } else {
      soundService.playIncorrect();
    }

    const attempt: UserAttempt = {
      id: `att_${Date.now()}`,
      questionId: currentQuestion.id,
      question: currentQuestion,
      selectedOptionIndex: optionIndex,
      isCorrect,
      timeTakenSeconds: timeSpent,
      timestamp: Date.now(),
    };

    setSessionAttempts((prev) => [...prev, attempt]);

    // Record in persistent storage
    const result = StorageService.recordQuestionAttempt(attempt);
    setTotalStarsEarnedInSession((prev) => prev + result.starsEarned);

    // Check badges
    GamificationService.checkAndAwardBadges(result.updatedProgress);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      // Completed session
      soundService.playCelebration();
      GamificationService.triggerConfetti();
      setIsSessionComplete(true);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center bg-white rounded-3xl border border-amber-200 shadow-sm mt-8">
        <p className="text-slate-600 font-semibold mb-4">No questions loaded for this topic yet.</p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Summary Screen when complete
  if (isSessionComplete) {
    const correctCount = sessionAttempts.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="max-w-lg mx-auto py-6 px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xl text-center">
          <div className="w-20 h-20 bg-linear-to-tr from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-amber-400/30">
            🎉
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif] mb-1">
            Super Practice!
          </h2>
          <p className="text-slate-600 font-medium text-sm mb-6">
            You completed all {questions.length} questions in this session.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
              <span className="text-xs font-bold text-slate-600 uppercase block">Score</span>
              <span className="text-2xl font-black text-amber-700">
                {correctCount}/{questions.length}
              </span>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
              <span className="text-xs font-bold text-slate-600 uppercase block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-700">
                {accuracy}%
              </span>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-3 border border-yellow-200">
              <span className="text-xs font-bold text-slate-600 uppercase block">Stars</span>
              <span className="text-2xl font-black text-yellow-600 flex items-center justify-center gap-1">
                ⭐ +{totalStarsEarnedInSession}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full min-h-[52px] bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Practice Again</span>
            </button>

            <button
              onClick={onExit}
              className="w-full min-h-[50px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Home className="w-5 h-5 text-slate-600" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 pb-24 md:pb-8">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
            {title}
          </h1>
          {subtitle && <p className="text-[11px] text-slate-600">{subtitle}</p>}
        </div>

        <div className="bg-amber-100 text-amber-900 font-black text-xs px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
          Question {currentIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-linear-to-r from-amber-500 to-yellow-400 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* One Question At A Time */}
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        selectedOptionIndex={selectedOptionIndex}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    </div>
  );
};
