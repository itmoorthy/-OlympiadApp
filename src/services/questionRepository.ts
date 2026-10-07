import { Question, SubjectId, Grade, Difficulty, QuestionSourceType } from '../types';
import { CURATED_QUESTION_BANK } from './questionBank';
import { ProceduralQuestionGenerator } from './proceduralQuestionGenerator';

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
      if (criteria.topic) {
        const needle = criteria.topic.trim().toLowerCase();
        const cand = q.topic.trim().toLowerCase();
        if (cand !== needle && !cand.includes(needle) && !needle.includes(cand)) {
          return false;
        }
      }
      if (criteria.difficulty && q.difficulty !== criteria.difficulty) return false;
      if (criteria.sourceType && q.sourceType !== criteria.sourceType) return false;
      return true;
    });
  }

  /**
   * Get random selection of questions strictly adhering to topic when requested
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
    // 1. If a specific topic is requested: NEVER cross-pollinate with other topics!
    if (filterCriteria.topic && filterCriteria.topic.trim() !== '') {
      const requestedTopic = filterCriteria.topic.trim();

      // Step A: exact topic + difficulty
      let pool = this.filter({
        subject: filterCriteria.subject,
        grade: filterCriteria.grade,
        topic: requestedTopic,
        difficulty: filterCriteria.difficulty,
      });

      // Step B: if not enough, relax ONLY difficulty (keep topic strictly identical)
      if (pool.length < count) {
        const sameTopicOtherDifficulties = this.filter({
          subject: filterCriteria.subject,
          grade: filterCriteria.grade,
          topic: requestedTopic,
        });
        const poolSet = new Set(pool.map((q) => q.id));
        for (const item of sameTopicOtherDifficulties) {
          if (!poolSet.has(item.id)) {
            pool.push(item);
            poolSet.add(item.id);
          }
        }
      }

      // Step C: if still not enough, procedurally generate for THIS EXACT TOPIC
      if (pool.length < count && filterCriteria.subject && filterCriteria.grade) {
        const needed = count - pool.length;
        const generated = ProceduralQuestionGenerator.generateQuestions(
          filterCriteria.subject,
          filterCriteria.grade,
          requestedTopic,
          needed,
          filterCriteria.difficulty || 'Medium'
        );
        this.addQuestions(generated);
        for (const item of generated) {
          pool.push(item);
        }
      }

      // Strict safety check: ensure every question in pool is genuinely for this topic
      const topicLower = requestedTopic.toLowerCase();
      pool = pool.filter((q) => {
        const cand = q.topic.toLowerCase();
        return cand.includes(topicLower) || topicLower.includes(cand);
      });

      // Exclude recently seen if possible
      const fresh = pool.filter((q) => !excludeIds.includes(q.id));
      const finalPool = fresh.length >= count ? fresh : pool;

      // Shuffle and return exact count
      const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // 2. If NO specific topic requested (Random Practice / Mock Exam across entire subject):
    let pool = this.filter(filterCriteria);

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

    if (pool.length < count && filterCriteria.subject && filterCriteria.grade) {
      const needed = count - pool.length;
      const proceduralQuestions = ProceduralQuestionGenerator.generateQuestions(
        filterCriteria.subject,
        filterCriteria.grade,
        'General',
        needed,
        filterCriteria.difficulty || 'Medium'
      );
      this.addQuestions(proceduralQuestions);
      for (const item of proceduralQuestions) {
        pool.push(item);
      }
    }

    const fresh = pool.filter((q) => !excludeIds.includes(q.id));
    const finalPool = fresh.length >= count ? fresh : pool;

    const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
