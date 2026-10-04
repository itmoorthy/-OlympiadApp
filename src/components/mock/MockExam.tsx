import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Question, SubjectId, Grade, MockExamResult } from '../../types';
import { Modal } from '../common/Modal';
import { ExamService } from '../../services/examService';
import { StorageService } from '../../services/storageService';
import { GamificationService } from '../../services/gamificationService';
import { soundService } from '../../services/soundService';

interface MockExamProps {
  subject: SubjectId;
  grade: Grade;
  questions: Question[];
  durationMinutes: number;
  onFinishExam: (result: MockExamResult) => void;
  onExit: () => void;
}

export const MockExam: React.FC<MockExamProps> = ({
  subject,
  grade,
  questions,
  durationMinutes,
  onFinishExam,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const letters = ['A', 'B', 'C', 'D'];
  const currentQuestion = questions[currentIndex];

  // Track time per question on change
  useEffect(() => {
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    setQuestionTimes((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + timeSpent,
    }));
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // Exam Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        if (prev === 60) {
          // Warning chime when 1 min left
          soundService.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setUserSelections((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleSkipQuestion = () => {
    // If not answered yet, ensure it is recorded as skipped
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = () => {
    const totalDurationSeconds = durationMinutes * 60 - secondsRemaining;
    const result = ExamService.evaluateExam({
      subject,
      grade,
      questions,
      userSelections,
      questionTimes,
      totalDurationSeconds,
    });

    // Record mock exam result in local storage
    const updatedProgress = StorageService.recordMockExamResult(result);
    GamificationService.checkAndAwardBadges(updatedProgress);
    soundService.playCelebration();
    GamificationService.triggerConfetti();

    onFinishExam(result);
  };

  const answeredCount = Object.keys(userSelections).length;
  const skippedCount = questions.length - answeredCount;
  const isTimeCritical = secondsRemaining < 180; // less than 3 mins

  return (
    <div className="max-w-3xl mx-auto py-3 px-4 pb-24 md:pb-8">
      {/* Sticky Exam Status Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-200/80 p-3 shadow-md mb-4 flex items-center justify-between gap-3">
        {/* Exit Button */}
        <button
          onClick={() => setIsExitModalOpen(true)}
          className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          Exit Exam
        </button>

        {/* Question Counter */}
        <div className="text-center font-bold text-xs sm:text-sm text-slate-800">
          <span className="text-indigo-600 font-black">Question {currentIndex + 1}</span> of {questions.length}
        </div>

        {/* Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-extrabold shadow-2xs border ${
            isTimeCritical
              ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Question Quick-Jump Navigator Grid */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs mb-4">
        <div className="text-[11px] font-bold text-slate-600 uppercase mb-2 flex items-center justify-between">
          <span>Question Grid</span>
          <span className="text-slate-600">
            {answeredCount} Answered • {skippedCount} Pending
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
          {questions.map((_, idx) => {
            const isAnswered = userSelections[idx] !== undefined;
            const isCurrent = currentIndex === idx;

            let pillStyle = 'bg-slate-100 text-slate-600 border-slate-200';
            if (isAnswered) {
              pillStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
            }
            if (isCurrent) {
              pillStyle = 'ring-2 ring-indigo-500 bg-indigo-50 text-indigo-700 font-extrabold border-indigo-400';
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center border transition-all cursor-pointer ${pillStyle}`}
                aria-label={`Jump to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card (No answers revealed during test) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-indigo-100 shadow-md mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
            {currentQuestion.subject} • {currentQuestion.topic}
          </span>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
            {currentQuestion.grade}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((optionText, idx) => {
            const isSelected = userSelections[currentIndex] === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full min-h-[56px] p-4 rounded-2xl flex items-center gap-3.5 text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-base border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {letters[idx]}
                </span>
                <span className="text-base sm:text-lg font-medium leading-snug">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none min-h-[46px] px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
            {currentIndex < questions.length - 1 ? (
              <>
                <button
                  onClick={handleSkipQuestion}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="min-h-[46px] px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/25"
              >
                <span>Submit Exam</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Submit Button for easy access anytime */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all active:scale-95"
        >
          Ready to finish? Submit Mock Exam
        </button>
      </div>

      {/* Confirmation Modal Before Submission */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Mock Examination?"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            📝
          </div>
          <h4 className="text-lg font-extrabold text-slate-800 mb-2">
            Are you ready to submit your test?
          </h4>
          <p className="text-slate-600 text-sm mb-4">
            You have answered <strong className="text-emerald-600">{answeredCount}</strong> out of{' '}
            <strong>{questions.length}</strong> questions.
            {skippedCount > 0 && (
              <span className="block text-amber-700 font-semibold mt-1">
                ⚠️ You still have {skippedCount} unanswered questions!
              </span>
            )}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                setIsSubmitModalOpen(false);
                handleFinalSubmit();
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-98"
            >
              Yes, Submit My Exam!
            </button>
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl active:scale-98"
            >
              Keep Reviewing Questions
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal Before Exiting */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Exit Mock Exam?"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <p className="text-slate-600 text-sm mb-5">
            If you exit now, your current exam answers will not be recorded. Are you sure you want to quit?
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={onExit}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl"
            >
              Yes, Exit Exam
            </button>
            <button
              onClick={() => setIsExitModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl"
            >
              Continue Test
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
