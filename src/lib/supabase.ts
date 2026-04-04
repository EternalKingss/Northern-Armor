import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Using offline mode.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database Types
export interface DbUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  xp?: number;
  level?: number;
  is_admin?: boolean;
  selected_program?: string;
}

export interface DbWeightTracking {
  id: string;
  user_id: string;
  initial_weight: number | null;
  goal_weight: number | null;
  check_ins: Array<{ week: number; weight: number; date: string }>;
  updated_at: string;
}

export interface DbWorkoutSession {
  id: string;
  user_id: string;
  week: number;
  day: number;
  day_name: string;
  started_at: string;
  completed_at: string;
  exercises: DbExercise[];
  notes?: string | null;
  rating?: number | null;
}

export interface DbExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rpe?: number;
  technique?: string;
}

export interface DbProgression {
  id: string;
  user_id: string;
  current_week: number;
  completed_days: number[];
  updated_at: string;
}

export interface DbAchievement {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
  icon: string;
  type: 'milestone' | 'streak' | 'volume' | 'consistency';
  requirement: number;
  created_at: string;
}

export interface DbUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: DbAchievement;
}
