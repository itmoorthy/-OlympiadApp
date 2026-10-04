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
   * Leverages Gemini server API with automated fallback to verified repository.
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
    } = options;

    const validatedAIQuestions: Question[] = [];

    // Attempt AI generation via server endpoint
    try {
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
          count: Math.min(count, 10),
        }),
      });

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
              } else {
                console.warn('AI question discarded by QuestionValidator:', validation.errors);
              }
            }
          }

          if (validatedAIQuestions.length > 0) {
            // Save to repository cache for future reuse
            QuestionRepository.addQuestions(validatedAIQuestions);
          }
        }
      }
    } catch (err) {
      console.info('AI generation skipped or unavailable, using curated question bank.', err);
    }

    // If we have enough validated AI questions
    if (validatedAIQuestions.length >= count) {
      return {
        questions: validatedAIQuestions.slice(0, count),
        source: 'ai',
      };
    }

    // Fill the remainder or entirety from the curated repository
    const needed = count - validatedAIQuestions.length;
    const repoQuestions = QuestionRepository.getRandomQuestions(
      needed,
      { subject, grade, topic, difficulty },
      [...excludeIds, ...validatedAIQuestions.map((q) => q.id)]
    );

    const combined = [...validatedAIQuestions, ...repoQuestions];

    return {
      questions: combined.slice(0, count),
      source: validatedAIQuestions.length > 0 ? 'mixed' : 'repository',
    };
  }
}
