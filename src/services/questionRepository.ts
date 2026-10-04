import { Question, SubjectId, Grade, Difficulty, QuestionSourceType } from '../types';
import { CURATED_QUESTION_BANK } from './questionBank';

const CACHE_KEY = 'olympiad_buddy_question_cache_v1';

export class QuestionRepository {
  private static cachedQuestions: Question[] = [];

  static {
    this.loadCached();
  }

  private static loadCached() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      if (data) {
        this.cachedQuestions = JSON.parse(data);
      }
    } catch {
      this.cachedQuestions = [];
    }
  }

  private static saveCached() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cachedQuestions.slice(0, 300)));
    } catch {
      // Storage quota safety
    }
  }

  /**
   * Adds newly validated questions to the dynamic repository cache
   */
  public static addQuestions(questions: Question[]) {
    const existingIds = new Set([
      ...CURATED_QUESTION_BANK.map((q) => q.id),
      ...this.cachedQuestions.map((q) => q.id),
    ]);

    for (const q of questions) {
      if (!existingIds.has(q.id)) {
        this.cachedQuestions.push(q);
        existingIds.add(q.id);
      }
    }
    this.saveCached();
  }

  /**
   * Gets all questions (curated + cached)
   */
  public static getAll(): Question[] {
    return [...CURATED_QUESTION_BANK, ...this.cachedQuestions];
  }

  /**
   * Filter questions by criteria
   */
  public static filter(criteria: {
    subject?: SubjectId;
    grade?: Grade;
    topic?: string;
    difficulty?: Difficulty;
    sourceType?: QuestionSourceType;
  }): Question[] {
    const all = this.getAll();
    return all.filter((q) => {
      if (criteria.subject && q.subject !== criteria.subject) return false;
      if (criteria.grade && q.grade !== criteria.grade) return false;
      if (criteria.topic && q.topic.toLowerCase() !== criteria.topic.toLowerCase()) {
        // Also allow partial match
        if (
          !q.topic.toLowerCase().includes(criteria.topic.toLowerCase()) &&
          !criteria.topic.toLowerCase().includes(q.topic.toLowerCase())
        ) {
          return false;
        }
      }
      if (criteria.difficulty && q.difficulty !== criteria.difficulty) return false;
      if (criteria.sourceType && q.sourceType !== criteria.sourceType) return false;
      return true;
    });
  }

  /**
   * Get random selection of questions avoiding recent IDs where possible
   */
  public static getRandomQuestions(
    count: number,
    filterCriteria: {
      subject?: SubjectId;
      grade?: Grade;
      topic?: string;
      difficulty?: Difficulty;
    },
    excludeIds: string[] = []
  ): Question[] {
    let pool = this.filter(filterCriteria);

    // If pool is small, relax difficulty or topic
    if (pool.length < count) {
      const relaxed = this.filter({
        subject: filterCriteria.subject,
        grade: filterCriteria.grade,
      });
      const poolSet = new Set(pool.map((q) => q.id));
      for (const item of relaxed) {
        if (!poolSet.has(item.id)) {
          pool.push(item);
          poolSet.add(item.id);
        }
      }
    }

    // Still small? Take any for the subject or general
    if (pool.length < count && filterCriteria.subject) {
      const subjectPool = this.filter({ subject: filterCriteria.subject });
      const poolSet = new Set(pool.map((q) => q.id));
      for (const item of subjectPool) {
        if (!poolSet.has(item.id)) {
          pool.push(item);
          poolSet.add(item.id);
        }
      }
    }

    // Exclude recently seen if possible
    const fresh = pool.filter((q) => !excludeIds.includes(q.id));
    const finalPool = fresh.length >= count ? fresh : pool;

    // Shuffle
    const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
