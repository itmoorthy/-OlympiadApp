import React from 'react';
import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  letter: string; // 'A', 'B', 'C', 'D'
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  letter,
  text,
  index,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onSelect,
}) => {
  // Determine styles based on answer state
  let containerStyles =
    'border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 shadow-xs';
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  if (showResult) {
    if (isCorrect) {
      containerStyles =
        'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20';
      badgeStyles = 'bg-emerald-500 text-white border-emerald-600';
    } else if (isSelected && !isCorrect) {
      containerStyles =
        'border-2 border-rose-400 bg-rose-50 text-rose-950 opacity-90';
      badgeStyles = 'bg-rose-500 text-white border-rose-600';
    } else {
      containerStyles = 'border-2 border-slate-200 bg-slate-50/70 text-slate-400 opacity-60';
      badgeStyles = 'bg-slate-200 text-slate-400 border-slate-200';
    }
  } else if (isSelected) {
    containerStyles =
      'border-2 border-amber-500 bg-amber-50 text-amber-950 shadow-md ring-2 ring-amber-500/20';
    badgeStyles = 'bg-amber-500 text-white border-amber-600';
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      disabled={disabled}
      className={`w-full min-h-[58px] p-4 rounded-2xl flex items-center justify-between gap-3 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:cursor-default ${containerStyles}`}
      aria-label={`Option ${letter}: ${text}`}
    >
      <div className="flex items-center gap-3.5 flex-1">
        {/* Letter Badge */}
        <span
          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-base border ${badgeStyles} transition-colors`}
        >
          {letter}
        </span>
        {/* Option Text */}
        <span className="text-base sm:text-lg font-medium leading-snug">
          {text}
        </span>
      </div>

      {/* Result Indicator Icon */}
      {showResult && isCorrect && (
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in-75 duration-150">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
      )}
      {showResult && isSelected && !isCorrect && (
        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in-75 duration-150">
          <X className="w-5 h-5 stroke-[3]" />
        </div>
      )}
    </button>
  );
};
