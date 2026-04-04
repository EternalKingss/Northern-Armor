import { supabase } from '../lib/supabase';

export interface UserXPData {
  xp: number;
  level: number;
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
}

class XPService {
  private readonly XP_PER_WORKOUT = 50;

  getXPForNextLevel(currentLevel: number): number {
    return 100 * currentLevel;
  }

  getTotalXPForLevel(targetLevel: number): number {
    let totalXP = 0;
    for (let level = 1; level < targetLevel; level++) {
      totalXP += this.getXPForNextLevel(level);
    }
    return totalXP;
  }

  calculateLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpForNextLevel = this.getXPForNextLevel(level);
    while (totalXP >= xpForNextLevel) {
      totalXP -= xpForNextLevel;
      level++;
      xpForNextLevel = this.getXPForNextLevel(level);
    }
    return level;
  }

  getXPProgress(totalXP: number, currentLevel: number): { current: number; needed: number; percentage: number } {
    const xpForCurrentLevel = this.getTotalXPForLevel(currentLevel);
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForNext = this.getXPForNextLevel(currentLevel);
    return {
      current: xpInCurrentLevel,
      needed: xpNeededForNext,
      percentage: (xpInCurrentLevel / xpNeededForNext) * 100,
    };
  }

  async getUserXP(userId: string): Promise<UserXPData> {
    if (!supabase) return { xp: 0, level: 1 };

    try {
      const { data, error } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (error) console.error('Error fetching XP:', error);
      if (data) return { xp: data.xp || 0, level: data.level || 1 };
    } catch (error) {
      console.error('Exception fetching XP:', error);
    }

    return { xp: 0, level: 1 };
  }

  async awardXP(userId: string, xpAmount: number, _reason: string): Promise<LevelUpResult> {
    const currentData = await this.getUserXP(userId);
    const previousLevel = currentData.level;
    const newTotalXP = currentData.xp + xpAmount;
    const newLevel = this.calculateLevelFromXP(newTotalXP);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ xp: newTotalXP, level: newLevel, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) console.error('Error updating XP:', error);
      } catch (error) {
        console.error('Exception updating XP:', error);
      }
    }

    return { leveledUp: newLevel > previousLevel, newLevel, previousLevel };
  }

  async awardWorkoutXP(userId: string): Promise<LevelUpResult> {
    return this.awardXP(userId, this.XP_PER_WORKOUT, 'Completed workout');
  }

  async setUserXP(userId: string, xp: number, level: number): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ xp, level, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) console.error('Error setting XP:', error);
    } catch (error) {
      console.error('Exception setting XP:', error);
    }
  }

  getProfileTier(level: number): {
    name: 'bronze' | 'silver' | 'gold' | 'platinum';
    displayName: string;
    icon: string;
    minLevel: number;
    maxLevel: number;
  } {
    if (level >= 100) return { name: 'platinum', displayName: 'Platinum', icon: '💎', minLevel: 100, maxLevel: Infinity };
    if (level >= 50)  return { name: 'gold',     displayName: 'Gold',     icon: '🥇', minLevel: 50,  maxLevel: 99 };
    if (level >= 10)  return { name: 'silver',   displayName: 'Silver',   icon: '🥈', minLevel: 10,  maxLevel: 49 };
    return                    { name: 'bronze',   displayName: 'Bronze',   icon: '🥉', minLevel: 1,   maxLevel: 9 };
  }
}

export const xpService = new XPService();
