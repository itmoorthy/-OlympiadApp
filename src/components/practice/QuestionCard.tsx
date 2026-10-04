import React from 'react';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { Question } from '../../types';
import { AnswerOption } from './AnswerOption';
import { ExplanationCard } from './ExplanationCard';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionIndex,
  onSelectOption,
  onNext,
  isLastQuestion,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const hasAnswered = selectedOptionIndex !== null;
  const isCorrect =
    hasAnswered && selectedOptionIndex === question.correctOptionIndex;

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Hard: 'bg-rose-100 text-rose-800 border-rose-300',
    'Olympiad Challenge': 'bg-purple-100 text-purple-800 border-purple-300',
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-200/80 shadow-md">
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-xl">
            {question.subject}
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
            {question.topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
              difficultyColors[question.difficulty] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {question.difficulty}
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
            {question.grade}
          </span>
        </div>
      </div>

      {/* Olympiad Source Tag */}
      <div className="flex items-center gap-1.5 text-xs text-amber-800 mb-3 font-medium">
        <Award className="w-3.5 h-3.5 text-amber-600" />
        <span>Original Olympiad-style question</span>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-4">
        {question.options.map((optionText, idx) => (
          <AnswerOption
            key={idx}
            letter={letters[idx]}
            text={optionText}
            index={idx}
            isSelected={selectedOptionIndex === idx}
            isCorrect={idx === question.correctOptionIndex}
            showResult={hasAnswered}
            disabled={hasAnswered}
            onSelect={onSelectOption}
          />
        ))}
      </div>

      {/* Instant Result & Explanation */}
      {hasAnswered && (
        <>
          <ExplanationCard
            isCorrect={isCorrect}
            correctAnswerText={question.options[question.correctOptionIndex]}
            correctOptionLetter={letters[question.correctOptionIndex]}
            explanation={question.explanation}
          />

          {/* Action Button: Next Question */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onNext}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>{isLastQuestion ? 'See Summary' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
