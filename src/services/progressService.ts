import { UserProgress, SubjectId, TopicStat, SubjectStat } from '../types';
import { SUBJECT_CONFIGS } from '../config/olympiadConfig';

export class ProgressService {
  /**
   * Calculates overall accuracy percentage
   */
  public static getOverallAccuracy(progress: UserProgress): number {
    if (progress.totalQuestionsAttempted === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalQuestionsAttempted) * 100);
  }

  /**
   * Calculates stats for each subject
   */
  public static getSubjectStats(progress: UserProgress): Record<SubjectId, SubjectStat> {
    const res: Record<SubjectId, SubjectStat> = {
      IMO: { attempted: 0, correct: 0, accuracy: 0 },
      ISO: { attempted: 0, correct: 0, accuracy: 0 },
      ICSO: { attempted: 0, correct: 0, accuracy: 0 },
    };

    (['IMO', 'ISO', 'ICSO'] as SubjectId[]).forEach((sub) => {
      const s = progress.subjectStats[sub] || { attempted: 0, correct: 0 };
      const accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
      res[sub] = {
        attempted: s.attempted,
        correct: s.correct,
        accuracy,
      };
    });

    return res;
  }

  /**
   * Retrieves all topic stats
   */
  public static getTopicStatsList(progress: UserProgress): TopicStat[] {
    const list: TopicStat[] = [];
    for (const [topic, data] of Object.entries(progress.topicStats || {})) {
      if (data.attempted > 0) {
        list.push({
          subject: data.subject,
          topic,
          attempted: data.attempted,
          correct: data.correct,
          accuracy: Math.round((data.correct / data.attempted) * 100),
        });
      }
    }
    return list.sort((a, b) => b.attempted - a.attempted);
  }

  /**
   * Identifies strong topics (>= 75% accuracy, attempted >= 2)
   */
  public static getStrongTopics(progress: UserProgress): TopicStat[] {
    return this.getTopicStatsList(progress).filter(
      (t) => t.attempted >= 2 && t.accuracy >= 75
    );
  }

  /**
   * Identifies weak topics / Needs practice (< 65% accuracy, attempted >= 2, or lowest accuracy)
   */
  public static getWeakTopics(progress: UserProgress): TopicStat[] {
    const topics = this.getTopicStatsList(progress);
    const weak = topics.filter((t) => t.attempted >= 2 && t.accuracy < 65);
    if (weak.length > 0) {
      return weak.sort((a, b) => a.accuracy - b.accuracy);
    }
    // If none has < 65% but there are topics with imperfect accuracy
    return topics.filter((t) => t.accuracy < 100 && t.attempted >= 1).slice(0, 3);
  }

  /**
   * Computes average time per question from recent attempts
   */
  public static getAverageTimePerQuestion(progress: UserProgress): number {
    const history = progress.questionHistory || [];
    if (history.length === 0) return 0;
    const totalTime = history.reduce((sum, att) => sum + (att.timeTakenSeconds || 0), 0);
    return Math.round(totalTime / history.length);
  }

  /**
   * Computes average mock test score
   */
  public static getAverageMockScore(progress: UserProgress): number {
    const mocks = progress.mockExamHistory || [];
    if (mocks.length === 0) return 0;
    const totalScore = mocks.reduce((sum, m) => sum + m.scorePercentage, 0);
    return Math.round(totalScore / mocks.length);
  }
}
