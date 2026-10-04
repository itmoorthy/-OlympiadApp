import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { UserProgress, SubjectId, Difficulty } from '../../types';
import { ProgressService } from '../../services/progressService';
import { GamificationService } from '../../services/gamificationService';
import { BADGE_DEFINITIONS, SUBJECT_CONFIGS, DIFFICULTIES } from '../../config/olympiadConfig';
import { BadgeCard } from '../common/BadgeCard';
import { Modal } from '../common/Modal';

interface ParentDashboardProps {
  progress: UserProgress;
  onPracticeTopic: (subject: SubjectId, topic: string, difficulty: Difficulty, count: number) => void;
  onReviewQuestions: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  progress,
  onPracticeTopic,
  onReviewQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'mocks' | 'badges'>('overview');
  const [practiceModalTopic, setPracticeModalTopic] = useState<{ subject: SubjectId; topic: string } | null>(null);
  const [practiceModalCount, setPracticeModalCount] = useState<number>(10);
  const [practiceModalDifficulty, setPracticeModalDifficulty] = useState<Difficulty>('Olympiad Challenge');

  const overallAccuracy = ProgressService.getOverallAccuracy(progress);
  const subjectStats = ProgressService.getSubjectStats(progress);
  const strongTopics = ProgressService.getStrongTopics(progress);
  const weakTopics = ProgressService.getWeakTopics(progress);
  const avgTimePerQuestion = ProgressService.getAverageTimePerQuestion(progress);
  const avgMockScore = ProgressService.getAverageMockScore(progress);
  const rank = GamificationService.getRank(progress.stars);

  return (
    <div className="max-w-4xl mx-auto py-5 px-4 pb-24 md:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif] flex items-center gap-2">
            <span>Parent & Learning Dashboard</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Local insights, weak topic diagnostic & Olympiad readiness.
          </p>
        </div>

        {/* Quick Review Button */}
        {progress.questionHistory?.length > 0 && (
          <button
            onClick={onReviewQuestions}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl shadow-xs hover:bg-amber-50 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Review Past Questions ({progress.questionHistory.length})</span>
          </button>
        )}
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase block">Attempted</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {progress.totalQuestionsAttempted}
          </span>
          <span className="text-[11px] text-slate-600 block mt-0.5">
            {progress.totalCorrect} Correct answers
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase block">Accuracy</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {overallAccuracy}%
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">
            {overallAccuracy >= 75 ? '🌟 On Track' : '💪 Practice Needed'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase block">Streak</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="text-2xl sm:text-3xl font-black text-orange-600">
              {progress.streak} <span className="text-xs font-normal text-slate-600">days</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-600 block">
            Longest: {progress.longestStreak} days
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase block">Total Stars</span>
          <div className="flex items-center gap-1 text-2xl sm:text-3xl font-black text-amber-500 mt-0.5">
            <span>⭐</span>
            <span>{progress.stars}</span>
          </div>
          <span className="text-[11px] text-slate-600 block truncate">
            {rank.rankTitle}
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 mb-6 border border-slate-200/80 overflow-x-auto">
        {[
          { id: 'overview', label: 'Subject Performance' },
          { id: 'topics', label: 'Topic Breakdown & Diagnosis' },
          { id: 'mocks', label: 'Mock Exam Scores' },
          { id: 'badges', label: 'Badges & Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              activeTab === tab.id
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Subject Performance */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['IMO', 'ISO', 'ICSO'] as SubjectId[]).map((subj) => {
              const cfg = SUBJECT_CONFIGS[subj];
              const stat = subjectStats[subj];

              return (
                <div
                  key={subj}
                  className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cfg.emoji}</span>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base">
                            {cfg.name}
                          </h3>
                          <span className="text-xs text-slate-600">{cfg.fullName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-4">
                      <div className="flex items-end justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600 uppercase">
                          Accuracy
                        </span>
                        <span className="text-2xl font-black text-slate-900">
                          {stat.accuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full"
                          style={{ width: `${stat.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between font-medium">
                    <span>Attempted: {stat.attempted}</span>
                    <span>Correct: {stat.correct}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average Speed Card */}
          <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">
                  Average Time Per Question
                </h4>
                <p className="text-xs text-slate-600">
                  Calculated across all recent practice and mock questions.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-700">
                {avgTimePerQuestion > 0 ? `${avgTimePerQuestion} seconds` : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Topic Diagnostic & Weak Topic Detection */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          {/* WEAK TOPIC ALERT SECTION */}
          {weakTopics.length > 0 ? (
            <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="font-extrabold text-rose-900 text-base font-['Fredoka',sans-serif]">
                  Topics That Need Extra Practice
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 mb-4 font-medium">
                Our diagnostic engine identified lower accuracy in these specific topics. Tapping &quot;Practice Topic&quot; will launch targeted questions!
              </p>

              <div className="space-y-2.5">
                {weakTopics.map((item) => (
                  <div
                    key={item.topic}
                    className="bg-white rounded-2xl p-3.5 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {item.topic}
                        </span>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg">
                          {item.subject} • {item.accuracy}% Accuracy
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 mt-0.5 block">
                        {item.correct} correct out of {item.attempted} attempts
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPracticeModalTopic({ subject: item.subject, topic: item.topic });
                        setPracticeModalCount(10);
                        setPracticeModalDifficulty('Olympiad Challenge');
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Practice {item.topic}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-emerald-900 text-base">
                No Critical Weak Topics!
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Keep up the solid practice across all topics to maintain high accuracy!
              </p>
            </div>
          )}

          {/* STRONG TOPICS */}
          {strongTopics.length > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-emerald-900 text-base font-['Fredoka',sans-serif]">
                  Strong Topics (Mastered)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {strongTopics.map((item) => (
                  <div
                    key={item.topic}
                    className="bg-white rounded-2xl p-3 border border-emerald-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">
                        ✓ {item.topic}
                      </span>
                      <span className="text-xs text-slate-600">
                        {item.subject} • {item.attempted} attempts
                      </span>
                    </div>
                    <span className="font-black text-emerald-600 text-sm">
                      {item.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Mock Exam History */}
      {activeTab === 'mocks' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-bold text-sm text-indigo-900">
              Average Mock Test Score:
            </span>
            <span className="text-xl font-black text-indigo-700">
              {avgMockScore > 0 ? `${avgMockScore}%` : 'No mock tests taken yet'}
            </span>
          </div>

          {progress.mockExamHistory && progress.mockExamHistory.length > 0 ? (
            <div className="space-y-3">
              {progress.mockExamHistory.map((mock) => (
                <div
                  key={mock.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 text-base">
                        {mock.subject} Mock Exam
                      </span>
                      <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">
                        {mock.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {mock.date} • {mock.correctCount}/{mock.totalQuestions} Correct •{' '}
                      {Math.floor(mock.durationSeconds / 60)} min spent
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span
                      className={`text-xl font-black ${
                        mock.scorePercentage >= 80
                          ? 'text-emerald-600'
                          : mock.scorePercentage >= 60
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {mock.scorePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <p className="text-slate-600 text-sm">
                No full-length mock exams have been completed yet. Try one from the Practice Hub!
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Badges Gallery */}
      {activeTab === 'badges' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const isUnlocked = progress.earnedBadges?.includes(badge.id);
              return (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={isUnlocked} />
              );
            })}
          </div>
        </div>
      )}

      {/* Weak Topic Practice Configuration Modal */}
      <Modal
        isOpen={Boolean(practiceModalTopic)}
        onClose={() => setPracticeModalTopic(null)}
        title={`Practice: ${practiceModalTopic?.topic || ''}`}
      >
        <div className="space-y-5">
          <div className="bg-rose-50 rounded-2xl p-3 border border-rose-200 text-xs sm:text-sm text-rose-900 font-semibold">
            Targeted Practice for Weak Topic • {practiceModalTopic?.subject}
          </div>

          {/* Question Count Choice: 10, 20, 30 */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Choose Number of Questions:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[10, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setPracticeModalCount(num)}
                  className={`py-3.5 rounded-2xl font-extrabold text-base border-2 transition-all cursor-pointer ${
                    practiceModalCount === num
                      ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs ring-2 ring-rose-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level (Default: Olympiad Challenge) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Difficulty Level:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setPracticeModalDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center cursor-pointer ${
                    practiceModalDifficulty === diff
                      ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                if (practiceModalTopic) {
                  onPracticeTopic(
                    practiceModalTopic.subject,
                    practiceModalTopic.topic,
                    practiceModalDifficulty,
                    practiceModalCount
                  );
                  setPracticeModalTopic(null);
                }
              }}
              className="w-full py-3.5 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-600/25 active:scale-98 transition-all cursor-pointer text-base"
            >
              Start {practiceModalCount} Questions Practice
            </button>
            <button
              onClick={() => setPracticeModalTopic(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
