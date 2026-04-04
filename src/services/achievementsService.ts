import { supabase } from '../lib/supabase';
import { xpService } from './xpService';
import { workoutService } from './workoutService';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  type: 'milestone' | 'streak' | 'volume' | 'consistency';
  requirement: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface AchievementUnlockedResult {
  achievement: Achievement;
  xpAwarded: number;
  levelUp?: {
    previousLevel: number;
    newLevel: number;
  };
}

class AchievementsService {
  private readonly ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    { id: 'first_workout',           name: 'First Steps',            description: 'Complete your first workout',                    xpReward: 25,   icon: '🎯', type: 'milestone',    requirement: 1       },
    { id: 'workout_10',              name: 'Consistent Champion',    description: 'Complete 10 workouts',                           xpReward: 100,  icon: '💪', type: 'milestone',    requirement: 10      },
    { id: 'workout_25',              name: 'Dedicated Athlete',      description: 'Complete 25 workouts',                           xpReward: 200,  icon: '🏃', type: 'milestone',    requirement: 25      },
    { id: 'workout_50',              name: 'Elite Performer',        description: 'Complete 50 workouts',                           xpReward: 300,  icon: '⭐', type: 'milestone',    requirement: 50      },
    { id: 'workout_100',             name: 'Marathon Runner',        description: 'Complete 100 workouts',                          xpReward: 1000, icon: '🏆', type: 'milestone',    requirement: 100     },
    { id: 'workout_150',             name: 'Iron Will',              description: 'Complete 150 workouts',                          xpReward: 1500, icon: '🛡️', type: 'milestone',    requirement: 150     },
    { id: 'workout_200',             name: 'Unstoppable',            description: 'Complete 200 workouts',                          xpReward: 2000, icon: '⚔️', type: 'milestone',    requirement: 200     },
    { id: 'workout_300',             name: 'Living Legend',          description: 'Complete 300 workouts',                          xpReward: 3000, icon: '🌟', type: 'milestone',    requirement: 300     },
    { id: 'workout_500',             name: 'Immortal',               description: 'Complete 500 workouts',                          xpReward: 5000, icon: '🏅', type: 'milestone',    requirement: 500     },
    { id: 'streak_3',                name: 'On Fire',                description: 'Maintain a 3-day workout streak',                xpReward: 50,   icon: '🔥', type: 'streak',       requirement: 3       },
    { id: 'streak_7',                name: 'Week Warrior',           description: 'Maintain a 7-day workout streak',                xpReward: 150,  icon: '🔥', type: 'streak',       requirement: 7       },
    { id: 'streak_14',               name: 'Unstoppable Force',      description: 'Maintain a 14-day workout streak',               xpReward: 300,  icon: '🔥', type: 'streak',       requirement: 14      },
    { id: 'streak_30',               name: 'Legendary Dedication',   description: 'Maintain a 30-day workout streak',               xpReward: 500,  icon: '🔥', type: 'streak',       requirement: 30      },
    { id: 'streak_60',               name: 'Two Month Warrior',      description: 'Maintain a 60-day workout streak',               xpReward: 1000, icon: '🔥', type: 'streak',       requirement: 60      },
    { id: 'streak_90',               name: 'Quarter Year Champion',  description: 'Maintain a 90-day workout streak',               xpReward: 1500, icon: '🔥', type: 'streak',       requirement: 90      },
    { id: 'streak_180',              name: 'Half Year Hero',         description: 'Maintain a 180-day workout streak',              xpReward: 2500, icon: '🔥', type: 'streak',       requirement: 180     },
    { id: 'streak_365',              name: 'Year of Fire',           description: 'Maintain a full year workout streak',            xpReward: 5000, icon: '🔥', type: 'streak',       requirement: 365     },
    { id: 'weight_10k',              name: 'Iron Pumper',            description: 'Lift 10,000 lbs total',                          xpReward: 100,  icon: '🏋️', type: 'volume',       requirement: 10000   },
    { id: 'weight_50k',              name: 'Heavy Lifter',           description: 'Lift 50,000 lbs total',                          xpReward: 250,  icon: '🏋️', type: 'volume',       requirement: 50000   },
    { id: 'weight_100k',             name: 'Century Club',           description: 'Lift 100,000 lbs total',                         xpReward: 500,  icon: '🏋️', type: 'volume',       requirement: 100000  },
    { id: 'weight_250k',             name: 'Titan Strength',         description: 'Lift 250,000 lbs total',                         xpReward: 750,  icon: '🏋️', type: 'volume',       requirement: 250000  },
    { id: 'weight_500k',             name: 'Hercules',               description: 'Lift 500,000 lbs total',                         xpReward: 1000, icon: '🏋️', type: 'volume',       requirement: 500000  },
    { id: 'weight_1m',               name: 'Million Pound Club',     description: 'Lift 1,000,000 lbs total',                       xpReward: 2000, icon: '🏋️', type: 'volume',       requirement: 1000000 },
    { id: 'weight_2m',               name: 'Titan of Iron',          description: 'Lift 2,000,000 lbs total',                       xpReward: 3000, icon: '🏋️', type: 'volume',       requirement: 2000000 },
    { id: 'weight_5m',               name: 'Atlas',                  description: 'Lift 5,000,000 lbs total',                       xpReward: 5000, icon: '🏋️', type: 'volume',       requirement: 5000000 },
    { id: 'level_10',                name: 'Silver Tier',            description: 'Reach level 10',                                 xpReward: 200,  icon: '🥈', type: 'milestone',    requirement: 10      },
    { id: 'level_25',                name: 'Rising Star',            description: 'Reach level 25',                                 xpReward: 300,  icon: '⚡', type: 'milestone',    requirement: 25      },
    { id: 'level_50',                name: 'Gold Tier',              description: 'Reach level 50',                                 xpReward: 500,  icon: '🥇', type: 'milestone',    requirement: 50      },
    { id: 'level_75',                name: 'Legend',                 description: 'Reach level 75',                                 xpReward: 750,  icon: '👑', type: 'milestone',    requirement: 75      },
    { id: 'level_100',               name: 'Platinum Tier',          description: 'Reach level 100',                                xpReward: 1000, icon: '💎', type: 'milestone',    requirement: 100     },
    { id: 'weekly_warrior',          name: 'Weekly Warrior',         description: 'Complete 4 weeks of consistent training',        xpReward: 150,  icon: '📅', type: 'consistency',  requirement: 4       },
    { id: 'monthly_master',          name: 'Monthly Master',         description: 'Complete 12 weeks of consistent training',       xpReward: 400,  icon: '📅', type: 'consistency',  requirement: 12      },
    { id: 'quarterly_king',          name: 'Quarterly King',         description: 'Complete 24 weeks of consistent training',       xpReward: 800,  icon: '📅', type: 'consistency',  requirement: 24      },
    { id: 'yearly_emperor',          name: 'Yearly Emperor',         description: 'Complete 52 weeks of consistent training',       xpReward: 2000, icon: '📅', type: 'consistency',  requirement: 52      },
    { id: 'early_bird',              name: 'Early Bird',             description: 'Complete 10 morning workouts',                   xpReward: 100,  icon: '🌅', type: 'milestone',    requirement: 10      },
    { id: 'night_owl',               name: 'Night Owl',              description: 'Complete 10 evening workouts',                   xpReward: 100,  icon: '🌙', type: 'milestone',    requirement: 10      },
    { id: 'weekend_warrior_special', name: 'Weekend Warrior',        description: 'Complete 20 weekend workouts',                   xpReward: 200,  icon: '🎉', type: 'milestone',    requirement: 20      },
    { id: 'perfect_week',            name: 'Perfect Week',           description: 'Complete all 5 days in a single week',           xpReward: 250,  icon: '✨', type: 'milestone',    requirement: 1       },
    { id: 'quick_finisher',          name: 'Speed Demon',            description: 'Complete 5 workouts in under 45 minutes',        xpReward: 150,  icon: '⚡', type: 'milestone',    requirement: 5       },
    { id: 'endurance_master',        name: 'Endurance Master',       description: 'Complete 5 workouts over 90 minutes',            xpReward: 150,  icon: '⏱️', type: 'milestone',    requirement: 5       },
  ];

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    if (!supabase) return this.ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }));

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching achievements:', error);
      }

      const unlockedMap = new Map((data || []).map(ua => [ua.achievement_id, ua.unlocked_at]));
      return this.ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: unlockedMap.has(ach.id),
        unlockedAt: unlockedMap.get(ach.id) as string | undefined,
      }));
    } catch (error) {
      console.error('Exception fetching achievements:', error);
      return this.ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }));
    }
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<AchievementUnlockedResult | null> {
    const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    // Check if already unlocked
    const currentAchievements = await this.getUserAchievements(userId);
    if (currentAchievements.find(a => a.id === achievementId)?.unlocked) return null;

    const unlockedAt = new Date().toISOString();

    if (supabase) {
      try {
        const { error } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: unlockedAt,
        });

        // Unique constraint violation means it's already unlocked — skip silently
        if (error && !error.message.includes('unique') && !error.message.includes('duplicate')) {
          console.error('Error saving achievement:', error);
          return null;
        }
      } catch (error) {
        console.error('Exception saving achievement:', error);
        return null;
      }
    }

    const levelUpResult = await xpService.awardXP(userId, achievement.xpReward, `Achievement unlocked: ${achievement.name}`);

    return {
      achievement: { ...achievement, unlocked: true, unlockedAt },
      xpAwarded: achievement.xpReward,
      levelUp: levelUpResult.leveledUp
        ? { previousLevel: levelUpResult.previousLevel, newLevel: levelUpResult.newLevel }
        : undefined,
    };
  }

  async checkAndUnlockAchievements(userId: string): Promise<AchievementUnlockedResult[]> {
    const unlockedAchievements: AchievementUnlockedResult[] = [];

    const workoutHistory = await workoutService.getWorkoutHistory(userId);
    const totalWorkouts = workoutHistory.length;
    const totalWeight = workoutHistory.reduce(
      (total, workout) => total + workout.exercises.reduce((sum, ex) => sum + ex.weight * ex.sets * ex.reps, 0),
      0
    );
    const currentStreak = this.calculateStreak(workoutHistory);
    const xpData = await xpService.getUserXP(userId);
    const currentLevel = xpData.level;

    const checks: Array<() => Promise<void>> = [
      // Workout count milestones
      ...this.ACHIEVEMENTS.filter(a => a.id.startsWith('workout_')).map(ach => async () => {
        if (totalWorkouts >= ach.requirement) {
          const r = await this.unlockAchievement(userId, ach.id);
          if (r) unlockedAchievements.push(r);
        }
      }),
      // First workout
      async () => {
        if (totalWorkouts >= 1) {
          const r = await this.unlockAchievement(userId, 'first_workout');
          if (r) unlockedAchievements.push(r);
        }
      },
      // Volume milestones
      ...this.ACHIEVEMENTS.filter(a => a.id.startsWith('weight_')).map(ach => async () => {
        if (totalWeight >= ach.requirement) {
          const r = await this.unlockAchievement(userId, ach.id);
          if (r) unlockedAchievements.push(r);
        }
      }),
      // Streaks
      ...this.ACHIEVEMENTS.filter(a => a.id.startsWith('streak_')).map(ach => async () => {
        if (currentStreak >= ach.requirement) {
          const r = await this.unlockAchievement(userId, ach.id);
          if (r) unlockedAchievements.push(r);
        }
      }),
      // Level milestones
      ...this.ACHIEVEMENTS.filter(a => a.id.startsWith('level_')).map(ach => async () => {
        if (currentLevel >= ach.requirement) {
          const r = await this.unlockAchievement(userId, ach.id);
          if (r) unlockedAchievements.push(r);
        }
      }),
      // Consistency
      async () => {
        const consistentWeeks = this.calculateConsistentWeeks(workoutHistory);
        for (const ach of this.ACHIEVEMENTS.filter(a => a.type === 'consistency')) {
          if (consistentWeeks >= ach.requirement) {
            const r = await this.unlockAchievement(userId, ach.id);
            if (r) unlockedAchievements.push(r);
          }
        }
      },
      // Time-of-day
      async () => {
        if (this.calculateMorningWorkouts(workoutHistory) >= 10) {
          const r = await this.unlockAchievement(userId, 'early_bird');
          if (r) unlockedAchievements.push(r);
        }
      },
      async () => {
        if (this.calculateEveningWorkouts(workoutHistory) >= 10) {
          const r = await this.unlockAchievement(userId, 'night_owl');
          if (r) unlockedAchievements.push(r);
        }
      },
      async () => {
        if (this.calculateWeekendWorkouts(workoutHistory) >= 20) {
          const r = await this.unlockAchievement(userId, 'weekend_warrior_special');
          if (r) unlockedAchievements.push(r);
        }
      },
      async () => {
        if (this.calculatePerfectWeeks(workoutHistory) >= 1) {
          const r = await this.unlockAchievement(userId, 'perfect_week');
          if (r) unlockedAchievements.push(r);
        }
      },
      async () => {
        if (this.calculateQuickWorkouts(workoutHistory) >= 5) {
          const r = await this.unlockAchievement(userId, 'quick_finisher');
          if (r) unlockedAchievements.push(r);
        }
      },
      async () => {
        if (this.calculateEnduranceWorkouts(workoutHistory) >= 5) {
          const r = await this.unlockAchievement(userId, 'endurance_master');
          if (r) unlockedAchievements.push(r);
        }
      },
    ];

    for (const check of checks) {
      try {
        await check();
      } catch (error) {
        console.error('Achievement check failed:', error);
      }
    }

    return unlockedAchievements;
  }

  private calculateStreak(workoutHistory: { date: string }[]): number {
    if (workoutHistory.length === 0) return 0;

    const sortedDates = workoutHistory
      .map(w => new Date(w.date).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = [...new Set(sortedDates)];
    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = Math.round(
        (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000
      );
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }

  private calculateConsistentWeeks(workoutHistory: { date: string }[]): number {
    if (workoutHistory.length === 0) return 0;
    const weekCounts = new Map<string, number>();
    for (const workout of workoutHistory) {
      const d = new Date(workout.date);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek - 1));
      const weekKey = monday.toISOString().slice(0, 10);
      weekCounts.set(weekKey, (weekCounts.get(weekKey) ?? 0) + 1);
    }
    let count = 0;
    for (const n of weekCounts.values()) if (n >= 3) count++;
    return count;
  }

  private calculateMorningWorkouts(workoutHistory: { date: string; startTime?: string }[]): number {
    return workoutHistory.filter(w => {
      const hour = new Date(w.startTime ?? w.date).getHours();
      return hour >= 5 && hour < 12;
    }).length;
  }

  private calculateEveningWorkouts(workoutHistory: { date: string; startTime?: string }[]): number {
    return workoutHistory.filter(w => new Date(w.startTime ?? w.date).getHours() >= 17).length;
  }

  private calculateWeekendWorkouts(workoutHistory: { date: string }[]): number {
    return workoutHistory.filter(w => [0, 6].includes(new Date(w.date).getDay())).length;
  }

  private calculatePerfectWeeks(workoutHistory: { date: string }[]): number {
    const weekDays = new Map<string, Set<string>>();
    for (const workout of workoutHistory) {
      const d = new Date(workout.date);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek - 1));
      const weekKey = monday.toISOString().slice(0, 10);
      if (!weekDays.has(weekKey)) weekDays.set(weekKey, new Set());
      weekDays.get(weekKey)!.add(d.toDateString());
    }
    let count = 0;
    for (const days of weekDays.values()) if (days.size >= 5) count++;
    return count;
  }

  private calculateQuickWorkouts(workoutHistory: { date: string; startTime?: string }[]): number {
    return workoutHistory.filter(w => {
      if (!w.startTime) return false;
      const mins = (new Date(w.date).getTime() - new Date(w.startTime).getTime()) / 60000;
      return mins > 0 && mins < 45;
    }).length;
  }

  private calculateEnduranceWorkouts(workoutHistory: { date: string; startTime?: string }[]): number {
    return workoutHistory.filter(w => {
      if (!w.startTime) return false;
      return (new Date(w.date).getTime() - new Date(w.startTime).getTime()) / 60000 > 90;
    }).length;
  }

  async getAchievementProgress(
    userId: string,
    achievementId: string
  ): Promise<{ current: number; required: number; percentage: number } | null> {
    const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const workoutHistory = await workoutService.getWorkoutHistory(userId);
    let current = 0;

    if (achievement.id === 'first_workout' || achievement.id.startsWith('workout_')) {
      current = workoutHistory.length;
    } else if (achievement.id.startsWith('weight_')) {
      current = workoutHistory.reduce(
        (t, w) => t + w.exercises.reduce((s, ex) => s + ex.weight * ex.sets * ex.reps, 0), 0
      );
    } else if (achievement.id.startsWith('streak_')) {
      current = this.calculateStreak(workoutHistory);
    } else if (achievement.id.startsWith('level_')) {
      current = (await xpService.getUserXP(userId)).level;
    } else if (achievement.type === 'consistency') {
      current = this.calculateConsistentWeeks(workoutHistory);
    } else if (achievement.id === 'early_bird') {
      current = this.calculateMorningWorkouts(workoutHistory);
    } else if (achievement.id === 'night_owl') {
      current = this.calculateEveningWorkouts(workoutHistory);
    } else if (achievement.id === 'weekend_warrior_special') {
      current = this.calculateWeekendWorkouts(workoutHistory);
    } else if (achievement.id === 'perfect_week') {
      current = this.calculatePerfectWeeks(workoutHistory);
    } else if (achievement.id === 'quick_finisher') {
      current = this.calculateQuickWorkouts(workoutHistory);
    } else if (achievement.id === 'endurance_master') {
      current = this.calculateEnduranceWorkouts(workoutHistory);
    }

    return {
      current,
      required: achievement.requirement,
      percentage: Math.min((current / achievement.requirement) * 100, 100),
    };
  }

  getAllAchievements(): Omit<Achievement, 'unlocked' | 'unlockedAt'>[] {
    return this.ACHIEVEMENTS;
  }

  async adminUnlockAchievement(userId: string, achievementId: string): Promise<AchievementUnlockedResult | null> {
    return this.unlockAchievement(userId, achievementId);
  }
}

export const achievementsService = new AchievementsService();
