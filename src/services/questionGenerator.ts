import { Question, SubjectId, Grade, Difficulty } from '../types';
import { QuestionValidator } from './questionValidator';
import { QuestionRepository } from './questionRepository';

export interface GenerateOptions {
  subject: SubjectId;
  grade: Grade;
  topic?: string;
  difficulty?: Difficulty;
  count?: number;
  excludeIds?: string[];
  forceAI?: boolean;
}

export class QuestionGenerator {
  /**
   * Fetches or generates questions for practice or exams.
   * Prioritizes instant, zero-latency response using verified curated bank & procedural engines.
   * Runs AI enrichment in background to prevent any UI blocking or loading delays.
   */
  public static async getQuestions(options: GenerateOptions): Promise<{
    questions: Question[];
    source: 'ai' | 'repository' | 'mixed';
  }> {
    const {
      subject,
      grade,
      topic = 'General',
      difficulty = 'Medium',
      count = 5,
      excludeIds = [],
      forceAI = false,
    } = options;

    // 1. FAST-FIRST: Immediately retrieve verified questions from repository & procedural generator
    const repoQuestions = QuestionRepository.getRandomQuestions(
      count,
      { subject, grade, topic, difficulty },
      excludeIds
    );

    // If we have enough instant questions and forceAI is not requested, return immediately (0ms delay!)
    if (!forceAI && repoQuestions.length >= count) {
      // Trigger non-blocking background AI warm-up only if not on static GitHub Pages
      this.backgroundFetchAI(subject, grade, topic, difficulty);

      return {
        questions: repoQuestions.slice(0, count),
        source: 'repository',
      };
    }

    // 2. If forceAI is true or we need more questions, try AI with a strict 2-second timeout
    const validatedAIQuestions: Question[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          difficulty,
          count: Math.min(count, 5),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          for (const raw of data.questions) {
            const normalized = QuestionValidator.normalize(raw);
            if (normalized) {
              const validation = QuestionValidator.validate(normalized, grade, subject);
              if (validation.isValid) {
                normalized.sourceType = 'generated';
                validatedAIQuestions.push(normalized);
              }
            }
          }

          if (validatedAIQuestions.length > 0) {
            QuestionRepository.addQuestions(validatedAIQuestions);
          }
        }
      }
    } catch {
      // Silently proceed with instant repository questions
    }

    // Combine any AI questions with repository questions
    const combined = [...validatedAIQuestions, ...repoQuestions];
    return {
      questions: combined.slice(0, count),
      source: validatedAIQuestions.length > 0 ? 'mixed' : 'repository',
    };
  }

  /**
   * Non-blocking background fetch to replenish cache for future sessions
   */
  private static backgroundFetchAI(
    subject: SubjectId,
    grade: Grade,
    topic: string,
    difficulty: Difficulty
  ) {
    if (typeof window === 'undefined') return;
    // Skip on static hosting where server API is not available
    if (window.location.hostname.endsWith('github.io')) return;

    // Fire-and-forget in background
    setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            grade,
            topic,
            difficulty,
            count: 3,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.questions)) {
            const validList: Question[] = [];
            for (const raw of data.questions) {
              const normalized = QuestionValidator.normalize(raw);
              if (normalized && QuestionValidator.validate(normalized, grade, subject).isValid) {
                normalized.sourceType = 'generated';
                validList.push(normalized);
              }
            }
            if (validList.length > 0) {
              QuestionRepository.addQuestions(validList);
            }
          }
        }
      } catch {
        // Background task failure is harmless
      }
    }, 100);
  }
}
