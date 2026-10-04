export type SubjectId = 'IMO' | 'ISO' | 'ICSO';

export type Grade = 'Grade 3' | 'Grade 4' | 'Grade 5';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Olympiad Challenge';

export type QuestionSourceType = 'generated' | 'previousYear' | 'licensed';

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  fullName: string;
  emoji: string;
  tagline: string;
  themeColor: string; // Tailwind color name or hex
  accentBg: string;
  borderColor: string;
  textColor: string;
  topics: string[];
}

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: string; // The exact option text
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  subject: SubjectId;
  grade: Grade;
  topic: string;
  difficulty: Difficulty;
  sourceType: QuestionSourceType;
  hints?: string[];
}

export interface UserAttempt {
  id: string;
  questionId: string;
  question: Question;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeTakenSeconds: number;
  timestamp: number;
}

export interface MockExamResult {
  id: string;
  subject: SubjectId;
  grade: Grade;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  scorePercentage: number;
  durationSeconds: number;
  attempts: UserAttempt[];
  date: string;
}

export interface TopicStat {
  subject: SubjectId;
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface SubjectStat {
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface UserProgress {
  totalQuestionsAttempted: number;
  totalCorrect: number;
  stars: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  subjectStats: Record<SubjectId, { attempted: number; correct: number }>;
  topicStats: Record<string, { attempted: number; correct: number; subject: SubjectId }>;
  mockExamHistory: MockExamResult[];
  earnedBadges: string[];
  questionHistory: UserAttempt[];
  dailyChallengeHistory: Record<string, { completed: boolean; score: number; total: number; date: string }>;
}

export interface AppSettings {
  selectedGrade: Grade;
  soundEnabled: boolean;
  animationEnabled: boolean;
  defaultDifficulty: Difficulty;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  criteria: (progress: UserProgress) => boolean;
}

export type AppView = 
  | 'home'
  | 'practice_selector'
  | 'practice_session'
  | 'mock_setup'
  | 'mock_exam'
  | 'mock_result'
  | 'daily_challenge'
  | 'previous_year'
  | 'progress'
  | 'settings';
