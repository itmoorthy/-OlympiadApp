/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppView,
  SubjectId,
  Grade,
  Difficulty,
  Question,
  MockExamResult,
  UserProgress,
  AppSettings,
} from './types';
import { StorageService } from './services/storageService';
import { QuestionGenerator } from './services/questionGenerator';
import { ExamService } from './services/examService';
import { soundService } from './services/soundService';

import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { HomeScreen } from './components/home/HomeScreen';
import { PracticeSelector } from './components/practice/PracticeSelector';
import { PracticeSession } from './components/practice/PracticeSession';
import { MockExam } from './components/mock/MockExam';
import { MockExamResultView } from './components/mock/MockExamResult';
import { DailyChallenge } from './components/daily/DailyChallenge';
import { ParentDashboard } from './components/progress/ParentDashboard';
import { QuestionReviewModal } from './components/progress/QuestionReviewModal';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [progress, setProgress] = useState<UserProgress>(() => StorageService.getProgress());

  // Active Practice & Exam session state
  const [activeSubject, setActiveSubject] = useState<SubjectId>('IMO');
  const [activeSessionTitle, setActiveSessionTitle] = useState('Olympiad Practice');
  const [activeSessionSubtitle, setActiveSessionSubtitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [currentMockResult, setCurrentMockResult] = useState<MockExamResult | null>(null);
  const [mockDurationMinutes, setMockDurationMinutes] = useState(25);
  const [isQuestionReviewOpen, setIsQuestionReviewOpen] = useState(false);

  // Sync sound setting
  useEffect(() => {
    soundService.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(() => {
      setSettings(StorageService.getSettings());
      setProgress(StorageService.getProgress());
    });
    return unsubscribe;
  }, []);

  const handleGradeChange = (newGrade: Grade) => {
    const updated = StorageService.saveSettings({ selectedGrade: newGrade });
    setSettings(updated);
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = StorageService.saveSettings(partial);
    setSettings(updated);
  };

  const handleResetProgress = () => {
    StorageService.resetAllProgress();
    setProgress(StorageService.getProgress());
    setCurrentView('home');
  };

  // 1. Topic-wise Practice Handler
  const handleStartTopicPractice = async (
    subject: SubjectId,
    topic: string,
    difficulty: Difficulty = settings.defaultDifficulty,
    count: number = 10
  ) => {
    setActiveSubject(subject);
    setActiveSessionTitle(`${subject} Practice: ${topic}`);
    setActiveSessionSubtitle(`${count} Questions • ${settings.selectedGrade} • ${difficulty}`);
    setIsLoadingSession(true);
    setCurrentView('practice_session');

    try {
      const { questions } = await QuestionGenerator.getQuestions({
        subject,
        grade: settings.selectedGrade,
        topic,
        difficulty,
        count,
      });
      setActiveQuestions(questions);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 2. Random Practice Handler
  const handleStartRandomPractice = async (
    subject: SubjectId,
    count: number,
    difficulty: Difficulty = settings.defaultDifficulty
  ) => {
    setActiveSubject(subject);
    setActiveSessionTitle(`${subject} Random Challenge`);
    setActiveSessionSubtitle(`${count} Questions • ${settings.selectedGrade} • ${difficulty}`);
    setIsLoadingSession(true);
    setCurrentView('practice_session');

    try {
      const { questions } = await QuestionGenerator.getQuestions({
        subject,
        grade: settings.selectedGrade,
        difficulty,
        count,
      });
      setActiveQuestions(questions);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 3. Quick Practice (Choose 10, 20, 30 from Home)
  const handleQuickPractice = async (
    subject: SubjectId = 'IMO',
    count: number = 10,
    difficulty: Difficulty = settings.defaultDifficulty
  ) => {
    setActiveSubject(subject);
    setActiveSessionTitle(`${subject} Quick Practice`);
    setActiveSessionSubtitle(`${count} Questions • ${settings.selectedGrade} • ${difficulty}`);
    setIsLoadingSession(true);
    setCurrentView('practice_session');

    try {
      const { questions } = await QuestionGenerator.getQuestions({
        subject,
        grade: settings.selectedGrade,
        count,
        difficulty,
      });
      setActiveQuestions(questions);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 4. Exam-Style / Previous-Year Practice Handler
  const handleStartPreviousYearPractice = async (
    subject: SubjectId,
    count: number = 10
  ) => {
    setActiveSubject(subject);
    setActiveSessionTitle(`${subject} Original Olympiad-Style Paper`);
    setActiveSessionSubtitle(`${count} Questions • Official Format • ${settings.selectedGrade}`);
    setIsLoadingSession(true);
    setCurrentView('practice_session');

    try {
      const { questions } = await QuestionGenerator.getQuestions({
        subject,
        grade: settings.selectedGrade,
        count,
        difficulty: 'Olympiad Challenge',
      });
      setActiveQuestions(questions);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // 5. Full Mock Exam Handler
  const handleStartMockExam = async (subject: SubjectId, questionCount: number) => {
    setActiveSubject(subject);
    const duration = questionCount === 10 ? 15 : questionCount === 20 ? 30 : 45;
    setMockDurationMinutes(duration);
    setIsLoadingSession(true);
    setCurrentView('mock_exam');

    try {
      const questions = await ExamService.createMockExam({
        subject,
        grade: settings.selectedGrade,
        questionCount,
        durationMinutes: duration,
      });
      setActiveQuestions(questions);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // View Navigation
  const handleSelectSubjectFromHome = (subject: SubjectId) => {
    setActiveSubject(subject);
    setCurrentView('practice_selector');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800 font-sans selection:bg-amber-200">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        selectedGrade={settings.selectedGrade}
        onGradeChange={handleGradeChange}
        stars={progress.stars}
        streak={progress.streak}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {/* Loading Spinner for sessions */}
        {isLoadingSession ? (
          <div className="max-w-md mx-auto py-24 px-4 text-center">
            <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
              Preparing Olympiad Questions...
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Curating questions and verifying educational reasoning for {settings.selectedGrade}.
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: HOME SCREEN */}
            {currentView === 'home' && (
              <HomeScreen
                progress={progress}
                selectedGrade={settings.selectedGrade}
                onSelectSubject={handleSelectSubjectFromHome}
                onQuickPractice={handleQuickPractice}
                onStartDailyChallenge={() => setCurrentView('daily_challenge')}
                onNavigate={setCurrentView}
              />
            )}

            {/* VIEW 2: PRACTICE SELECTOR */}
            {currentView === 'practice_selector' && (
              <PracticeSelector
                selectedGrade={settings.selectedGrade}
                initialSubject={activeSubject}
                onStartTopicPractice={handleStartTopicPractice}
                onStartRandomPractice={handleStartRandomPractice}
                onStartMockExam={handleStartMockExam}
                onStartPreviousYearPractice={handleStartPreviousYearPractice}
              />
            )}

            {/* VIEW 3: ACTIVE PRACTICE SESSION */}
            {currentView === 'practice_session' && (
              <PracticeSession
                title={activeSessionTitle}
                subtitle={activeSessionSubtitle}
                questions={activeQuestions}
                onFinish={() => setCurrentView('home')}
                onExit={() => setCurrentView('practice_selector')}
                onRetry={() => {
                  // Re-shuffle and practice again
                  setActiveQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
                }}
              />
            )}

            {/* VIEW 4: ACTIVE MOCK EXAM */}
            {currentView === 'mock_exam' && (
              <MockExam
                subject={activeSubject}
                grade={settings.selectedGrade}
                questions={activeQuestions}
                durationMinutes={mockDurationMinutes}
                onFinishExam={(result) => {
                  setCurrentMockResult(result);
                  setCurrentView('mock_result');
                }}
                onExit={() => setCurrentView('practice_selector')}
              />
            )}

            {/* VIEW 5: MOCK EXAM RESULT VIEW */}
            {currentView === 'mock_result' && currentMockResult && (
              <MockExamResultView
                result={currentMockResult}
                onRetake={() => handleStartMockExam(activeSubject, currentMockResult.totalQuestions)}
                onHome={() => setCurrentView('home')}
              />
            )}

            {/* VIEW 6: DAILY CHALLENGE */}
            {currentView === 'daily_challenge' && (
              <DailyChallenge
                grade={settings.selectedGrade}
                onFinish={() => setCurrentView('home')}
                onExit={() => setCurrentView('home')}
              />
            )}

            {/* VIEW 7: PROGRESS & PARENT DASHBOARD */}
            {currentView === 'progress' && (
              <ParentDashboard
                progress={progress}
                onPracticeTopic={(subject, topic, difficulty, count) =>
                  handleStartTopicPractice(subject, topic, difficulty, count)
                }
                onReviewQuestions={() => setIsQuestionReviewOpen(true)}
              />
            )}

            {/* VIEW 8: SETTINGS VIEW */}
            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetProgress={handleResetProgress}
              />
            )}
          </>
        )}
      </main>

      {/* Question Review Modal */}
      <QuestionReviewModal
        isOpen={isQuestionReviewOpen}
        onClose={() => setIsQuestionReviewOpen(false)}
        attempts={progress.questionHistory || []}
      />

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
