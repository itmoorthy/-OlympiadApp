import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserAttempt } from '../../types';
import { CheckCircle2, XCircle, Lightbulb, Filter } from 'lucide-react';

interface QuestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: UserAttempt[];
}

export const QuestionReviewModal: React.FC<QuestionReviewModalProps> = ({
  isOpen,
  onClose,
  attempts,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const letters = ['A', 'B', 'C', 'D'];

  const filteredAttempts = attempts.filter((att) => {
    if (filter === 'incorrect') return !att.isCorrect;
    if (filter === 'correct') return att.isCorrect;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Answered Questions"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Filter controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'incorrect', label: 'Incorrect Only' },
              { id: 'correct', label: 'Correct Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === f.id
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of reviewed questions */}
        {filteredAttempts.length === 0 ? (
          <p className="text-center text-slate-600 py-8 text-sm">
            No questions match this filter.
          </p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredAttempts.map((att, idx) => {
              const q = att.question;
              const isSkipped = att.selectedOptionIndex === -1;
              const userOpt = !isSkipped ? q.options[att.selectedOptionIndex] : null;
              const correctOpt = q.options[q.correctOptionIndex];

              return (
                <div
                  key={att.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {q.subject} • {q.topic}
                    </span>
                    {att.isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-slate-900 text-sm">{q.question}</p>

                  <div className="text-xs space-y-1">
                    {!att.isCorrect && userOpt && (
                      <div className="text-rose-700 font-medium">
                        Your answer: <span className="font-bold">{userOpt}</span>
                      </div>
                    )}
                    <div className="text-emerald-700 font-medium">
                      Correct answer:{' '}
                      <span className="font-bold">
                        {letters[q.correctOptionIndex]}. {correctOpt}
                      </span>
                    </div>
                  </div>

                  {/* Step by step explanation */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1 text-amber-800 font-bold mb-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Why?</span>
                    </div>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
