import React, { useState } from 'react';
import { MockExamResult } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Home,
  Lightbulb,
} from 'lucide-react';

interface MockExamResultProps {
  result: MockExamResult;
  onRetake: () => void;
  onHome: () => void;
}

export const MockExamResultView: React.FC<MockExamResultProps> = ({
  result,
  onRetake,
  onHome,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const letters = ['A', 'B', 'C', 'D'];

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xl text-center mb-6">
        <div className="text-5xl mb-2">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Fredoka',sans-serif] mb-1">
          Test Complete!
        </h1>
        <p className="text-slate-600 text-sm font-medium mb-6">
          {result.subject} Olympiad • {result.grade}
        </p>

        {/* Primary Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <span className="text-xs font-bold text-slate-600 uppercase block">Score</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {result.correctCount}/{result.totalQuestions}
            </span>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <span className="text-xs font-bold text-slate-600 uppercase block">Accuracy</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {result.scorePercentage}%
            </span>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
            <span className="text-xs font-bold text-slate-600 uppercase block">Time Taken</span>
            <span className="text-lg sm:text-xl font-black text-indigo-700 block mt-1">
              {formatDuration(result.durationSeconds)}
            </span>
          </div>

          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
            <span className="text-xs font-bold text-slate-600 uppercase block">Earned</span>
            <span className="text-xl sm:text-2xl font-black text-purple-700 block mt-0.5">
              ⭐ +25 Bonus
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Tags */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>{result.correctCount} Correct</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-600">
            <XCircle className="w-4 h-4" />
            <span>{result.wrongCount} Wrong</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>{result.skippedCount} Skipped</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onRetake}
            className="flex-1 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Retake Test</span>
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Review Answers Section */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md">
        <h2 className="text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif] mb-4 flex items-center gap-2">
          <span>Review Answers & Explanations</span>
        </h2>

        <div className="space-y-3">
          {result.attempts.map((attempt, idx) => {
            const isExpanded = expandedIndex === idx;
            const q = attempt.question;
            const isSkipped = attempt.selectedOptionIndex === -1;
            const correctLetter = letters[q.correctOptionIndex];
            const userLetter = !isSkipped ? letters[attempt.selectedOptionIndex] : null;

            return (
              <div
                key={attempt.id}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="p-4 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 font-black text-xs text-slate-700 flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {attempt.isCorrect ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct</span>
                      </span>
                    ) : isSkipped ? (
                      <span className="text-amber-700 font-bold text-sm">
                        Skipped (Correct: {correctLetter})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-700 font-bold text-sm">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect (You chose {userLetter}, Correct: {correctLetter})</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
                      {isExpanded ? 'Hide' : 'View Explanation'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correctOptionIndex;
                        const isThisUserSelected = optIdx === attempt.selectedOptionIndex;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isThisUserSelected && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-900';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                          >
                            <span>
                              <strong>{letters[optIdx]}.</strong> {opt}
                            </span>
                            {isThisCorrect && (
                              <span className="text-emerald-700 font-black text-xs">✓ Correct</span>
                            )}
                            {isThisUserSelected && !isThisCorrect && (
                              <span className="text-rose-700 font-black text-xs">✗ Your Answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-Step Explanation */}
                    <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Why?</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
