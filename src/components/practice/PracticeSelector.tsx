import React, { useState } from 'react';
import { SubjectId, Grade, Difficulty } from '../../types';
import { SUBJECT_CONFIGS, DIFFICULTIES } from '../../config/olympiadConfig';
import { Sparkles, Dices, BookOpen, Clock, Award } from 'lucide-react';

interface PracticeSelectorProps {
  selectedGrade: Grade;
  onStartTopicPractice: (subject: SubjectId, topic: string, difficulty: Difficulty) => void;
  onStartRandomPractice: (subject: SubjectId, count: number, difficulty: Difficulty) => void;
  onStartMockExam: (subject: SubjectId, questionCount: number) => void;
  onStartPreviousYearPractice: (subject: SubjectId) => void;
  initialSubject?: SubjectId;
}

export const PracticeSelector: React.FC<PracticeSelectorProps> = ({
  selectedGrade,
  onStartTopicPractice,
  onStartRandomPractice,
  onStartMockExam,
  onStartPreviousYearPractice,
  initialSubject = 'IMO',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject);
  const [activeTab, setActiveTab] = useState<'topics' | 'random' | 'mock' | 'exam_style'>('topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [randomQuestionCount, setRandomQuestionCount] = useState<number>(10);
  const [mockQuestionCount, setMockQuestionCount] = useState<number>(20);

  const currentSubjectConfig = SUBJECT_CONFIGS[selectedSubject];

  return (
    <div className="max-w-4xl mx-auto py-5 px-4 pb-24 md:pb-8">
      {/* Page Title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
          Olympiad Practice Hub
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          Pick a subject, choose your topic or test your skills with a timed mock exam!
        </p>
      </div>

      {/* Subject Selector Buttons (3 Big Cards) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
        {(['IMO', 'ISO', 'ICSO'] as SubjectId[]).map((subjId) => {
          const cfg = SUBJECT_CONFIGS[subjId];
          const isSelected = selectedSubject === subjId;

          return (
            <button
              key={subjId}
              onClick={() => setSelectedSubject(subjId)}
              className={`p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/20'
                  : 'border-slate-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-1">{cfg.emoji}</div>
              <div className="font-extrabold text-base sm:text-lg text-slate-800 font-['Fredoka',sans-serif]">
                {cfg.name}
              </div>
              <div className="text-[11px] text-slate-600 font-medium hidden sm:block truncate">
                {cfg.fullName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 mb-6 border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'topics'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Topic-wise</span>
        </button>

        <button
          onClick={() => setActiveTab('random')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'random'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>Random</span>
        </button>

        <button
          onClick={() => setActiveTab('mock')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'mock'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mock Test</span>
        </button>

        <button
          onClick={() => setActiveTab('exam_style')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'exam_style'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Exam Style</span>
        </button>
      </div>

      {/* Difficulty Selector Bar (for Topics & Random modes) */}
      {(activeTab === 'topics' || activeTab === 'random') && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold text-slate-700">
            Difficulty Level for {selectedGrade}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Topic-wise Practice */}
      {activeTab === 'topics' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">
              Select a {currentSubjectConfig.name} Topic:
            </h2>
            <span className="text-xs text-slate-600 font-semibold">
              {currentSubjectConfig.topics.length} Topics available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentSubjectConfig.topics.map((topic, idx) => (
              <button
                key={topic}
                onClick={() =>
                  onStartTopicPractice(selectedSubject, topic, selectedDifficulty)
                }
                className="bg-white hover:bg-amber-50/70 border-2 border-slate-200 hover:border-amber-400 p-4 rounded-2xl text-left transition-all duration-150 active:scale-98 shadow-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-amber-800">
                    {topic}
                  </span>
                </div>
                <span className="text-amber-500 font-extrabold text-sm group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Random Practice */}
      {activeTab === 'random' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
              🎲
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
                Random Practice
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Mix of interesting questions across all {currentSubjectConfig.name} topics for {selectedGrade}.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Number of Questions:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setRandomQuestionCount(num)}
                  className={`py-3 rounded-2xl font-extrabold text-base border-2 transition-all cursor-pointer ${
                    randomQuestionCount === num
                      ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              onStartRandomPractice(
                selectedSubject,
                randomQuestionCount,
                selectedDifficulty
              )
            }
            className="w-full min-h-[54px] bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Random Practice</span>
          </button>
        </div>
      )}

      {/* TAB 3: Full Mock Exam Setup */}
      {activeTab === 'mock' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
                Full-Length Mock Olympiad Exam
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Realistic examination conditions with countdown timer, question skip & review.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 mb-6 text-xs sm:text-sm text-amber-900 space-y-1.5 font-medium">
            <p>• One question is displayed at a time.</p>
            <p>• Answers and explanations are revealed AFTER you submit the test.</p>
            <p>• You can skip tricky questions and jump back to them before submitting.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Select Exam Length:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 10, time: '15 min' },
                { count: 20, time: '30 min' },
                { count: 30, time: '45 min' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  onClick={() => setMockQuestionCount(opt.count)}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    mockQuestionCount === opt.count
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-extrabold text-base">{opt.count} Questions</div>
                  <div className="text-xs font-semibold text-slate-600">{opt.time}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartMockExam(selectedSubject, mockQuestionCount)}
            className="w-full min-h-[54px] bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            <span>Start Mock Exam</span>
          </button>
        </div>
      )}

      {/* TAB 4: Exam Style Questions */}
      {activeTab === 'exam_style' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
                Exam-Style Challenge Papers
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Original questions patterned directly after official {currentSubjectConfig.fullName} formats.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs text-slate-600 font-medium">
            <p className="mb-1 font-bold text-slate-700">Notice:</p>
            <p>
              All questions are verified original Olympiad-style problems testing conceptual understanding, pattern recognition, and elimination strategies for {selectedGrade}.
            </p>
          </div>

          <button
            onClick={() => onStartPreviousYearPractice(selectedSubject)}
            className="w-full min-h-[54px] bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>Practice Olympiad-Style Questions</span>
          </button>
        </div>
      )}
    </div>
  );
};
