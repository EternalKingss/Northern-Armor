import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, TierBackgroundWrapper, Tabs } from '../components';
import { WORKOUT_PROGRAM, WARM_UP_PROTOCOL, WorkoutExercise, WeekPlan } from '../data/workoutProgram';
import { HYBRID_PROGRAM, HYBRID_WARM_UP } from '../data/hybridProgram';
import { useAuth } from '../contexts/AuthContext';
import { useProgram } from '../contexts/ProgramContext';
import { workoutService } from '../services/workoutService';
import { programService } from '../services/programService';
import { aiWorkoutService, GeneratedWorkoutPlan, StoredCustomWorkout } from '../services/aiWorkoutService';

// Helper function to convert GeneratedWorkoutPlan to WeekPlan format
const convertCustomWorkoutToWeekPlan = (customWorkout: GeneratedWorkoutPlan): WeekPlan[] => {
  return customWorkout.weeks.map(week => ({
    week: week.week,
    block: week.block,
    days: week.days.map(day => ({
      name: day.name,
      exercises: day.exercises.map(ex => ({
        name: ex.name,
        warmupSets: '2 x 10 (light)',
        workingSets: ex.workingSets,
        reps: ex.reps,
        lastSetRPE: ex.lastSetRPE,
        rest: ex.rest,
        notes: ex.notes,
      })),
    })),
  }));
};

interface WorkoutProgression {
  currentWeek: number;
  completedDays: number[];
}

interface WarmUpActivity {
  name: string;
  reps?: string;
  duration?: string;
  goal?: string;
}

const programTabs = [
  { id: 'schedule', label: 'Schedule', icon: '📋' },
  { id: 'warmup', label: 'Warm-Up', icon: '🔥' },
  { id: 'notes', label: 'Notes', icon: '📝' },
];

const Program: React.FC = () => {
  const { user } = useAuth();
  const { selectedProgram } = useProgram();
  const [activeTab, setActiveTab] = useState('schedule');
  const [progression, setProgression] = useState<WorkoutProgression>({
    currentWeek: 1,
    completedDays: [],
  });
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [customWorkoutData, setCustomWorkoutData] = useState<StoredCustomWorkout | null>(null);

  // Load custom workout data when a custom program is selected
  useEffect(() => {
    const loadCustomWorkout = async () => {
      if (!user || !programService.isCustomProgram(selectedProgram)) {
        setCustomWorkoutData(null);
        return;
      }

      try {
        const workoutId = programService.getCustomWorkoutId(selectedProgram);
        const workout = await aiWorkoutService.getCustomWorkout(user.id, workoutId);
        setCustomWorkoutData(workout);
      } catch (error) {
        console.error('Error loading custom workout:', error);
      }
    };

    loadCustomWorkout();
  }, [user, selectedProgram]);

  const getCurrentProgram = () => {
    if (programService.isCustomProgram(selectedProgram) && customWorkoutData) {
      return convertCustomWorkoutToWeekPlan(customWorkoutData.workoutPlan);
    }
    return selectedProgram === 'hybrid' ? HYBRID_PROGRAM : WORKOUT_PROGRAM;
  };

  const getCurrentWarmUp = () => {
    if (programService.isCustomProgram(selectedProgram)) {
      return WARM_UP_PROTOCOL;
    }
    return selectedProgram === 'hybrid' ? HYBRID_WARM_UP : WARM_UP_PROTOCOL;
  };

  const getProgramName = () => {
    if (programService.isCustomProgram(selectedProgram) && customWorkoutData) {
      return `${customWorkoutData.workoutPlan.programName} - AI Generated`;
    }
    return selectedProgram === 'hybrid'
      ? 'Hybrid Training Program - Weights + Bodyweight Fusion'
      : 'Bodybuilding Transformation System - Beginner';
  };

  useEffect(() => {
    if (!user) return;

    const loadProgression = async () => {
      const saved = await workoutService.getProgression(user.id);
      if (saved) {
        setProgression(saved);
        setSelectedWeek(saved.currentWeek);
      }
    };

    loadProgression();
  }, [user, selectedProgram]);

  const isWeekUnlocked = (weekNumber: number): boolean => {
    return weekNumber <= progression.currentWeek;
  };

  const currentProgram = getCurrentProgram();
  const currentWeek = currentProgram.find(w => w.week === selectedWeek);
  const currentWorkout = currentWeek?.days[selectedDay];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <TierBackgroundWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} className="mb-4">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-1">Training Program</h1>
          <p className="text-white/60 text-sm">{getProgramName()}</p>
          <p className="text-orange-400 text-xs mt-1">
            {currentWeek?.block || 'Foundation Block'} • Week {selectedWeek}
          </p>
        </motion.div>

        <Tabs tabs={programTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
            {/* Week Selector */}
            <GlassCard>
              <h3 className="text-white text-base font-semibold mb-2">Select Week</h3>
              <p className="text-white/60 text-sm mb-3">
                You are on <span className="text-orange-400 font-semibold">Week {progression.currentWeek}</span>. Complete all days to unlock the next week.
              </p>
              <div className="flex flex-wrap gap-2">
                {currentProgram.map((week) => {
                  const isUnlocked = isWeekUnlocked(week.week);
                  const isCurrent = week.week === progression.currentWeek;
                  const isEmpty = week.days.length === 0;
                  const isLocked = !isUnlocked || isEmpty;

                  return (
                    <button
                      key={week.week}
                      onClick={() => isUnlocked && !isEmpty && setSelectedWeek(week.week)}
                      disabled={isLocked}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all relative ${
                        selectedWeek === week.week
                          ? 'bg-orange-500 text-white'
                          : isLocked
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {!isUnlocked && !isEmpty && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>W{week.week}{isCurrent ? ' ★' : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Day Selector */}
            <GlassCard>
              <h3 className="text-white text-base font-semibold mb-3">Select Day</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentWeek?.days.map((day, idx) => {
                  const isCompleted = selectedWeek === progression.currentWeek && progression.completedDays.includes(idx);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(idx)}
                      className={`p-3 rounded-xl font-semibold transition-all relative text-left ${
                        selectedDay === idx
                          ? 'bg-orange-500/30 border-2 border-orange-400 text-white'
                          : isCompleted
                          ? 'bg-green-500/10 border-2 border-green-400/50 text-white/90'
                          : 'bg-white/5 border-2 border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute top-2 right-2 text-green-400">✓</div>
                      )}
                      <div className="text-xs text-white/60 mb-0.5">Day {idx + 1}</div>
                      <div className="text-sm">{day.name}</div>
                      <div className="text-xs text-white/50 mt-0.5">{day.exercises.length} exercises</div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Exercise List */}
            {currentWorkout && (
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-xl font-bold">{currentWorkout.name}</h3>
                    <p className="text-white/60 text-sm">Week {selectedWeek} • Day {selectedDay + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 text-2xl font-bold">{currentWorkout.exercises.length}</p>
                    <p className="text-white/60 text-xs">Exercises</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {currentWorkout.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
                        className="w-full p-4 text-left hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-orange-400 font-bold">#{idx + 1}</span>
                              <h4 className="text-white font-semibold">{exercise.name}</h4>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-white/60">
                                <span className="text-white font-medium">{exercise.workingSets}</span> × <span className="text-white font-medium">{exercise.reps}</span>
                              </span>
                              <span className="text-orange-400 font-medium">RPE {exercise.lastSetRPE}</span>
                              <span className="text-white/60">Rest: {exercise.rest}</span>
                            </div>
                          </div>
                          <svg
                            className={`w-5 h-5 text-white/60 transition-transform flex-shrink-0 ml-2 ${
                              expandedExercise === idx ? 'rotate-180' : ''
                            }`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {expandedExercise === idx && (
                        <div className="px-4 pb-4 space-y-3">
                          {exercise.notes && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                              <p className="text-sm text-orange-200/90">
                                <span className="font-semibold text-orange-400">💡 Form Notes:</span> {exercise.notes}
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-white/60 text-xs mb-1">Warm-up Sets</p>
                              <p className="text-white font-semibold">{exercise.warmupSets}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-white/60 text-xs mb-1">Intensity Technique</p>
                              <p className="text-white font-semibold">{'intensityTechnique' in exercise ? exercise.intensityTechnique : 'N/A'}</p>
                            </div>
                          </div>
                          {(exercise.substitution1 || exercise.substitution2) && (
                            <div>
                              <p className="text-white/60 text-xs mb-2">Alternatives:</p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {exercise.substitution1 && (
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 sm:flex-1">
                                    <p className="text-blue-300 text-sm">{exercise.substitution1}</p>
                                  </div>
                                )}
                                {exercise.substitution2 && (
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 sm:flex-1">
                                    <p className="text-blue-300 text-sm">{exercise.substitution2}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* Warm-Up Tab */}
        {activeTab === 'warmup' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants}>
            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-4">Warm-Up Protocol (5-10 mins)</h3>
              {(() => {
                const warmUp = getCurrentWarmUp();
                const general = warmUp.general;
                const exerciseSpecific = warmUp.exerciseSpecific;

                return (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-2">General Warm-Up</h4>
                      {'cardio' in general && <p className="text-white/80 text-sm mb-3">{general.cardio}</p>}
                      {'title' in general && (
                        <p className="text-white/80 text-sm mb-3">
                          {general.title}: {general.objective}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {('dynamicStretches' in general ? general.dynamicStretches : general.activities).map(
                          (stretch: WarmUpActivity, idx: number) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3">
                              <p className="text-white text-sm font-medium">{stretch.name}</p>
                              <p className="text-white/60 text-xs">
                                {stretch.reps || stretch.duration || stretch.goal}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-orange-400 font-semibold mb-2">Exercise-Specific Warm-Up</h4>
                      {'description' in exerciseSpecific && (
                        <p className="text-white/60 text-sm mb-3">{exerciseSpecific.description}</p>
                      )}
                      <div className="space-y-2">
                        {Object.entries('protocol' in exerciseSpecific ? exerciseSpecific.protocol : exerciseSpecific).map(
                          ([sets, desc]) => {
                            if (sets === 'description' || sets === 'title') return null;
                            return (
                              <div key={sets} className="bg-white/5 rounded-lg p-3">
                                <p className="text-white text-sm">
                                  <span className="font-semibold text-orange-400">{sets}:</span> {String(desc)}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </GlassCard>
          </motion.div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants}>
            <GlassCard>
              <h3 className="text-white text-lg font-semibold mb-4">📝 Program Notes</h3>
              <div className="space-y-3 text-sm text-white/80">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-orange-400 font-semibold mb-1">Week 1 Intensity</p>
                  <p>Take sets to RPE ~6-7 (leaving 3-4 reps in the tank) — this is a deload/intro week.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-orange-400 font-semibold mb-1">After Week 1</p>
                  <p>Intensity increases to ~2-3 reps shy of failure.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-orange-400 font-semibold mb-1">Set Effort</p>
                  <p><span className="text-orange-300 font-medium">Early Sets</span> = slightly easier than your last set. <span className="text-orange-300 font-medium">Last Set</span> = pushed closer to failure.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-orange-400 font-semibold mb-1">Volume Note</p>
                  <p>Volume may feel low in Weeks 1-2 — focus on mastering technique!</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </TierBackgroundWrapper>
  );
};

export default Program;
