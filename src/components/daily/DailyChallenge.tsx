import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, Flame, ArrowRight, ArrowLeft } from 'lucide-react';
import { Grade, Question } from '../../types';
import { QuestionRepository } from '../../services/questionRepository';
import { StorageService } from '../../services/storageService';
import { GamificationService } from '../../services/gamificationService';
import { soundService } from '../../services/soundService';
import { AnswerOption } from '../practice/AnswerOption';
import { ExplanationCard } from '../practice/ExplanationCard';

interface DailyChallengeProps {
  grade: Grade;
  onFinish: () => void;
  onExit: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  grade,
  onFinish,
  onExit,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = StorageService.getProgress();
  const todayRecord = progress.dailyChallengeHistory?.[today];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isCompletedToday, setIsCompletedToday] = useState(Boolean(todayRecord?.completed));
  const [isLoading, setIsLoading] = useState(!todayRecord?.completed);

  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (todayRecord?.completed) {
      setIsCompletedToday(true);
      setIsLoading(false);
      return;
    }

    // Assemble today's 9 questions: 3 IMO, 3 ISO, 3 ICSO
    const mathQuestions = QuestionRepository.getRandomQuestions(3, {
      subject: 'IMO',
      grade,
    });
    const scienceQuestions = QuestionRepository.getRandomQuestions(3, {
      subject: 'ISO',
      grade,
    });
    const csQuestions = QuestionRepository.getRandomQuestions(3, {
      subject: 'ICSO',
      grade,
    });

    const combined = [...mathQuestions, ...scienceQuestions, ...csQuestions];
    setQuestions(combined);
    setIsLoading(false);
  }, [grade]);

  const currentQuestion = questions[currentIndex];
  const hasAnswered = selectedOptionIndex !== null;
  const isCorrect = hasAnswered && selectedOptionIndex === currentQuestion?.correctOptionIndex;

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null || !currentQuestion) return;

    setSelectedOptionIndex(idx);
    const correct = idx === currentQuestion.correctOptionIndex;

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
      soundService.playCorrect();
    } else {
      soundService.playIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      // Completed daily challenge!
      const totalScore = correctAnswersCount + (isCorrect ? 1 : 0);
      const updated = StorageService.recordDailyChallengeCompletion(totalScore, questions.length);
      GamificationService.checkAndAwardBadges(updated);
      soundService.playCelebration();
      GamificationService.triggerConfetti();
      setIsCompletedToday(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-slate-700">Loading Today’s Olympiad Challenge...</p>
      </div>
    );
  }

  // If already finished today
  if (isCompletedToday) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xl text-center">
          <div className="w-20 h-20 bg-linear-to-tr from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-amber-400/30">
            🌟
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif] mb-2">
            Today’s Challenge Complete!
          </h1>
          <p className="text-slate-600 text-sm font-medium mb-6">
            You already completed your daily mixed challenge for today. Fantastic dedication!
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-900 font-semibold flex items-center justify-around">
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span>Streak Maintained!</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">⭐</span>
              <span>+50 Bonus Stars</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-6 font-medium">
            Come back tomorrow for a fresh set of mixed Olympiad problems! In the meantime, you can explore topic-wise practice.
          </p>

          <button
            onClick={onExit}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-98"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <h1 className="text-base font-extrabold text-slate-800 font-['Fredoka',sans-serif] flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Today’s Mixed Challenge</span>
          </h1>
          <span className="text-[11px] text-slate-600">
            3 Math • 3 Science • 3 Computer Science
          </span>
        </div>

        <div className="bg-amber-100 text-amber-900 font-black text-xs px-2.5 py-1.5 rounded-xl border border-amber-300">
          Q {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-linear-to-r from-amber-500 to-yellow-400 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Active Question */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-200/80 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-xl">
              {currentQuestion.subject}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
              {currentQuestion.topic}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-4">
            {currentQuestion.options.map((optionText, idx) => (
              <AnswerOption
                key={idx}
                letter={letters[idx]}
                text={optionText}
                index={idx}
                isSelected={selectedOptionIndex === idx}
                isCorrect={idx === currentQuestion.correctOptionIndex}
                showResult={hasAnswered}
                disabled={hasAnswered}
                onSelect={handleSelectOption}
              />
            ))}
          </div>

          {hasAnswered && (
            <>
              <ExplanationCard
                isCorrect={isCorrect}
                correctAnswerText={currentQuestion.options[currentQuestion.correctOptionIndex]}
                correctOptionLetter={letters[currentQuestion.correctOptionIndex]}
                explanation={currentQuestion.explanation}
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {currentIndex === questions.length - 1
                      ? 'Finish Daily Challenge'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
