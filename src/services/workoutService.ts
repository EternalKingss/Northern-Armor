import { supabase, DbWorkoutSession, DbProgression, DbExercise } from '../lib/supabase';

// Workout progression interface
export interface WorkoutProgression {
  currentWeek: number;
  completedDays: number[];
}

// Workout history interface
export interface WorkoutHistory {
  date: string;
  startTime?: string; // ISO string of when workout started (used for duration/time-of-day achievements)
  notes?: string;     // Optional free-text session notes
  dayName?: string;   // Name of the workout day
  rating?: number;    // 1-5 session effort/mood rating
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

// Weight tracking interfaces
export interface WeightCheckIn {
  week: number;
  weight: number;
  date: string;
}

export interface WeightTracking {
  initialWeight: number | null;
  goalWeight: number | null;
  checkIns: WeightCheckIn[];
}

class WorkoutService {
  /**
   * Get user's workout progression
   */
  async getProgression(userId: string): Promise<WorkoutProgression> {
    if (!supabase) return { currentWeek: 1, completedDays: [] };

    try {
      const { data, error } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progression:', error);
      }

      if (data) {
        return {
          currentWeek: data.current_week,
          completedDays: data.completed_days || [],
        };
      }
    } catch (error) {
      console.error('Exception fetching progression:', error);
    }

    return { currentWeek: 1, completedDays: [] };
  }

  /**
   * Update user's workout progression
   */
  async updateProgression(userId: string, progression: WorkoutProgression): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('user_progression')
        .upsert({
          user_id: userId,
          current_week: progression.currentWeek,
          completed_days: progression.completedDays,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) console.error('Error updating progression:', error);
    } catch (error) {
      console.error('Exception updating progression:', error);
    }
  }

  /**
   * LocalStorage key for offline workout history
   */
  private localHistoryKey(userId: string) {
    return `workout_history_${userId}`;
  }

  private loadLocalHistory(userId: string): WorkoutHistory[] {
    try {
      const raw = localStorage.getItem(this.localHistoryKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalHistory(userId: string, history: WorkoutHistory[]): void {
    try {
      localStorage.setItem(this.localHistoryKey(userId), JSON.stringify(history));
    } catch {
      // quota exceeded — silently skip
    }
  }

  /**
   * Save a completed workout session
   */
  async saveWorkoutSession(
    userId: string,
    week: number,
    day: number,
    dayName: string,
    exercises: DbExercise[],
    startTime: Date,
    endTime: Date,
    notes?: string,
    rating?: number
  ): Promise<void> {
    // Always persist to localStorage as offline cache
    const entry: WorkoutHistory = {
      date: endTime.toISOString(),
      startTime: startTime.toISOString(),
      dayName,
      notes: notes?.trim() || undefined,
      rating: rating || undefined,
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      })),
    };
    const local = this.loadLocalHistory(userId);
    local.push(entry);
    this.saveLocalHistory(userId, local);

    if (!supabase) return;

    try {
      const { error } = await supabase.from('workout_sessions').insert({
        user_id: userId,
        week,
        day,
        day_name: dayName,
        exercises,
        notes: notes?.trim() || null,
        rating: rating || null,
        started_at: startTime.toISOString(),
        completed_at: endTime.toISOString(),
      });

      if (error) console.error('Error saving workout session:', error);
    } catch (error) {
      console.error('Exception saving workout session:', error);
    }
  }

  /**
   * Get workout history for a user — falls back to localStorage when Supabase unavailable
   */
  async getWorkoutHistory(userId: string): Promise<WorkoutHistory[]> {
    // No Supabase: read from localStorage cache only
    if (!supabase) return this.loadLocalHistory(userId);

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Error fetching workout history:', error);
        // Fall back to localStorage on network error
        return this.loadLocalHistory(userId);
      }

      const remote = (data || []).map((session: DbWorkoutSession) => ({
        date: session.completed_at,
        startTime: session.started_at,
        dayName: session.day_name,
        notes: session.notes ?? undefined,
        rating: session.rating ?? undefined,
        exercises: session.exercises.map((ex: DbExercise) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
      }));

      // Sync remote data back to localStorage cache for offline use
      this.saveLocalHistory(userId, remote);
      return remote;
    } catch (error) {
      console.error('Exception fetching workout history:', error);
      return this.loadLocalHistory(userId);
    }
  }

  /**
   * Get user's weight tracking data
   */
  async getWeightTracking(userId: string): Promise<WeightTracking> {
    const defaultTracking: WeightTracking = {
      initialWeight: null,
      goalWeight: null,
      checkIns: [],
    };

    if (!supabase) return defaultTracking;

    try {
      const { data, error } = await supabase
        .from('weight_tracking')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching weight tracking:', error);
      }

      if (data) {
        return {
          initialWeight: data.initial_weight ?? null,
          goalWeight: data.goal_weight ?? null,
          checkIns: (data.check_ins as WeightCheckIn[]) || [],
        };
      }
    } catch (error) {
      console.error('Exception fetching weight tracking:', error);
    }

    return defaultTracking;
  }

  /**
   * Update user's weight tracking data
   */
  async updateWeightTracking(userId: string, weightTracking: WeightTracking): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('weight_tracking')
        .upsert({
          user_id: userId,
          initial_weight: weightTracking.initialWeight,
          goal_weight: weightTracking.goalWeight,
          check_ins: weightTracking.checkIns,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) console.error('Error updating weight tracking:', error);
    } catch (error) {
      console.error('Exception updating weight tracking:', error);
    }
  }

  /**
   * Set initial weight and goal weight (called on first workout)
   */
  async setInitialWeightGoal(userId: string, initialWeight: number, goalWeight: number): Promise<void> {
    const tracking = await this.getWeightTracking(userId);
    tracking.initialWeight = initialWeight;
    tracking.goalWeight = goalWeight;
    tracking.checkIns = [{
      week: 1,
      weight: initialWeight,
      date: new Date().toISOString(),
    }];
    await this.updateWeightTracking(userId, tracking);
  }

  /**
   * Add a weight check-in for a specific week
   */
  async addWeightCheckIn(userId: string, week: number, weight: number): Promise<void> {
    const tracking = await this.getWeightTracking(userId);
    tracking.checkIns = tracking.checkIns.filter(c => c.week !== week);
    tracking.checkIns.push({ week, weight, date: new Date().toISOString() });
    tracking.checkIns.sort((a, b) => a.week - b.week);
    await this.updateWeightTracking(userId, tracking);
  }

  /**
   * Check if user needs to do a weight check-in for current week
   */
  needsWeightCheckIn(weightTracking: WeightTracking, currentWeek: number): boolean {
    if (currentWeek % 4 !== 0) return false;
    return !weightTracking.checkIns.some(c => c.week === currentWeek);
  }

  /**
   * Get the last time a specific exercise was performed
   */
  async getLastExercisePerformance(
    userId: string,
    exerciseName: string
  ): Promise<{ weight: number; reps: number; sets: number; date: string } | null> {
    if (!supabase) {
      // Search localStorage cache
      const local = this.loadLocalHistory(userId);
      for (const session of [...local].reverse()) {
        const ex = session.exercises.find(e => e.name === exerciseName);
        if (ex) return { weight: ex.weight, reps: ex.reps, sets: ex.sets, date: session.date };
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('exercises, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercise history:', error);
        return null;
      }

      if (data && data.length > 0) {
        for (const session of data) {
          const exercise = session.exercises.find((ex: DbExercise) => ex.name === exerciseName);
          if (exercise) {
            return {
              weight: exercise.weight,
              reps: exercise.reps,
              sets: exercise.sets,
              date: session.completed_at,
            };
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching exercise history:', error);
    }

    return null;
  }
}

export const workoutService = new WorkoutService();
