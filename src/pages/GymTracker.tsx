import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, CircularProgress, Button, TierBackgroundWrapper, Tabs } from '../components';
import RestTimer, { parseRestDuration } from '../components/RestTimer';
import Confetti from '../components/Confetti';
import PlateCalculator from '../components/PlateCalculator';
import { useAuth } from '../contexts/AuthContext';
import { useUnit } from '../contexts/UnitContext';
import { useProgram } from '../contexts/ProgramContext';
import { useToastContext } from '../contexts/ToastContext';
import { WORKOUT_PROGRAM, WeekPlan } from '../data/workoutProgram';
import { HYBRID_PROGRAM } from '../data/hybridProgram';
import { workoutService, WeightTracking } from '../services/workoutService';
import { xpService } from '../services/xpService';
import { achievementsService, AchievementUnlockedResult } from '../services/achievementsService';
import { programService } from '../services/programService';
import { aiWorkoutService, GeneratedWorkoutPlan, StoredCustomWorkout } from '../services/aiWorkoutService';

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number; // 0 = not set, 1-10 = logged RPE
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  name: string;
  workingSets: number;
  targetReps: string;
  targetRPE: string;
  rest: string;
  notes?: string;
  sets: ExerciseSet[];
  completed: boolean;
  skipped?: boolean;
  lastPerformance?: {
    weight: number;
    reps: number;
    sets: number;
    date: string;
  } | null;
}

interface WorkoutProgression {
  currentWeek: number;
  completedDays: number[]; // Array of day indices (0-4) completed in current week
}

interface WorkoutSession {
  week: number;
  day: number;
  dayName: string;
  exercises: WorkoutExercise[];
  startTime: Date | null;
  isActive: boolean;
}

interface WorkoutSummary {
  dayName: string;
  durationSeconds: number;
  totalVolumeLbs: number;
  exerciseCount: number;
  totalSets: number;
  prsSet: string[];   // exercise names where weight > lastPerformance weight
  xpEarned: number;
}

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

const GymTracker: React.FC = () => {
  const { user } = useAuth();
  const { selectedProgram } = useProgram();
  const toast = useToastContext();
  const { display: displayWeight, toLbs, label: unitLabel, weightIncrements } = useUnit();
  const [progression, setProgression] = useState<WorkoutProgression>({
    currentWeek: 1,
    completedDays: [],
  });

  // State for custom workout data
  const [customWorkoutData, setCustomWorkoutData] = useState<StoredCustomWorkout | null>(null);
  const [isLoadingCustomWorkout, setIsLoadingCustomWorkout] = useState(false);

  // Load custom workout data when a custom program is selected
  useEffect(() => {
    const loadCustomWorkout = async () => {
      if (!user || !programService.isCustomProgram(selectedProgram)) {
        setCustomWorkoutData(null);
        return;
      }

      setIsLoadingCustomWorkout(true);
      try {
        const workoutId = programService.getCustomWorkoutId(selectedProgram);
        const workout = await aiWorkoutService.getCustomWorkout(user.id, workoutId);
        setCustomWorkoutData(workout);
      } catch (error) {
        console.error('Error loading custom workout:', error);
        toast.error('Failed to load custom workout');
      } finally {
        setIsLoadingCustomWorkout(false);
      }
    };

    loadCustomWorkout();
  }, [user, selectedProgram, toast]);

  // Get the current program based on user selection (memoized to prevent re-renders)
  const currentProgram = useMemo(() => {
    if (programService.isCustomProgram(selectedProgram) && customWorkoutData) {
      return convertCustomWorkoutToWeekPlan(customWorkoutData.workoutPlan);
    }
    return selectedProgram === 'hybrid' ? HYBRID_PROGRAM : WORKOUT_PROGRAM;
  }, [selectedProgram, customWorkoutData]);

  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>({
    week: 1,
    day: 0,
    dayName: '',
    exercises: [],
    startTime: null,
    isActive: false,
  });

  const [weightTracking, setWeightTracking] = useState<WeightTracking>({
    initialWeight: null,
    goalWeight: null,
    checkIns: [],
  });

  const [showInitialWeightModal, setShowInitialWeightModal] = useState(false);
  const [showWeightCheckInModal, setShowWeightCheckInModal] = useState(false);
  const [tempInitialWeight, setTempInitialWeight] = useState('');
  const [tempGoalWeight, setTempGoalWeight] = useState('');
  const [tempCurrentWeight, setTempCurrentWeight] = useState('');
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ previousLevel: number; newLevel: number } | null>(null);
  const [newAchievements, setNewAchievements] = useState<AchievementUnlockedResult[]>([]);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [activeWorkoutTab, setActiveWorkoutTab] = useState<string>('dashboard');
  const [restTimer, setRestTimer] = useState<{ active: boolean; duration: number; exerciseName: string }>({
    active: false,
    duration: 90,
    exerciseName: '',
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(0);
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('personalExerciseNotes') || '{}'); } catch { return {}; }
  });
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [noteEditValue, setNoteEditValue] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const saved = await workoutService.getProgression(user.id);
      if (saved) {
        setProgression(saved);
      }

      const weight = await workoutService.getWeightTracking(user.id);
      setWeightTracking(weight);

      // Calculate current workout streak
      try {
        const history = await workoutService.getWorkoutHistory(user.id);
        if (history.length > 0) {
          const daySet = new Set(
            history.map(w => new Date(w.date).toLocaleDateString('en-CA'))
          );
          let streak = 0;
          const today = new Date();
          for (let i = 0; i <= 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('en-CA');
            if (daySet.has(key)) {
              streak++;
            } else if (i > 0) {
              break; // gap in streak
            }
          }
          setCurrentStreak(streak);
        }
      } catch {
        // non-critical
      }

      const sessionKey = `workout_session_${user.id}`;
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.startTime) {
            parsed.startTime = new Date(parsed.startTime);
          }
          setWorkoutSession(parsed);
          if (parsed.isActive) setActiveWorkoutTab('workout');
        } catch (error) {
          console.error('❌ Failed to restore workout session:', error);
          localStorage.removeItem(sessionKey);
        }
      }

      setHasLoadedSession(true);
    };

    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || !hasLoadedSession) return;

    const sessionKey = `workout_session_${user.id}`;

    if (workoutSession.isActive) {
      try {
        localStorage.setItem(sessionKey, JSON.stringify(workoutSession));
      } catch (error) {
        console.error('❌ Failed to save workout session:', error);
      }
    } else if (!workoutSession.isActive && workoutSession.exercises.length === 0) {
      localStorage.removeItem(sessionKey);
    }
  }, [workoutSession, user, hasLoadedSession]);

  // Elapsed workout clock
  useEffect(() => {
    if (!workoutSession.isActive || !workoutSession.startTime) {
      setElapsedSeconds(0);
      return;
    }
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - workoutSession.startTime!.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [workoutSession.isActive, workoutSession.startTime]);

  useEffect(() => {
    if (!user || !hasLoadedSession) return;

    const loadProgression = async () => {
      const saved = await workoutService.getProgression(user.id);
      if (saved) {
        setProgression(saved);
      }
    };

    loadProgression();
  }, [user, hasLoadedSession, selectedProgram]);

  const saveProgression = async (newProgression: WorkoutProgression) => {
    if (!user) return;
    await workoutService.updateProgression(user.id, newProgression);
    setProgression(newProgression);
  };

  const getNextWorkoutDay = (): { week: number; day: number } => {
    const { currentWeek, completedDays } = progression;

    const weekData = currentProgram.find(w => w.week === currentWeek);
    const numDays = weekData?.days.length || 5;

    for (let day = 0; day < numDays; day++) {
      if (!completedDays.includes(day)) {
        return { week: currentWeek, day };
      }
    }

    return { week: currentWeek + 1, day: 0 };
  };

  const startWorkout = async (skipWeightChecks = false) => {
    if (!user) return;

    const { week, day } = getNextWorkoutDay();

    if (!skipWeightChecks && weightTracking.initialWeight === null) {
      setShowInitialWeightModal(true);
      return;
    }

    if (!skipWeightChecks && workoutService.needsWeightCheckIn(weightTracking, week)) {
      setShowWeightCheckInModal(true);
      return;
    }

    const weekData = currentProgram.find(w => w.week === week);
    if (!weekData || !weekData.days[day]) {
      toast.warning('No more workouts available in the program!');
      return;
    }

    const dayData = weekData.days[day];

    const exercisesPromises = dayData.exercises.map(async (ex, idx) => {
      const lastPerformance = await workoutService.getLastExercisePerformance(user.id, ex.name);

      return {
        id: `${Date.now()}_${idx}`,
        name: ex.name,
        workingSets: ex.workingSets,
        targetReps: ex.reps,
        targetRPE: ex.lastSetRPE,
        rest: ex.rest,
        notes: ex.notes,
        sets: Array.from({ length: ex.workingSets }, (_, i) => ({
          setNumber: i + 1,
          reps: lastPerformance ? lastPerformance.reps : 0,
          weight: lastPerformance ? lastPerformance.weight : 0,
          rpe: 0,
          completed: false,
        })),
        completed: false,
        lastPerformance,
      };
    });

    const exercises = await Promise.all(exercisesPromises);

    setWorkoutSession({
      week,
      day,
      dayName: dayData.name,
      exercises,
      startTime: new Date(),
      isActive: true,
    });
    setActiveWorkoutTab('workout');
  };

  const handleInitialWeightSubmit = async () => {
    if (!user) return;

    const initial = parseFloat(tempInitialWeight);
    const goal = parseFloat(tempGoalWeight);

    if (isNaN(initial) || isNaN(goal) || initial <= 0 || goal <= 0) {
      toast.error('Please enter valid weight values');
      return;
    }

    await workoutService.setInitialWeightGoal(user.id, initial, goal);
    const updated = await workoutService.getWeightTracking(user.id);
    setWeightTracking(updated);

    setShowInitialWeightModal(false);
    setTempInitialWeight('');
    setTempGoalWeight('');

    startWorkout(true);
  };

  const handleWeightCheckInSubmit = async () => {
    if (!user) return;

    const current = parseFloat(tempCurrentWeight);

    if (isNaN(current) || current <= 0) {
      toast.error('Please enter a valid weight value');
      return;
    }

    const { week } = getNextWorkoutDay();
    await workoutService.addWeightCheckIn(user.id, week, current);
    const updated = await workoutService.getWeightTracking(user.id);
    setWeightTracking(updated);

    setShowWeightCheckInModal(false);
    setTempCurrentWeight('');

    startWorkout(true);
  };

  const endWorkout = async () => {
    if (!user) return;

    const { week, day, exercises, startTime } = workoutSession;
    const completedExercises = exercises.filter(ex => ex.completed && !ex.skipped);
    const allExercisesCompleted = exercises.length > 0 && exercises.every(ex => ex.completed);

    if (allExercisesCompleted && startTime) {
      const endTime = new Date();
      const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

      const exercisesData = completedExercises.map(ex => {
        const completedSets = ex.sets.filter(s => s.completed);
        const avgWeight = completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length;
        const avgReps = Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length);
        return {
          name: ex.name,
          sets: completedSets.length,
          reps: avgReps,
          weight: Math.round(avgWeight),
        };
      });

      // Find PRs: exercises where best set weight > previous logged weight
      const prsSet = completedExercises
        .filter(ex => {
          const bestSet = ex.sets
            .filter(s => s.completed && s.weight > 0)
            .reduce((best, s) => s.weight > best.weight ? s : best, { weight: 0 } as { weight: number });
          return ex.lastPerformance && bestSet.weight > ex.lastPerformance.weight;
        })
        .map(ex => ex.name);

      // Total volume
      const totalVolumeLbs = completedExercises.reduce((total, ex) => {
        return total + ex.sets.filter(s => s.completed).reduce((s, set) => s + set.weight * set.reps, 0);
      }, 0);

      const totalSets = completedExercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);

      await workoutService.saveWorkoutSession(
        user.id, week, day, workoutSession.dayName,
        exercisesData, startTime, endTime, sessionNotes, sessionRating || undefined
      );
      setSessionNotes('');
      setSessionRating(0);

      let newProgression = { ...progression };
      if (!newProgression.completedDays.includes(day)) {
        newProgression.completedDays = [...newProgression.completedDays, day].sort();
      }
      const weekData = currentProgram.find(w => w.week === week);
      const numDays = weekData?.days.length || 5;
      if (newProgression.completedDays.length === numDays) {
        newProgression.currentWeek += 1;
        newProgression.completedDays = [];
      }
      await saveProgression(newProgression);

      const levelUpResult = await xpService.awardWorkoutXP(user.id);
      const unlockedAchievements = await achievementsService.checkAndUnlockAchievements(user.id);

      // Stash level-up + achievements — show AFTER summary modal is dismissed
      let pendingLevelUp: { previousLevel: number; newLevel: number } | null = null;
      if (levelUpResult.leveledUp) {
        pendingLevelUp = { previousLevel: levelUpResult.previousLevel, newLevel: levelUpResult.newLevel };
      } else {
        const achievementLevelUp = unlockedAchievements.find(a => a.levelUp);
        if (achievementLevelUp?.levelUp) {
          pendingLevelUp = {
            previousLevel: achievementLevelUp.levelUp.previousLevel,
            newLevel: achievementLevelUp.levelUp.newLevel,
          };
        }
      }

      // Show summary modal + confetti
      setWorkoutSummary({
        dayName: workoutSession.dayName,
        durationSeconds,
        totalVolumeLbs,
        exerciseCount: completedExercises.length,
        totalSets,
        prsSet,
        xpEarned: 50,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);

      // Queue level-up + achievements to show after summary is dismissed
      if (pendingLevelUp) setLevelUpData(pendingLevelUp);
      if (unlockedAchievements.length > 0) setNewAchievements(unlockedAchievements);
    }

    setWorkoutSession({
      week: 1, day: 0, dayName: '', exercises: [], startTime: null, isActive: false,
    });
    setActiveWorkoutTab('dashboard');
  };

  const toggleSetComplete = (exerciseId: string, setNumber: number) => {
    // Trigger rest timer when marking a set done (not when un-marking), if enabled
    const restTimerEnabled = localStorage.getItem('restTimerEnabled') !== 'false';
    const exercise = workoutSession.exercises.find(ex => ex.id === exerciseId);
    const currentSet = exercise?.sets.find(s => s.setNumber === setNumber);
    if (restTimerEnabled && exercise && currentSet && !currentSet.completed) {
      const duration = parseRestDuration(exercise.rest);
      setRestTimer({ active: true, duration, exerciseName: exercise.name });
    }

    setWorkoutSession({
      ...workoutSession,
      exercises: workoutSession.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map(set =>
            set.setNumber === setNumber ? { ...set, completed: !set.completed } : set
          );
          const allSetsCompleted = updatedSets.every(s => s.completed);
          return { ...ex, sets: updatedSets, completed: allSetsCompleted };
        }
        return ex;
      }),
    });
  };

  const updateSet = (exerciseId: string, setNumber: number, field: 'reps' | 'weight' | 'rpe', value: number) => {
    setWorkoutSession({
      ...workoutSession,
      exercises: workoutSession.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map(set =>
            set.setNumber === setNumber ? { ...set, [field]: value } : set
          );
          return { ...ex, sets: updatedSets };
        }
        return ex;
      }),
    });
  };

  const savePersonalNote = (exerciseName: string, note: string) => {
    const updated = { ...personalNotes, [exerciseName]: note };
    if (!note.trim()) delete updated[exerciseName];
    setPersonalNotes(updated);
    localStorage.setItem('personalExerciseNotes', JSON.stringify(updated));
    setEditingNoteFor(null);
  };

  const skipExercise = (exerciseId: string) => {
    setWorkoutSession(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, skipped: !ex.skipped, completed: !ex.skipped } : ex
      ),
    }));
  };

  const currentWeekData = useMemo(() => {
    const weekData = currentProgram.find(w => w.week === progression.currentWeek);
    const numDays = weekData?.days.length || 5;
    const weeklyProgress = (progression.completedDays.length / numDays) * 100;
    return { weekData, numDays, weeklyProgress };
  }, [currentProgram, progression.currentWeek, progression.completedDays.length]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedExercises = workoutSession.exercises.filter(ex => ex.completed).length;
  const totalExercises = workoutSession.exercises.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const workoutTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'workout', label: 'Workout', icon: '💪' },
  ];

  return (
    <TierBackgroundWrapper>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6"
      >
        {/* Persistent header strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-xs mb-1">Streak</p>
            <p className={`text-xl font-bold ${currentStreak > 0 ? 'text-orange-400' : 'text-white/40'}`}>
              {currentStreak > 0 ? `${currentStreak}🔥` : '—'}
            </p>
            <p className="text-white/30 text-xs">days</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-xs mb-1">Week {progression.currentWeek}</p>
            <p className="text-white text-xl font-bold">{progression.completedDays.length}/{currentWeekData.numDays}</p>
            <p className="text-white/40 text-xs">days done</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
            <p className="text-white/50 text-xs mb-1">Session</p>
            {workoutSession.isActive ? (
              <>
                <p className="text-amber-400 text-xl font-bold font-mono">{formatElapsed(elapsedSeconds)}</p>
                <p className="text-white/40 text-xs">{completedExercises}/{totalExercises} done</p>
              </>
            ) : (
              <p className="text-white/40 text-sm pt-2">Idle</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={workoutTabs}
          activeTab={activeWorkoutTab}
          onChange={setActiveWorkoutTab}
          className="mb-4"
        />

        {/* Dashboard Tab */}
        {activeWorkoutTab === 'dashboard' && (
          <motion.div variants={cardVariants} className="space-y-4">
            <GlassCard>
              <h3 className="text-white text-base sm:text-lg font-bold mb-4">This Week's Progress</h3>
              <div className={`grid ${
                currentWeekData.numDays === 3
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : currentWeekData.numDays === 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              } gap-2 sm:gap-3`}>
                {currentWeekData.weekData?.days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2 sm:p-4 rounded-xl border-2 text-center transition-all ${
                      progression.completedDays.includes(idx)
                        ? 'bg-green-500/20 border-green-400 text-green-300'
                        : 'bg-white/5 border-white/20 text-white/60'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-semibold truncate">{day.name}</p>
                    <p className="text-xs mt-1">Day {idx + 1}</p>
                    {progression.completedDays.includes(idx) && (
                      <p className="text-xl sm:text-2xl mt-1 sm:mt-2">✓</p>
                    )}
                  </div>
                ))}
              </div>

              {weightTracking.initialWeight && weightTracking.goalWeight && (
                <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                  <div className="flex-1 text-center bg-white/5 rounded-xl p-3">
                    <p className="text-white/50 text-xs mb-1">Current Weight</p>
                    <p className="text-white font-bold">
                      {weightTracking.checkIns.length > 0
                        ? weightTracking.checkIns[weightTracking.checkIns.length - 1].weight
                        : weightTracking.initialWeight} lbs
                    </p>
                  </div>
                  <div className="flex-1 text-center bg-white/5 rounded-xl p-3">
                    <p className="text-white/50 text-xs mb-1">Goal Weight</p>
                    <p className="text-amber-400 font-bold">{weightTracking.goalWeight} lbs</p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Next Workout Preview */}
            {(() => {
              const { week, day } = getNextWorkoutDay();
              const nextWeekData = currentProgram.find(w => w.week === week);
              const nextDay = nextWeekData?.days[day];
              if (!nextDay) return null;
              return (
                <GlassCard>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Next Up</p>
                      <h3 className="text-white font-bold text-base">{nextDay.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">Week {week} · Day {day + 1}</p>
                    </div>
                    <span className="text-2xl">💪</span>
                  </div>
                  <div className="space-y-1.5">
                    {nextDay.exercises.slice(0, 4).map((ex, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5">
                        <span className="text-white/80 text-sm">{ex.name}</span>
                        <span className="text-amber-400/80 text-xs">{ex.workingSets} × {ex.reps}</span>
                      </div>
                    ))}
                    {nextDay.exercises.length > 4 && (
                      <p className="text-white/30 text-xs px-1">+{nextDay.exercises.length - 4} more exercises</p>
                    )}
                  </div>
                </GlassCard>
              );
            })()}
          </motion.div>
        )}

        {/* Workout Tab */}
        {activeWorkoutTab === 'workout' && (
          <motion.div variants={cardVariants}>
            <GlassCard>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white text-2xl font-bold">
                      {workoutSession.isActive ? workoutSession.dayName : 'Start Your Workout'}
                    </h2>
                    {workoutSession.isActive && (
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-white/60 text-sm">
                          Week {workoutSession.week} · Day {workoutSession.day + 1}
                        </p>
                        <span className="text-amber-400 text-sm font-mono font-semibold">
                          ⏱ {formatElapsed(elapsedSeconds)}
                        </span>
                      </div>
                    )}
                  </div>
                  {workoutSession.isActive ? (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPlateCalc(true)}
                          title="Plate Calculator"
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all"
                        >
                          🏋️
                        </button>
                        <Button
                          variant="secondary"
                          onClick={endWorkout}
                          disabled={workoutSession.exercises.length === 0 || !workoutSession.exercises.every(ex => ex.completed)}
                        >
                          End Workout
                        </Button>
                      </div>
                      {workoutSession.exercises.length > 0 && !workoutSession.exercises.every(ex => ex.completed) && (
                        <p className="text-amber-400 text-xs">Complete all exercises to finish</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPlateCalc(true)}
                        title="Plate Calculator"
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all"
                      >
                        🏋️
                      </button>
                      <Button variant="primary" onClick={startWorkout}>
                        Start Workout
                      </Button>
                    </div>
                  )}
                </div>

                {workoutSession.isActive && (
                  <div className="space-y-4">
                    {workoutSession.exercises.map((exercise) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`rounded-2xl p-4 border-2 transition-all ${
                          exercise.skipped
                            ? 'bg-white/3 border-white/10 opacity-60'
                            : exercise.completed
                            ? 'bg-green-500/10 border-green-400/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white text-lg font-semibold">{exercise.name}</h3>
                              {exercise.lastPerformance && (
                                <p className="text-emerald-400/80 text-xs mt-1">
                                  Last: {exercise.lastPerformance.sets} sets × {exercise.lastPerformance.reps} reps @ {displayWeight(exercise.lastPerformance.weight)} {unitLabel}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3 mt-2 text-sm">
                                <span className="text-white/60">
                                  {exercise.workingSets} sets × {exercise.targetReps} reps
                                </span>
                                <span className="text-amber-400 font-semibold">RPE {exercise.targetRPE}</span>
                                <span className="text-white/50">Rest: {exercise.rest}</span>
                              </div>
                              {exercise.notes && (
                                <button
                                  onClick={() => setExpandedNotes(prev => {
                                    const next = new Set(prev);
                                    next.has(exercise.id) ? next.delete(exercise.id) : next.add(exercise.id);
                                    return next;
                                  })}
                                  className="mt-2 flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors text-xs"
                                >
                                  <span>{expandedNotes.has(exercise.id) ? '▾' : '▸'}</span>
                                  <span>Technique cues</span>
                                </button>
                              )}
                              {exercise.notes && expandedNotes.has(exercise.id) && (
                                <div className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                                  <p className="text-amber-200/70 text-xs leading-relaxed">{exercise.notes}</p>
                                </div>
                              )}
                              {/* Personal note */}
                              {editingNoteFor === exercise.id ? (
                                <div className="mt-2 space-y-1.5">
                                  <textarea
                                    autoFocus
                                    value={noteEditValue}
                                    onChange={e => setNoteEditValue(e.target.value)}
                                    placeholder="Your personal cue for this exercise..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/15 focus:border-blue-500/40 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none resize-none"
                                  />
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => savePersonalNote(exercise.name, noteEditValue)}
                                      className="flex-1 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition-all"
                                    >Save</button>
                                    <button
                                      onClick={() => setEditingNoteFor(null)}
                                      className="px-3 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 text-xs hover:bg-white/10 transition-all"
                                    >Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1.5">
                                  {personalNotes[exercise.name] ? (
                                    <button
                                      onClick={() => { setEditingNoteFor(exercise.id); setNoteEditValue(personalNotes[exercise.name]); }}
                                      className="text-left w-full text-blue-300/70 text-xs hover:text-blue-300 transition-colors"
                                    >
                                      📝 {personalNotes[exercise.name]}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => { setEditingNoteFor(exercise.id); setNoteEditValue(''); }}
                                      className="text-white/20 hover:text-white/50 text-xs transition-colors"
                                    >
                                      + Add your cue
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 ml-2">
                              {exercise.completed && !exercise.skipped && (
                                <span className="text-green-400 text-2xl">✓</span>
                              )}
                              {exercise.skipped && (
                                <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">Skipped</span>
                              )}
                              <button
                                onClick={() => skipExercise(exercise.id)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all active:scale-95 ${
                                  exercise.skipped
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white/60'
                                }`}
                              >
                                {exercise.skipped ? 'Undo' : 'Skip'}
                              </button>
                            </div>
                          </div>

                          {!exercise.skipped && <div className="space-y-2">
                            {exercise.sets.map((set) => (
                              <div
                                key={set.setNumber}
                                className={`rounded-xl border transition-all ${
                                  set.completed
                                    ? 'bg-green-500/10 border-green-400/40'
                                    : 'bg-white/5 border-white/10'
                                }`}
                              >
                                {/* Main row: Set / Reps / Weight / Done */}
                                <div className="grid grid-cols-4 gap-2 items-center p-3">
                                  <div className="text-white/50 text-xs font-semibold text-center">
                                    SET {set.setNumber}
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      placeholder="Reps"
                                      value={set.reps || ''}
                                      onChange={(e) =>
                                        updateSet(exercise.id, set.setNumber, 'reps', parseInt(e.target.value) || 0)
                                      }
                                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-amber-400 transition-all"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      placeholder={unitLabel}
                                      value={set.weight ? displayWeight(set.weight) : ''}
                                      onChange={(e) =>
                                        updateSet(exercise.id, set.setNumber, 'weight', toLbs(parseFloat(e.target.value) || 0))
                                      }
                                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-amber-400 transition-all"
                                    />
                                  </div>
                                  <button
                                    onClick={() => toggleSetComplete(exercise.id, set.setNumber)}
                                    className={`py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                                      set.completed
                                        ? 'bg-green-500/30 text-green-300 border-2 border-green-400/50'
                                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-2 border-amber-500/30'
                                    }`}
                                  >
                                    {set.completed ? '✓' : 'Done'}
                                  </button>
                                </div>

                                {/* Quick-increment row */}
                                <div className="grid grid-cols-4 gap-2 px-3 pb-2">
                                  <div />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => updateSet(exercise.id, set.setNumber, 'reps', Math.max(0, (set.reps || 0) - 1))}
                                      className="flex-1 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-xs font-bold transition-all active:scale-95"
                                    >−1</button>
                                    <button
                                      onClick={() => updateSet(exercise.id, set.setNumber, 'reps', (set.reps || 0) + 1)}
                                      className="flex-1 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-xs font-bold transition-all active:scale-95"
                                    >+1</button>
                                  </div>
                                  <div className="flex gap-1">
                                    {weightIncrements.map(inc => (
                                      <button
                                        key={inc}
                                        onClick={() => updateSet(exercise.id, set.setNumber, 'weight', Math.round((set.weight || 0) * 10) / 10 + toLbs(inc))}
                                        className="flex-1 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-bold transition-all active:scale-95"
                                      >+{inc}</button>
                                    ))}
                                  </div>
                                  <div />
                                </div>

                                {/* RPE row — always visible, subtle */}
                                <div className="px-3 pb-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-white/25 text-[10px] uppercase tracking-wide flex-shrink-0">RPE</span>
                                    <div className="flex gap-1 flex-1">
                                      {[6,7,8,9,10].map(r => (
                                        <button
                                          key={r}
                                          onClick={() => updateSet(
                                            exercise.id,
                                            set.setNumber,
                                            'rpe',
                                            set.rpe === r ? 0 : r
                                          )}
                                          className={`flex-1 py-1 rounded text-xs font-bold transition-all active:scale-95 ${
                                            set.rpe === r
                                              ? r >= 9
                                                ? 'bg-red-500/70 text-white border border-red-400/60'
                                                : r >= 7
                                                ? 'bg-amber-500/70 text-white border border-amber-400/60'
                                                : 'bg-green-600/70 text-white border border-green-400/60'
                                              : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white/60'
                                          }`}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                    {set.rpe > 0 && set.completed && (
                                      <span className={`text-xs font-bold flex-shrink-0 ${
                                        set.rpe >= 9 ? 'text-red-400' : set.rpe >= 7 ? 'text-amber-400' : 'text-green-400'
                                      }`}>
                                        @{set.rpe}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Session notes + rating — shown only during active workout */}
                {workoutSession.isActive && (
                  <div className="mt-4 space-y-3">
                    {/* Effort rating */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Session Feel</label>
                      <div className="flex gap-2">
                        {[
                          { val: 1, emoji: '😴', label: 'Easy' },
                          { val: 2, emoji: '🙂', label: 'Good' },
                          { val: 3, emoji: '💪', label: 'Solid' },
                          { val: 4, emoji: '🔥', label: 'Great' },
                          { val: 5, emoji: '⚡', label: 'PR Day' },
                        ].map(({ val, emoji, label }) => (
                          <button
                            key={val}
                            onClick={() => setSessionRating(sessionRating === val ? 0 : val)}
                            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
                              sessionRating === val
                                ? 'bg-amber-500/20 border-2 border-amber-400/60'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-lg">{emoji}</span>
                            <span className="text-white/50 text-[9px]">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Notes textarea */}
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Session Notes</label>
                      <textarea
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        placeholder="Form cues, PRs hit, how you felt..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none resize-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {!workoutSession.isActive && (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-6xl">💪</div>
                    <p className="text-white text-xl font-semibold">
                      {progression.completedDays.length === currentWeekData.numDays
                        ? `Ready for Week ${progression.currentWeek + 1}?`
                        : `Next: ${
                            currentWeekData.weekData?.days[getNextWorkoutDay().day]?.name || 'Loading...'
                          }`
                      }
                    </p>
                    <p className="text-white/60">Click "Start Workout" to begin</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showInitialWeightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <GlassCard>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowInitialWeightModal(false);
                      setTempInitialWeight('');
                      setTempGoalWeight('');
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold transition-all hover:scale-110"
                    aria-label="Close weight goals modal"
                  >
                    ×
                  </button>
                  <h3 className="text-white text-xl font-bold mb-4">Set Your Weight Goals</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Before starting your first workout, let's track your progress toward your goals.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm block mb-2">Current Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempInitialWeight}
                      onChange={(e) => setTempInitialWeight(e.target.value)}
                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all"
                      placeholder="Enter your current weight"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm block mb-2">Goal Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempGoalWeight}
                      onChange={(e) => setTempGoalWeight(e.target.value)}
                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all"
                      placeholder="Enter your goal weight"
                    />
                  </div>

                  <Button variant="primary" onClick={handleInitialWeightSubmit} className="w-full mt-6">
                    Start Workout
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWeightCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <GlassCard>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowWeightCheckInModal(false);
                      setTempCurrentWeight('');
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold transition-all hover:scale-110"
                    aria-label="Close weight check-in modal"
                  >
                    ×
                  </button>
                  <h3 className="text-white text-xl font-bold mb-4">Weight Check-In</h3>
                  <p className="text-white/60 text-sm mb-6">
                    It's been 4 weeks! Let's track your progress.
                  </p>
                </div>

                {weightTracking.initialWeight && weightTracking.goalWeight && (
                  <div className="bg-amber-950/30 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Starting Weight:</span>
                      <span className="text-white font-semibold">{weightTracking.initialWeight} lbs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Goal Weight:</span>
                      <span className="text-amber-400 font-semibold">{weightTracking.goalWeight} lbs</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm block mb-2">Current Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempCurrentWeight}
                      onChange={(e) => setTempCurrentWeight(e.target.value)}
                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all"
                      placeholder="Enter your current weight"
                      autoFocus
                    />
                  </div>

                  <Button variant="primary" onClick={handleWeightCheckInSubmit} className="w-full mt-6">
                    Continue to Workout
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plate Calculator */}
      <AnimatePresence>
        {showPlateCalc && <PlateCalculator onClose={() => setShowPlateCalc(false)} />}
      </AnimatePresence>

      {/* Confetti burst */}
      <Confetti active={showConfetti} />

      {/* Workout Completion Summary Modal */}
      <AnimatePresence>
        {workoutSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[58] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="w-full max-w-sm"
            >
              <div className="bg-[#0d1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 px-6 pt-8 pb-6 text-center border-b border-white/10">
                  <div className="text-5xl mb-3">🎉</div>
                  <h2 className="text-white text-2xl font-bold">Workout Complete!</h2>
                  <p className="text-amber-400/80 text-sm mt-1">{workoutSummary.dayName}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/10">
                  {[
                    {
                      label: 'Duration',
                      value: (() => {
                        const m = Math.floor(workoutSummary.durationSeconds / 60);
                        const s = workoutSummary.durationSeconds % 60;
                        return m > 0 ? `${m}m ${s}s` : `${s}s`;
                      })(),
                      icon: '⏱',
                      color: 'text-amber-400',
                    },
                    {
                      label: 'Volume',
                      value: workoutSummary.totalVolumeLbs >= 1000
                        ? `${(workoutSummary.totalVolumeLbs / 1000).toFixed(1)}k lbs`
                        : `${workoutSummary.totalVolumeLbs} lbs`,
                      icon: '📦',
                      color: 'text-blue-400',
                    },
                    {
                      label: 'Sets Done',
                      value: `${workoutSummary.totalSets}`,
                      icon: '✅',
                      color: 'text-green-400',
                    },
                    {
                      label: 'XP Earned',
                      value: `+${workoutSummary.xpEarned}`,
                      icon: '⚡',
                      color: 'text-purple-400',
                    },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-[#0d1117] px-5 py-4 text-center">
                      <p className="text-white/30 text-xs mb-1">{icon} {label}</p>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* PRs */}
                {workoutSummary.prsSet.length > 0 && (
                  <div className="px-6 py-4 border-b border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      🏆 Personal Records Set
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workoutSummary.prsSet.map(name => (
                        <span key={name} className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full font-semibold">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="px-6 py-5">
                  <button
                    onClick={() => setWorkoutSummary(null)}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
                    style={{ backgroundColor: '#1f6feb', boxShadow: '0 0 20px rgba(31,111,235,0.35)' }}
                  >
                    Keep Going 💪
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimer.active && (
          <RestTimer
            key="rest-timer"
            duration={restTimer.duration}
            exerciseName={restTimer.exerciseName}
            onComplete={() => setRestTimer(r => ({ ...r, active: false }))}
            onSkip={() => setRestTimer(r => ({ ...r, active: false }))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setLevelUpData(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-amber-950/40 via-black/40 to-orange-950/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-amber-400/50 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-xl"
                  />
                </div>

                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                    className="text-8xl mb-4"
                  >
                    🎉
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent"
                  >
                    LEVEL UP!
                  </motion.h2>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="flex items-center justify-center gap-4 my-6"
                  >
                    <span className="text-5xl font-bold text-amber-300">{levelUpData.previousLevel}</span>
                    <span className="text-3xl text-amber-400">→</span>
                    <span className="text-6xl font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                      {levelUpData.newLevel}
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-amber-100/80 text-lg mb-6"
                  >
                    You've reached level {levelUpData.newLevel}!
                  </motion.p>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button variant="primary" onClick={() => setLevelUpData(null)} className="px-8">
                      Continue
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newAchievements.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {newAchievements.map((achievementData, index) => (
              <motion.div
                key={achievementData.achievement.id}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ delay: index * 0.2, type: 'spring' }}
                className="bg-gradient-to-r from-amber-950/95 via-orange-950/95 to-amber-950/95 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-400/50 shadow-2xl"
                onClick={() => setNewAchievements((prev) => prev.filter((_, i) => i !== index))}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{achievementData.achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-amber-400 font-bold text-sm">Achievement Unlocked!</h3>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                        +{achievementData.xpAwarded} XP
                      </span>
                    </div>
                    <p className="text-white font-semibold text-base mb-1">{achievementData.achievement.name}</p>
                    <p className="text-amber-100/70 text-xs">{achievementData.achievement.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewAchievements((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="text-amber-400/60 hover:text-amber-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </TierBackgroundWrapper>
  );
};

export default GymTracker;
