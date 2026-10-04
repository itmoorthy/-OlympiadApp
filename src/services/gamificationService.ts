import confetti from 'canvas-confetti';
import { UserProgress, BadgeDefinition } from '../types';
import { BADGE_DEFINITIONS } from '../config/olympiadConfig';
import { StorageService } from './storageService';
import { soundService } from './soundService';

export class GamificationService {
  /**
   * Checks for newly unlocked badges and awards them
   */
  public static checkAndAwardBadges(progress: UserProgress): {
    newBadges: BadgeDefinition[];
    updatedProgress: UserProgress;
  } {
    const currentBadgeIds = new Set(progress.earnedBadges || []);
    const newlyAwarded: BadgeDefinition[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (!currentBadgeIds.has(badge.id) && badge.criteria(progress)) {
        newlyAwarded.push(badge);
        currentBadgeIds.add(badge.id);
      }
    }

    if (newlyAwarded.length > 0) {
      const updatedProgress: UserProgress = {
        ...progress,
        earnedBadges: Array.from(currentBadgeIds),
        stars: progress.stars + newlyAwarded.length * 20, // 20 stars bonus per badge
      };
      StorageService.saveProgress(updatedProgress);

      // Play fanfare sound and launch confetti
      soundService.playCelebration();
      this.triggerConfetti();

      return {
        newBadges: newlyAwarded,
        updatedProgress,
      };
    }

    return {
      newBadges: [],
      updatedProgress: progress,
    };
  }

  /**
   * Fires a vibrant celebration confetti burst
   */
  public static triggerConfetti() {
    try {
      const count = 120;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // Confetti fallback
    }
  }

  /**
   * Computes child-friendly rank based on stars
   */
  public static getRank(stars: number): {
    rankTitle: string;
    level: number;
    nextLevelStars: number;
    progressPercentage: number;
    emoji: string;
  } {
    // 50 stars per level
    const level = Math.max(1, Math.floor(stars / 50) + 1);
    const currentLevelBase = (level - 1) * 50;
    const nextLevelStars = level * 50;
    const progressInLevel = stars - currentLevelBase;
    const progressPercentage = Math.min(100, Math.round((progressInLevel / 50) * 100));

    let rankTitle = 'Junior Novice';
    let emoji = '🌱';

    if (level >= 10) {
      rankTitle = 'Grand Olympiad Master';
      emoji = '👑';
    } else if (level >= 8) {
      rankTitle = 'Diamond Champion';
      emoji = '💎';
    } else if (level >= 6) {
      rankTitle = 'Gold Scholar';
      emoji = '🥇';
    } else if (level >= 4) {
      rankTitle = 'Silver Explorer';
      emoji = '🥈';
    } else if (level >= 2) {
      rankTitle = 'Bronze Apprentice';
      emoji = '🥉';
    }

    return {
      rankTitle,
      level,
      nextLevelStars,
      progressPercentage,
      emoji,
    };
  }
}
