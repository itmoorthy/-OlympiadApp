import { Question, SubjectId, Grade, MockExamResult, UserAttempt } from '../types';
import { QuestionGenerator } from './questionGenerator';

export interface MockExamConfig {
  subject: SubjectId;
  grade: Grade;
  questionCount: number;
  durationMinutes: number;
}

export class ExamService {
  /**
   * Generates a full mock test paper for the chosen Olympiad subject and grade
   */
  public static async createMockExam(config: MockExamConfig): Promise<Question[]> {
    const { questions } = await QuestionGenerator.getQuestions({
      subject: config.subject,
      grade: config.grade,
      count: config.questionCount,
      difficulty: 'Medium',
    });

    return questions;
  }

  /**
   * Calculates final mock test results from user answers
   */
  public static evaluateExam(params: {
    subject: SubjectId;
    grade: Grade;
    questions: Question[];
    userSelections: Record<number, number>; // questionIndex -> selectedOptionIndex (or undefined if skipped)
    questionTimes: Record<number, number>; // questionIndex -> seconds spent
    totalDurationSeconds: number;
  }): MockExamResult {
    const {
      subject,
      grade,
      questions,
      userSelections,
      questionTimes,
      totalDurationSeconds,
    } = params;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const attempts: UserAttempt[] = questions.map((q, idx) => {
      const selectedIndex = userSelections[idx];
      const isSkipped = selectedIndex === undefined || selectedIndex === -1;
      const isCorrect = !isSkipped && selectedIndex === q.correctOptionIndex;

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        id: `att_${idx}_${q.id}`,
        questionId: q.id,
        question: q,
        selectedOptionIndex: isSkipped ? -1 : selectedIndex,
        isCorrect,
        timeTakenSeconds: questionTimes[idx] || 0,
        timestamp: Date.now(),
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    return {
      id: `mock_${Date.now()}`,
      subject,
      grade,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      skippedCount,
      scorePercentage,
      durationSeconds: totalDurationSeconds,
      attempts,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }
}
