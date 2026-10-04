import React from 'react';
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExplanationCardProps {
  isCorrect: boolean;
  correctAnswerText: string;
  correctOptionLetter: string;
  explanation: string;
  starsEarned?: number;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  isCorrect,
  correctAnswerText,
  correctOptionLetter,
  explanation,
  starsEarned = 10,
}) => {
  return (
    <div
      className={`mt-5 p-5 rounded-2xl border-2 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
        isCorrect
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-amber-50/90 border-amber-300 text-slate-800'
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/10">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span className="font-extrabold text-lg text-emerald-700 font-['Fredoka',sans-serif]">
                Awesome! Correct!
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <span className="font-extrabold text-lg text-amber-800 font-['Fredoka',sans-serif]">
                Not quite!
              </span>
            </>
          )}
        </div>

        {/* Reward Pill */}
        <div className="flex items-center gap-1 bg-white/90 border border-amber-300/80 px-3 py-1 rounded-xl text-sm font-black shadow-xs">
          <span>⭐</span>
          <span className="text-amber-700">
            {isCorrect ? `+${starsEarned} Stars` : '+2 Effort Stars'}
          </span>
        </div>
      </div>

      {/* If incorrect, show what the correct answer is */}
      {!isCorrect && (
        <div className="mb-3 text-sm sm:text-base font-semibold text-slate-800">
          Correct answer:{' '}
          <span className="inline-block bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 text-emerald-700 font-bold ml-1">
            {correctOptionLetter}. {correctAnswerText}
          </span>
        </div>
      )}

      {/* Explanation Section */}
      <div className="bg-white/80 rounded-xl p-4 border border-amber-200/60 shadow-2xs">
        <div className="flex items-center gap-2 mb-1.5 text-amber-700 font-bold text-sm">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Why? (Step-by-step)</span>
        </div>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line">
          {explanation}
        </p>
      </div>
    </div>
  );
};
