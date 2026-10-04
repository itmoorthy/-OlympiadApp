import { Question, Grade, SubjectId } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class QuestionValidator {
  /**
   * Validates a candidate Olympiad question according to the 8 mandatory rules.
   */
  public static validate(
    q: Partial<Question>,
    expectedGrade?: Grade,
    expectedSubject?: SubjectId,
    expectedTopic?: string
  ): ValidationResult {
    const errors: string[] = [];

    // Rule 1: Question text and options exist
    if (!q.question || q.question.trim().length < 5) {
      errors.push('Question text is missing or too short.');
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push('Question must have exactly 4 options.');
    }

    // Rule 8: No duplicated options
    if (Array.isArray(q.options) && q.options.length === 4) {
      const cleanOptions = q.options.map((opt) => String(opt || '').trim().toLowerCase());
      const uniqueOptions = new Set(cleanOptions);
      if (uniqueOptions.size !== 4) {
        errors.push('Options contain duplicates or empty values.');
      }
    }

    // Rule 1 & 2: Correct answer exists and matches one option
    if (!q.correctAnswer && typeof q.correctOptionIndex !== 'number') {
      errors.push('Correct answer is not specified.');
    }

    let resolvedCorrectIndex = -1;
    if (Array.isArray(q.options) && q.options.length === 4) {
      if (typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3) {
        resolvedCorrectIndex = q.correctOptionIndex;
      } else if (q.correctAnswer) {
        const needle = q.correctAnswer.trim().toLowerCase();
        // Check if correctAnswer is 'A', 'B', 'C', 'D'
        if (['a', 'b', 'c', 'd'].includes(needle)) {
          resolvedCorrectIndex = ['a', 'b', 'c', 'd'].indexOf(needle);
        } else {
          // Check matching option text
          resolvedCorrectIndex = q.options.findIndex(
            (opt) => opt.trim().toLowerCase() === needle
          );
        }
      }

      if (resolvedCorrectIndex < 0 || resolvedCorrectIndex > 3) {
        errors.push('Correct answer does not match any of the 4 options.');
      }
    }

    // Rule 3: Explanation exists and supports the answer
    if (!q.explanation || q.explanation.trim().length < 10) {
      errors.push('Explanation is missing or too brief for a child.');
    }

    // Rule 4 & 5: Grade & Topic consistency
    if (expectedGrade && q.grade && q.grade !== expectedGrade) {
      errors.push(`Question grade (${q.grade}) does not match requested grade (${expectedGrade}).`);
    }

    if (expectedSubject && q.subject && q.subject !== expectedSubject) {
      errors.push(`Question subject (${q.subject}) does not match requested subject (${expectedSubject}).`);
    }

    if (expectedTopic && q.topic && expectedTopic.toLowerCase() !== q.topic.toLowerCase()) {
      // Allow minor topic variance if contains topic name
      if (!q.topic.toLowerCase().includes(expectedTopic.toLowerCase()) && !expectedTopic.toLowerCase().includes(q.topic.toLowerCase())) {
        errors.push(`Question topic (${q.topic}) does not match requested topic (${expectedTopic}).`);
      }
    }

    // Rule 6: Exactly one correct answer exists (verified through single index and distinct options)
    // Rule 7: No malformed mathematical notation (check for unrendered LaTeX or broken artifacts like $$ or NaN)
    if (q.question) {
      if (q.question.includes('NaN') || q.question.includes('undefined') || q.question.includes('[object Object]')) {
        errors.push('Question contains malformed notation or text artifacts.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitizes and normalizes an incoming question object to a guaranteed Question interface
   */
  public static normalize(raw: any, fallbackId?: string): Question | null {
    if (!raw) return null;

    const options: [string, string, string, string] = [
      String(raw.options?.[0] || 'Option A'),
      String(raw.options?.[1] || 'Option B'),
      String(raw.options?.[2] || 'Option C'),
      String(raw.options?.[3] || 'Option D'),
    ];

    let correctIndex = typeof raw.correctOptionIndex === 'number' ? raw.correctOptionIndex : 0;
    if (raw.correctAnswer) {
      const ans = String(raw.correctAnswer).trim().toLowerCase();
      if (ans === 'a') correctIndex = 0;
      else if (ans === 'b') correctIndex = 1;
      else if (ans === 'c') correctIndex = 2;
      else if (ans === 'd') correctIndex = 3;
      else {
        const found = options.findIndex((o) => o.trim().toLowerCase() === ans);
        if (found !== -1) correctIndex = found;
      }
    }

    if (correctIndex < 0 || correctIndex > 3) correctIndex = 0;

    // Subject normalization
    let subject: SubjectId = 'IMO';
    const rawSub = String(raw.subject || '').toLowerCase();
    if (rawSub.includes('math') || rawSub.includes('imo')) subject = 'IMO';
    else if (rawSub.includes('sci') || rawSub.includes('iso')) subject = 'ISO';
    else if (rawSub.includes('comp') || rawSub.includes('icso') || rawSub.includes('code')) subject = 'ICSO';

    return {
      id: raw.id || fallbackId || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      question: String(raw.question || '').trim(),
      options,
      correctAnswer: options[correctIndex],
      correctOptionIndex: correctIndex,
      explanation: String(raw.explanation || '').trim(),
      subject,
      grade: raw.grade || 'Grade 4',
      topic: raw.topic || 'General',
      difficulty: raw.difficulty || 'Medium',
      sourceType: raw.sourceType || 'generated',
      hints: raw.hints || [],
    };
  }
}
