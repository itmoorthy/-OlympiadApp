import React from 'react';
import { BadgeDefinition } from '../../types';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeDefinition;
  isUnlocked: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isUnlocked }) => {
  return (
    <div
      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
        isUnlocked
          ? 'bg-amber-50/60 border-amber-300 text-slate-800 shadow-xs'
          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-2xs ${
          isUnlocked
            ? 'bg-linear-to-tr from-amber-400 to-yellow-300 shadow-amber-400/20'
            : 'bg-slate-200 text-slate-400'
        }`}
      >
        {isUnlocked ? badge.emoji : <Lock className="w-5 h-5 text-slate-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-800 truncate">
          {badge.name}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
          {badge.description}
        </p>
      </div>
    </div>
  );
};
