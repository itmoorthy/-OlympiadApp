import { UserProgress, AppSettings, UserAttempt, MockExamResult, SubjectId, Grade, Difficulty } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'olympiad_buddy_settings_v1',
  PROGRESS: 'olympiad_buddy_progress_v1',
  RECENT_ATTEMPTS: 'olympiad_buddy_attempts_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  selectedGrade: 'Grade 4',
  soundEnabled: true,
  animationEnabled: true,
  defaultDifficulty: 'Olympiad Challenge',
};

const DEFAULT_PROGRESS: UserProgress = {
  totalQuestionsAttempted: 0,
  totalCorrect: 0,
  stars: 0,
  streak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  subjectStats: {
    IMO: { attempted: 0, correct: 0 },
    ISO: { attempted: 0, correct: 0 },
    ICSO: { attempted: 0, correct: 0 },
  },
  topicStats: {},
  mockExamHistory: [],
  earnedBadges: ['first_step'],
  questionHistory: [],
  dailyChallengeHistory: {},
};

export class StorageService {
  private static listeners: Array<() => void> = [];

  public static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach((l) => l());
  }

  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      // Migrate legacy default 'Medium' to requested default 'Olympiad Challenge' if untouched
      if (!parsed.defaultDifficulty || parsed.defaultDifficulty === 'Medium') {
        parsed.defaultDifficulty = 'Olympiad Challenge';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    this.notify();
    return updated;
  }

  public static getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return DEFAULT_PROGRESS;
      const parsed: UserProgress = JSON.parse(data);
      // Ensure defaults for any new properties
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        subjectStats: {
          ...DEFAULT_PROGRESS.subjectStats,
          ...(parsed.subjectStats || {}),
        },
        topicStats: parsed.topicStats || {},
        mockExamHistory: parsed.mockExamHistory || [],
        earnedBadges: parsed.earnedBadges || [],
        questionHistory: parsed.questionHistory || [],
        dailyChallengeHistory: parsed.dailyChallengeHistory || {},
      };
    } catch {
      return DEFAULT_PROGRESS;
    }
  }

  public static saveProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }
    this.notify();
  }

  public static recordQuestionAttempt(attempt: UserAttempt): {
    updatedProgress: UserProgress;
    starsEarned: number;
    isNewBadgeEarned: boolean;
  } {
    const progress = this.getProgress();
    const today = new Date().toISOString().split('T')[0];

    // Streak logic
    let currentStreak = progress.streak || 1;
    let longestStreak = progress.longestStreak || 1;
    if (progress.lastActiveDate) {
      const lastDate = new Date(progress.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    // Stars logic: 10 stars for correct, 2 stars for earnest attempt
    const starsEarned = attempt.isCorrect ? 10 : 2;
    const newStars = progress.stars + starsEarned;

    // Subject stats
    const sub = attempt.question.subject;
    const subStat = progress.subjectStats[sub] || { attempted: 0, correct: 0 };
    const updatedSubStat = {
      attempted: subStat.attempted + 1,
      correct: subStat.correct + (attempt.isCorrect ? 1 : 0),
    };

    // Topic stats
    const topic = attempt.question.topic;
    const currentTopicStat = progress.topicStats[topic] || {
      attempted: 0,
      correct: 0,
      subject: sub,
    };
    const updatedTopicStat = {
      attempted: currentTopicStat.attempted + 1,
      correct: currentTopicStat.correct + (attempt.isCorrect ? 1 : 0),
      subject: sub,
    };

    // Recent question history (keep last 150)
    const history = [attempt, ...(progress.questionHistory || [])].slice(0, 150);

    const updatedProgress: UserProgress = {
      ...progress,
      totalQuestionsAttempted: progress.totalQuestionsAttempted + 1,
      totalCorrect: progress.totalCorrect + (attempt.isCorrect ? 1 : 0),
      stars: newStars,
      streak: currentStreak,
      longestStreak: longestStreak,
      lastActiveDate: today,
      subjectStats: {
        ...progress.subjectStats,
        [sub]: updatedSubStat,
      },
      topicStats: {
        ...progress.topicStats,
        [topic]: updatedTopicStat,
      },
      questionHistory: history,
    };

    this.saveProgress(updatedProgress);
    return {
      updatedProgress,
      starsEarned,
      isNewBadgeEarned: false,
    };
  }

  public static recordMockExamResult(result: MockExamResult): UserProgress {
    const progress = this.getProgress();
    const updatedHistory = [result, ...(progress.mockExamHistory || [])].slice(0, 30);

    // Add extra stars for completing mock exam: 25 bonus stars
    const updatedProgress: UserProgress = {
      ...progress,
      stars: progress.stars + 25,
      mockExamHistory: updatedHistory,
    };

    this.saveProgress(updatedProgress);
    return updatedProgress;
  }

  public static recordDailyChallengeCompletion(
    score: number,
    total: number
  ): UserProgress {
    const progress = this.getProgress();
    const today = new Date().toISOString().split('T')[0];

    const updatedProgress: UserProgress = {
      ...progress,
      stars: progress.stars + 50, // 50 bonus stars for daily challenge completion
      dailyChallengeHistory: {
        ...progress.dailyChallengeHistory,
        [today]: { completed: true, score, total, date: today },
      },
    };

    this.saveProgress(updatedProgress);
    return updatedProgress;
  }

  public static resetAllProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    } catch (e) {
      console.warn('Failed to reset progress:', e);
    }
    this.notify();
  }
}
