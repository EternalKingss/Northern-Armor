import { supabase } from '../lib/supabase';

export const MAX_CUSTOM_WORKOUTS = 2;

export interface WorkoutQuestionnaire {
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  sessionDuration: number;
  equipment: string[];
  injuries: string[];
  preferences: string[];
}

export interface HealthData {
  averageSteps?: number;
  averageSleep?: number;
  weight?: number;
  age?: number;
}

export interface GeneratedExercise {
  name: string;
  workingSets: number;
  reps: string;
  lastSetRPE: string;
  rest: string;
  notes?: string;
}

export interface GeneratedDay {
  name: string;
  focus: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedWeek {
  week: number;
  block: string;
  days: GeneratedDay[];
}

export interface GeneratedWorkoutPlan {
  programName: string;
  description: string;
  daysPerWeek: number;
  weeks: GeneratedWeek[];
}

export interface StoredCustomWorkout {
  id: string;
  workoutPlan: GeneratedWorkoutPlan;
  questionnaire: WorkoutQuestionnaire;
  createdAt: string;
  updatedAt: string;
}

export interface AIWorkoutResponse {
  success: boolean;
  workoutPlan?: GeneratedWorkoutPlan;
  workoutId?: string;
  generatedAt?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachChatResponse {
  reply: string;
  readyToGenerate: boolean;
  questionnaire: WorkoutQuestionnaire | null;
}

class AIWorkoutService {
  private generateWorkoutId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private localCacheKey(userId: string): string {
    return `custom_workouts_cache_${userId}`;
  }

  private saveToLocalCache(userId: string, workout: StoredCustomWorkout): void {
    try {
      const existing = this.readLocalCache(userId);
      const filtered = existing.filter(w => w.id !== workout.id);
      filtered.unshift(workout);
      localStorage.setItem(this.localCacheKey(userId), JSON.stringify(filtered));
    } catch {
      // ignore storage errors
    }
  }

  private readLocalCache(userId: string): StoredCustomWorkout[] {
    try {
      return JSON.parse(localStorage.getItem(this.localCacheKey(userId)) || '[]');
    } catch {
      return [];
    }
  }

  private removeFromLocalCache(userId: string, workoutId: string): void {
    try {
      const existing = this.readLocalCache(userId);
      localStorage.setItem(this.localCacheKey(userId), JSON.stringify(existing.filter(w => w.id !== workoutId)));
    } catch {
      // ignore
    }
  }

  async getCustomWorkoutCount(userId: string): Promise<number> {
    const workouts = await this.getAllCustomWorkouts(userId);
    return workouts.length;
  }

  async canCreateWorkout(userId: string): Promise<boolean> {
    return (await this.getCustomWorkoutCount(userId)) < MAX_CUSTOM_WORKOUTS;
  }

  async generateWorkout(
    userId: string,
    questionnaire: WorkoutQuestionnaire,
    healthData?: HealthData
  ): Promise<AIWorkoutResponse> {
    if (!(await this.canCreateWorkout(userId))) {
      return {
        success: false,
        error: `You can only have ${MAX_CUSTOM_WORKOUTS} custom workouts. Please delete one to create a new one.`,
      };
    }

    if (!supabase) {
      return { success: false, error: 'Supabase is not configured. Cannot generate AI workout.' };
    }

    // Verify subscription before hitting the edge function
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', userId)
        .single();

      if (!userData || userData.subscription_status !== 'active') {
        return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
      }
    } catch {
      return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { userId, questionnaire, healthData },
      });

      if (error) {
        const msg = error.message || '';
        if (
          msg.includes('401') || msg.includes('403') ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('subscription')
        ) {
          return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
        }
        console.error('Error calling AI workout function:', error);
        return { success: false, error: msg || 'Failed to generate workout' };
      }

      if (data.success && data.workoutPlan) {
        const workoutId = this.generateWorkoutId();
        const now = new Date().toISOString();
        const storedWorkout: StoredCustomWorkout = {
          id: workoutId,
          workoutPlan: data.workoutPlan,
          questionnaire,
          createdAt: now,
          updatedAt: now,
        };
        await this.saveCustomWorkout(userId, workoutId, data.workoutPlan, questionnaire);
        this.saveToLocalCache(userId, storedWorkout);
        return { ...data, workoutId } as AIWorkoutResponse;
      }

      return data as AIWorkoutResponse;
    } catch (error) {
      console.error('Error generating workout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async saveCustomWorkout(
    userId: string,
    workoutId: string,
    workoutPlan: GeneratedWorkoutPlan,
    questionnaire: WorkoutQuestionnaire
  ): Promise<void> {
    if (!supabase) return;

    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from('custom_workouts').upsert({
        user_id: userId,
        workout_id: workoutId,
        workout_plan: workoutPlan,
        questionnaire,
        created_at: now,
        updated_at: now,
      }, { onConflict: 'user_id,workout_id' });

      if (error) console.error('Error saving custom workout:', error);
    } catch (error) {
      console.error('Exception saving custom workout:', error);
    }
  }

  async getAllCustomWorkouts(userId: string): Promise<StoredCustomWorkout[]> {
    if (!supabase) return this.readLocalCache(userId);

    try {
      const { data, error } = await supabase
        .from('custom_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom workouts:', error);
        return this.readLocalCache(userId);
      }

      const remoteWorkouts = (data || []).map(item => ({
        id: item.workout_id || item.id,
        workoutPlan: item.workout_plan as GeneratedWorkoutPlan,
        questionnaire: item.questionnaire as WorkoutQuestionnaire,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      // If Supabase returned nothing, fall back to local cache
      if (remoteWorkouts.length === 0) {
        return this.readLocalCache(userId);
      }

      return remoteWorkouts;
    } catch (error) {
      console.error('Exception fetching custom workouts:', error);
      return this.readLocalCache(userId);
    }
  }

  async getCustomWorkout(userId: string, workoutId?: string): Promise<StoredCustomWorkout | null> {
    const workouts = await this.getAllCustomWorkouts(userId);
    if (workoutId) return workouts.find(w => w.id === workoutId) || null;
    return workouts.length > 0 ? workouts[0] : null;
  }

  async deleteCustomWorkout(userId: string, workoutId: string): Promise<void> {
    this.removeFromLocalCache(userId, workoutId);

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('custom_workouts')
        .delete()
        .eq('user_id', userId)
        .eq('workout_id', workoutId);

      if (error) console.error('Error deleting custom workout:', error);
    } catch (error) {
      console.error('Exception deleting custom workout:', error);
    }
  }

  async hasCustomWorkout(userId: string): Promise<boolean> {
    return (await this.getAllCustomWorkouts(userId)).length > 0;
  }

  async chatWithCoach(userId: string, messages: ChatMessage[]): Promise<CoachChatResponse> {
    if (!supabase) {
      return { reply: 'Supabase is not configured.', readyToGenerate: false, questionnaire: null };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach-chat', {
        body: { userId, messages },
      });

      if (error) {
        const msg = error.message || '';
        if (msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('subscription')) {
          throw new Error('SUBSCRIPTION_REQUIRED');
        }
        throw new Error(msg || 'Failed to reach coach');
      }

      return data as CoachChatResponse;
    } catch (error) {
      throw error;
    }
  }

  async importWorkout(
    userId: string,
    rawText: string,
    questionnaire: WorkoutQuestionnaire
  ): Promise<AIWorkoutResponse> {
    if (!(await this.canCreateWorkout(userId))) {
      return {
        success: false,
        error: `You can only have ${MAX_CUSTOM_WORKOUTS} custom workouts. Please delete one to create a new one.`,
      };
    }

    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', userId)
        .single();

      if (!userData || userData.subscription_status !== 'active') {
        return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
      }
    } catch {
      return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('import-workout', {
        body: { userId, rawText },
      });

      if (error) {
        const msg = error.message || '';
        if (msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('subscription')) {
          return { success: false, error: 'SUBSCRIPTION_REQUIRED' };
        }
        return { success: false, error: msg || 'Failed to import workout' };
      }

      if (data.success && data.workoutPlan) {
        const workoutId = this.generateWorkoutId();
        const now = new Date().toISOString();
        const storedWorkout: StoredCustomWorkout = {
          id: workoutId,
          workoutPlan: data.workoutPlan,
          questionnaire,
          createdAt: now,
          updatedAt: now,
        };
        await this.saveCustomWorkout(userId, workoutId, data.workoutPlan, questionnaire);
        this.saveToLocalCache(userId, storedWorkout);
        return { ...data, workoutId } as AIWorkoutResponse;
      }

      return data as AIWorkoutResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const aiWorkoutService = new AIWorkoutService();
