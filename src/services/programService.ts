import { supabase } from '../lib/supabase';

export type BuiltInProgramType = 'bodybuilding' | 'hybrid';
export type CustomProgramType = `custom_${string}`;
export type ProgramType = BuiltInProgramType | CustomProgramType;

const CACHE_KEY = 'selected_program';

export const programService = {
  isCustomProgram(program: ProgramType): program is CustomProgramType {
    return program.startsWith('custom_');
  },

  isBuiltInProgram(program: ProgramType): program is BuiltInProgramType {
    return program === 'bodybuilding' || program === 'hybrid';
  },

  getCustomWorkoutId(program: CustomProgramType): string {
    return program.replace('custom_', '');
  },

  createCustomProgramType(workoutId: string): CustomProgramType {
    return `custom_${workoutId}`;
  },

  /** Fast synchronous read from localStorage cache */
  getSelectedProgram(userId: string): ProgramType {
    try {
      return (localStorage.getItem(`${CACHE_KEY}_${userId}`) as ProgramType) || 'bodybuilding';
    } catch {
      return 'bodybuilding';
    }
  },

  /** Write to both localStorage cache and Supabase */
  setSelectedProgram(userId: string, program: ProgramType): void {
    try {
      localStorage.setItem(`${CACHE_KEY}_${userId}`, program);
    } catch {
      // ignore storage errors
    }

    if (supabase) {
      supabase
        .from('users')
        .update({ selected_program: program, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.error('Error saving selected program:', error);
        });
    }
  },

  /**
   * Load selected program from Supabase and hydrate localStorage cache.
   * Call this once on login / app init via ProgramContext.
   */
  async loadFromSupabase(userId: string): Promise<ProgramType> {
    if (!supabase) return this.getSelectedProgram(userId);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('selected_program')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading selected program from Supabase:', error);
        return this.getSelectedProgram(userId);
      }

      const program = (data?.selected_program as ProgramType) || 'bodybuilding';
      try {
        localStorage.setItem(`${CACHE_KEY}_${userId}`, program);
      } catch {
        // ignore
      }
      return program;
    } catch {
      return this.getSelectedProgram(userId);
    }
  },

  getProgramDisplayName(program: ProgramType, customName?: string): string {
    if (this.isCustomProgram(program)) return customName || 'Custom AI Workout';
    if (program === 'bodybuilding') return 'Bodybuilding';
    if (program === 'hybrid') return 'Hybrid';
    return 'Unknown';
  },
};
