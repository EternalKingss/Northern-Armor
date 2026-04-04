import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, TierBackgroundWrapper } from '../components';
import ProgressChart from '../components/ProgressChart';
import { useAuth } from '../contexts/AuthContext';
import { useProgram } from '../contexts/ProgramContext';
import { useUnit } from '../contexts/UnitContext';
import { workoutService, WeightTracking } from '../services/workoutService';
import { WORKOUT_PROGRAM, WeekPlan } from '../data/workoutProgram';
import { HYBRID_PROGRAM } from '../data/hybridProgram';
import { programService } from '../services/programService';
import { aiWorkoutService, GeneratedWorkoutPlan, StoredCustomWorkout } from '../services/aiWorkoutService';

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

interface WorkoutHistory {
  date: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

type TabId = 'strength' | 'bodyweight' | 'records' | 'volume' | 'muscles' | 'history';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'strength', label: 'Strength', icon: '🏋️' },
  { id: 'bodyweight', label: 'Weight', icon: '⚖️' },
  { id: 'records', label: 'PRs', icon: '🏆' },
  { id: 'volume', label: 'Volume', icon: '📆' },
  { id: 'muscles', label: 'Muscles', icon: '💪' },
  { id: 'history', label: 'History', icon: '📅' },
];

// Keyword → muscle group mapping
const MUSCLE_KEYWORDS: { group: string; color: string; keywords: string[] }[] = [
  { group: 'Chest',     color: '#ef4444', keywords: ['press', 'fly', 'crossover', 'pec', 'bench', 'dip', 'push-up', 'pushup', 'incline'] },
  { group: 'Back',      color: '#3b82f6', keywords: ['row', 'pull', 'deadlift', 'lat', 'pulldown', 'chin', 'rack pull', 'shrug', 'pendlay'] },
  { group: 'Shoulders', color: '#a855f7', keywords: ['lateral', 'shoulder', 'delt', 'overhead', 'press', 'upright', 'face pull', 'arnold'] },
  { group: 'Biceps',    color: '#22c55e', keywords: ['curl', 'bicep', 'hammer', 'bayesian', 'preacher', 'concentration'] },
  { group: 'Triceps',   color: '#f97316', keywords: ['tricep', 'extension', 'pushdown', 'skull', 'dip', 'close grip', 'kickback'] },
  { group: 'Legs',      color: '#f59e0b', keywords: ['squat', 'leg', 'lunge', 'rdl', 'romanian', 'step-up', 'hack', 'quad', 'hamstring', 'calf', 'leg press', 'leg curl', 'leg extension', 'goblet', 'bulgarian'] },
  { group: 'Glutes',    color: '#ec4899', keywords: ['hip thrust', 'glute', 'bridge', 'rdl', 'romanian', 'kickback', 'abduction'] },
  { group: 'Core',      color: '#14b8a6', keywords: ['plank', 'crunch', 'sit-up', 'ab ', 'core', 'oblique', 'cable crunch', 'hanging'] },
];

function classifyExercise(name: string): string[] {
  const lower = name.toLowerCase();
  const groups = new Set<string>();
  for (const { group, keywords } of MUSCLE_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) groups.add(group);
  }
  // Chest presses also hit triceps
  if (groups.has('Chest') && !groups.has('Triceps')) groups.add('Triceps');
  // Rows also hit biceps
  if (groups.has('Back') && !groups.has('Biceps')) groups.add('Biceps');
  return Array.from(groups);
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Progress: React.FC = () => {
  const { user } = useAuth();
  const { selectedProgram } = useProgram();
  const { display: displayWeight, label: unitLabel } = useUnit();
  const [activeTab, setActiveTab] = useState<TabId>('strength');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weightTracking, setWeightTracking] = useState<WeightTracking>({
    initialWeight: null,
    goalWeight: null,
    checkIns: [],
  });
  const [customWorkoutData, setCustomWorkoutData] = useState<StoredCustomWorkout | null>(null);

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

  const currentProgram = useMemo(() => {
    if (programService.isCustomProgram(selectedProgram) && customWorkoutData) {
      return convertCustomWorkoutToWeekPlan(customWorkoutData.workoutPlan);
    }
    return selectedProgram === 'hybrid' ? HYBRID_PROGRAM : WORKOUT_PROGRAM;
  }, [selectedProgram, customWorkoutData]);

  const trackedExercises = useMemo((): string[] => {
    const exercises = new Set<string>();
    currentProgram.forEach(week => {
      week.days.forEach(day => {
        day.exercises.forEach(ex => exercises.add(ex.name));
      });
    });
    return Array.from(exercises).sort();
  }, [currentProgram]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const history = await workoutService.getWorkoutHistory(user.id);
      if (!cancelled) setWorkoutHistory(history || []);
      const weight = await workoutService.getWeightTracking(user.id);
      if (!cancelled) setWeightTracking(weight);
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (trackedExercises.length > 0 && !trackedExercises.includes(selectedExercise)) {
      setSelectedExercise(trackedExercises[0]);
    }
  }, [selectedProgram, trackedExercises, selectedExercise]);

  const getProgressData = (exerciseName: string) =>
    workoutHistory
      .map(workout => {
        const ex = workout.exercises.find(e => e.name === exerciseName);
        if (!ex) return null;
        return {
          date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: ex.weight,
        };
      })
      .filter(Boolean) as { date: string; weight: number }[];

  const getExerciseStats = (exerciseName: string) => {
    const data = getProgressData(exerciseName);
    if (data.length === 0) return { current: 0, max: 0, gain: 0, sessions: 0, estOneRM: 0 };
    const current = data[data.length - 1].weight;
    const max = Math.max(...data.map(d => d.weight));
    const gain = current - data[0].weight;

    // Epley 1RM estimate using best logged set (weight × (1 + reps/30))
    // Find the session with the highest weight for this exercise to get reps
    const bestSession = workoutHistory
      .map(w => ({ ex: w.exercises.find(e => e.name === exerciseName), date: w.date }))
      .filter(r => r.ex && r.ex.weight === max)
      .pop();
    const bestReps = bestSession?.ex?.reps ?? 8;
    const estOneRM = bestReps === 1 ? max : Math.round(max * (1 + bestReps / 30));

    return { current, max, gain, sessions: data.length, estOneRM };
  };

  // Summary stats
  const totalSessions = workoutHistory.length;
  const thisWeekSessions = workoutHistory.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }).length;
  const allPRs = trackedExercises.filter(ex => {
    const data = getProgressData(ex);
    return data.length > 1 && data[data.length - 1].weight > data[0].weight;
  }).length;

  const stats = getExerciseStats(selectedExercise);
  const progressData = getProgressData(selectedExercise);

  // ── Personal Records ─────────────────────────────────────────────────────
  const personalRecords = useMemo(() => {
    return trackedExercises.map(exName => {
      const data = getProgressData(exName);
      if (data.length === 0) return null;
      const prEntry = data.reduce((best, d) => d.weight > best.weight ? d : best, data[0]);
      // Get reps for the PR session
      const prSession = workoutHistory.find(w => {
        const ex = w.exercises.find(e => e.name === exName);
        return ex && ex.weight === prEntry.weight;
      });
      const prReps = prSession?.exercises.find(e => e.name === exName)?.reps ?? 0;
      const estOneRM = prReps <= 1 ? prEntry.weight : Math.round(prEntry.weight * (1 + prReps / 30));
      const isRecent = data.length > 1 && data[data.length - 1].weight === prEntry.weight;
      return {
        name: exName,
        weight: prEntry.weight,
        reps: prReps,
        date: prEntry.date,
        estOneRM,
        sessions: data.length,
        isRecent,
      };
    }).filter(Boolean).sort((a, b) => b!.weight - a!.weight) as {
      name: string; weight: number; reps: number; date: string;
      estOneRM: number; sessions: number; isRecent: boolean;
    }[];
  }, [trackedExercises, workoutHistory]);

  // ── Volume Heatmap ────────────────────────────────────────────────────────
  const volumeHeatmap = useMemo(() => {
    // Build a map: dateKey (YYYY-MM-DD) → total volume (lbs)
    const map: Record<string, number> = {};
    workoutHistory.forEach(w => {
      const key = w.date.split('T')[0];
      const vol = w.exercises.reduce((s, ex) => s + ex.weight * ex.sets * ex.reps, 0);
      map[key] = (map[key] ?? 0) + vol;
    });

    // Generate last 16 weeks of days (Mon–Sun)
    const today = new Date();
    // Move to nearest Sunday end-of-week
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - today.getDay()));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 16 * 7 + 1);

    const weeks: { date: string; vol: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; vol: number; dayOfWeek: number }[] = [];

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const key = cur.toISOString().split('T')[0];
      const dow = cur.getDay(); // 0=Sun
      currentWeek.push({ date: key, vol: map[key] ?? 0, dayOfWeek: dow });
      if (dow === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    const maxVol = Math.max(...Object.values(map), 1);
    return { weeks, maxVol, map };
  }, [workoutHistory]);

  // Weekly volume bar data (last 12 weeks)
  const weeklyVolumeData = useMemo(() => {
    const buckets: Record<string, number> = {};
    workoutHistory.forEach(w => {
      const d = new Date(w.date);
      // ISO week label: "Mon DD"
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const vol = w.exercises.reduce((s, ex) => s + ex.weight * ex.sets * ex.reps, 0);
      buckets[label] = (buckets[label] ?? 0) + vol;
    });
    return Object.entries(buckets)
      .slice(-12)
      .map(([date, volume]) => ({ date, volume: Math.round(volume / 1000) }));
  }, [workoutHistory]);

  // Muscle group data — last 14 days volume + last trained date
  const muscleData = useMemo(() => {
    const now = Date.now();
    const MS_14 = 14 * 24 * 60 * 60 * 1000;
    const recent = workoutHistory.filter(w => now - new Date(w.date).getTime() < MS_14);

    const stats: Record<string, { volume: number; lastDate: Date | null }> = {};
    for (const { group } of MUSCLE_KEYWORDS) stats[group] = { volume: 0, lastDate: null };

    recent.forEach(w => {
      const d = new Date(w.date);
      w.exercises.forEach(ex => {
        const groups = classifyExercise(ex.name);
        groups.forEach(g => {
          if (!stats[g]) return;
          stats[g].volume += ex.weight * ex.sets * ex.reps;
          if (!stats[g].lastDate || d > stats[g].lastDate!) stats[g].lastDate = d;
        });
      });
    });

    const maxVol = Math.max(...Object.values(stats).map(s => s.volume), 1);

    return MUSCLE_KEYWORDS.map(({ group, color }) => {
      const { volume, lastDate } = stats[group];
      const daysSince = lastDate
        ? Math.floor((now - lastDate.getTime()) / (24 * 60 * 60 * 1000))
        : null;
      const pct = Math.round((volume / maxVol) * 100);
      const status =
        daysSince === null ? 'untrained'
        : daysSince === 0 ? 'today'
        : daysSince <= 2 ? 'fresh'
        : daysSince <= 4 ? 'recovered'
        : 'due';
      return { group, color, volume, pct, daysSince, status };
    });
  }, [workoutHistory]);

  // Weight chart data from check-ins
  const weightChartData = useMemo(() => {
    if (!weightTracking.initialWeight) return [];
    const points = [
      { date: 'Start', weight: weightTracking.initialWeight },
      ...weightTracking.checkIns.map(c => ({
        date: `Wk ${c.week}`,
        weight: c.weight,
      })),
    ];
    return points;
  }, [weightTracking]);

  return (
    <TierBackgroundWrapper>
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants}>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">Progress</h1>
          <p className="text-white/50 text-sm mt-0.5">Track your gains over time</p>
        </motion.div>

        {/* Summary strip */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: totalSessions, color: 'text-white' },
            { label: 'This Week', value: thisWeekSessions, color: 'text-amber-400' },
            { label: 'Improving', value: allPRs, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <GlassCard key={label}>
              <div className="text-center py-1">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Tab bar */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants}
          className="flex bg-white/5 rounded-2xl p-1 gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Strength Tab ─────────────────────────────────────────── */}
          {activeTab === 'strength' && (
            <motion.div key="strength"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4">

              {trackedExercises.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-10 space-y-2">
                    <div className="text-5xl">🏋️</div>
                    <p className="text-white font-semibold">No exercises tracked yet</p>
                    <p className="text-white/40 text-sm">Complete workouts to see your strength progress</p>
                  </div>
                </GlassCard>
              ) : (
                <>
                  {/* Exercise picker */}
                  <GlassCard>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Exercise</p>
                    <div className="flex flex-wrap gap-2">
                      {trackedExercises.map(ex => (
                        <button
                          key={ex}
                          onClick={() => setSelectedExercise(ex)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedExercise === ex
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Current', value: `${displayWeight(stats.current)}`, sub: unitLabel, color: 'text-white' },
                      { label: 'PR', value: `${displayWeight(stats.max)}`, sub: unitLabel, color: 'text-orange-400' },
                      { label: 'Gain', value: `${stats.gain > 0 ? '+' : ''}${displayWeight(stats.gain)}`, sub: unitLabel, color: stats.gain > 0 ? 'text-green-400' : stats.gain < 0 ? 'text-red-400' : 'text-white' },
                      { label: 'Est. 1RM', value: `${displayWeight(stats.estOneRM)}`, sub: unitLabel, color: 'text-purple-400' },
                    ].map(({ label, value, sub, color }) => (
                      <GlassCard key={label}>
                        <div className="text-center">
                          <p className="text-white/50 text-xs mb-1">{label}</p>
                          <p className={`text-lg font-bold ${color}`}>{value}</p>
                          <p className="text-white/40 text-xs">{sub}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Chart */}
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold">{selectedExercise}</h3>
                        <p className="text-white/40 text-xs">Weight over time</p>
                      </div>
                      {stats.gain !== 0 && (
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          stats.gain > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {stats.gain > 0 ? '↑' : '↓'} {displayWeight(Math.abs(stats.gain))} {unitLabel}
                        </span>
                      )}
                    </div>
                    {progressData.length > 0 ? (
                      <ProgressChart data={progressData} exerciseName={selectedExercise} />
                    ) : (
                      <div className="text-center py-10 text-white/40">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="text-sm">No data yet for {selectedExercise}</p>
                        <p className="text-xs mt-1">Complete a workout to start tracking</p>
                      </div>
                    )}
                  </GlassCard>

                  {/* Recent sessions for selected exercise */}
                  {progressData.length > 0 && (
                    <GlassCard>
                      <h3 className="text-white font-semibold mb-3 text-sm">Recent Sessions</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...progressData].reverse().slice(0, 8).map((d, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                            <span className="text-white/60 text-sm">{d.date}</span>
                            <div className="flex items-center gap-2">
                              {i === 0 && d.weight === stats.max && (
                                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">PR</span>
                              )}
                              <span className="text-white font-semibold text-sm">{displayWeight(d.weight)} {unitLabel}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Body Weight Tab ───────────────────────────────────────── */}
          {activeTab === 'bodyweight' && (
            <motion.div key="bodyweight"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4">

              {!weightTracking.initialWeight ? (
                <GlassCard>
                  <div className="text-center py-10 space-y-3">
                    <div className="text-5xl">⚖️</div>
                    <p className="text-white font-semibold text-lg">No weight data yet</p>
                    <p className="text-white/50 text-sm">Start your first workout to set your weight goals</p>
                  </div>
                </GlassCard>
              ) : (() => {
                const currentWeight = weightTracking.checkIns.length > 0
                  ? weightTracking.checkIns[weightTracking.checkIns.length - 1].weight
                  : weightTracking.initialWeight;
                const totalChange = Math.abs((weightTracking.goalWeight ?? 0) - weightTracking.initialWeight);
                const currentChange = Math.abs(currentWeight - weightTracking.initialWeight);
                const progressPercent = totalChange > 0 ? Math.min((currentChange / totalChange) * 100, 100) : 0;
                const weightDelta = currentWeight - weightTracking.initialWeight;
                const isGaining = (weightTracking.goalWeight ?? 0) > weightTracking.initialWeight;
                const onTrack = isGaining ? weightDelta >= 0 : weightDelta <= 0;

                return (
                  <>
                    {/* Weight summary */}
                    <GlassCard>
                      <h3 className="text-white font-bold mb-4">Weight Progress</h3>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'Starting', value: `${weightTracking.initialWeight}`, color: 'text-white/80' },
                          { label: 'Current', value: `${currentWeight}`, color: 'text-amber-400' },
                          { label: 'Goal', value: `${weightTracking.goalWeight ?? '—'}`, color: 'text-green-400' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center bg-white/5 rounded-xl py-3">
                            <p className="text-white/50 text-xs mb-1">{label}</p>
                            <p className={`text-xl font-bold ${color}`}>{value}</p>
                            <p className="text-white/40 text-xs">lbs</p>
                          </div>
                        ))}
                      </div>

                      {weightTracking.goalWeight && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white/60 text-sm">Progress to goal</span>
                            <span className={`text-sm font-bold ${onTrack ? 'text-green-400' : 'text-red-400'}`}>
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${onTrack ? 'bg-gradient-to-r from-amber-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className={`text-xs font-semibold ${weightDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {weightDelta >= 0 ? '+' : ''}{weightDelta.toFixed(1)} lbs from start
                            </span>
                            <span className="text-white/50 text-xs">
                              {Math.abs(weightTracking.goalWeight - currentWeight).toFixed(1)} lbs to go
                            </span>
                          </div>
                        </>
                      )}
                    </GlassCard>

                    {/* Weight chart */}
                    {weightChartData.length > 1 && (
                      <GlassCard>
                        <h3 className="text-white font-bold mb-4">Weight Over Time</h3>
                        <ProgressChart data={weightChartData} exerciseName="Body Weight" />
                      </GlassCard>
                    )}

                    {/* Check-in history */}
                    {weightTracking.checkIns.length > 0 && (
                      <GlassCard>
                        <h3 className="text-white font-semibold mb-3">Check-In History</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {[...weightTracking.checkIns].reverse().map((c, i, arr) => {
                            const prev = arr[i + 1];
                            const delta = prev ? c.weight - prev.weight : c.weight - (weightTracking.initialWeight ?? 0);
                            return (
                              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                                <div>
                                  <span className="text-white/80 text-sm font-medium">Week {c.week}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {delta !== 0 && (
                                    <span className={`text-xs font-medium ${delta > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                                    </span>
                                  )}
                                  <span className="text-white font-bold">{c.weight} lbs</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </GlassCard>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* ── Personal Records Tab ─────────────────────────────────── */}
          {activeTab === 'records' && (
            <motion.div key="records"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3">

              {personalRecords.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-10 space-y-2">
                    <div className="text-5xl">🏆</div>
                    <p className="text-white font-semibold">No records yet</p>
                    <p className="text-white/40 text-sm">Complete workouts to set personal records</p>
                  </div>
                </GlassCard>
              ) : (
                <>
                  <GlassCard>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">All-Time PRs</h3>
                      <span className="text-white/40 text-xs">{personalRecords.length} exercises</span>
                    </div>
                    <div className="space-y-2">
                      {personalRecords.map((pr, i) => (
                        <motion.div
                          key={pr.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl px-3 py-3 transition-colors"
                        >
                          {/* Rank */}
                          <div className="w-7 text-center flex-shrink-0">
                            {i === 0 ? (
                              <span className="text-lg">🥇</span>
                            ) : i === 1 ? (
                              <span className="text-lg">🥈</span>
                            ) : i === 2 ? (
                              <span className="text-lg">🥉</span>
                            ) : (
                              <span className="text-white/30 text-sm font-mono">{i + 1}</span>
                            )}
                          </div>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-semibold truncate">{pr.name}</p>
                              {pr.isRecent && (
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full flex-shrink-0">NEW PR</span>
                              )}
                            </div>
                            <p className="text-white/30 text-xs">
                              {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {pr.reps > 0 && ` · ${pr.reps} reps`}
                              {` · ${pr.sessions} sessions`}
                            </p>
                          </div>
                          {/* Weight */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-orange-400 font-bold text-base">{displayWeight(pr.weight)} {unitLabel}</p>
                            {pr.estOneRM > pr.weight && (
                              <p className="text-purple-400/70 text-xs">~{displayWeight(pr.estOneRM)} 1RM</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Best lift summary card */}
                  {personalRecords.length > 0 && (
                    <GlassCard>
                      <h3 className="text-white/70 text-xs uppercase tracking-wider mb-3">Top Lifts</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {personalRecords.slice(0, 4).map(pr => (
                          <div key={pr.name} className="bg-white/5 rounded-xl p-3">
                            <p className="text-white/50 text-xs mb-1 truncate">{pr.name}</p>
                            <p className="text-orange-400 font-bold text-lg">{displayWeight(pr.weight)} {unitLabel}</p>
                            {pr.estOneRM > pr.weight && (
                              <p className="text-purple-400/60 text-xs">est. 1RM: {displayWeight(pr.estOneRM)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Volume Tab ────────────────────────────────────────────── */}
          {activeTab === 'volume' && (
            <motion.div key="volume"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4">

              {workoutHistory.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-10 space-y-2">
                    <div className="text-5xl">📆</div>
                    <p className="text-white font-semibold">No volume data yet</p>
                    <p className="text-white/40 text-sm">Complete workouts to track your volume</p>
                  </div>
                </GlassCard>
              ) : (
                <>
                  {/* Activity heatmap */}
                  <GlassCard>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">Activity (last 16 weeks)</h3>
                    </div>
                    {/* Day-of-week labels */}
                    <div className="flex gap-1 mb-1 pl-0">
                      {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={i} className="w-full text-center text-white/20 text-[9px]">{d}</div>
                      ))}
                    </div>
                    {/* Heatmap grid — each row is a week, each col is a day */}
                    <div className="space-y-1 overflow-x-auto">
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        return volumeHeatmap.weeks.map((week, wi) => (
                          <div key={wi} className="flex gap-1">
                            {week.map((cell, di) => {
                              const intensity = cell.vol > 0
                                ? Math.min(Math.ceil((cell.vol / volumeHeatmap.maxVol) * 4), 4)
                                : 0;
                              const isToday = cell.date === today;
                              const futureDate = cell.date > today;
                              const colors = ['bg-white/5', 'bg-green-900/60', 'bg-green-700/70', 'bg-green-500/80', 'bg-green-400'];
                              return (
                                <div
                                  key={di}
                                  title={cell.vol > 0 ? `${cell.date}: ${(cell.vol / 1000).toFixed(1)}k lbs` : cell.date}
                                  className={`flex-1 aspect-square rounded-sm transition-colors ${
                                    futureDate ? 'opacity-20' : ''
                                  } ${colors[intensity]} ${isToday ? 'ring-1 ring-amber-400' : ''}`}
                                />
                              );
                            })}
                            {/* Pad incomplete weeks */}
                            {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, pi) => (
                              <div key={`pad-${pi}`} className="flex-1 aspect-square" />
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-white/30 text-xs">Less</span>
                      {['bg-white/5','bg-green-900/60','bg-green-700/70','bg-green-500/80','bg-green-400'].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
                      ))}
                      <span className="text-white/30 text-xs">More</span>
                    </div>
                  </GlassCard>

                  {/* Weekly volume bars */}
                  {weeklyVolumeData.length > 0 && (
                    <GlassCard>
                      <h3 className="text-white font-bold mb-4">Weekly Volume (k lbs)</h3>
                      <div className="space-y-2">
                        {(() => {
                          const maxVol = Math.max(...weeklyVolumeData.map(d => d.volume), 1);
                          return weeklyVolumeData.map((d, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-white/40 text-xs w-16 flex-shrink-0">{d.date}</span>
                              <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(d.volume / maxVol) * 100}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05 }}
                                />
                              </div>
                              <span className="text-amber-400 text-xs font-bold w-10 text-right flex-shrink-0">
                                {d.volume}k
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </GlassCard>
                  )}

                  {/* Total volume summary */}
                  <GlassCard>
                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Totals</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: 'Total Volume',
                          value: `${(workoutHistory.reduce((s, w) =>
                            s + w.exercises.reduce((es, ex) => es + ex.weight * ex.sets * ex.reps, 0), 0) / 1000).toFixed(0)}k`,
                          sub: 'lbs lifted',
                          color: 'text-amber-400',
                        },
                        {
                          label: 'Sessions',
                          value: `${workoutHistory.length}`,
                          sub: 'total workouts',
                          color: 'text-white',
                        },
                        {
                          label: 'Avg / Session',
                          value: workoutHistory.length > 0
                            ? `${(workoutHistory.reduce((s, w) =>
                                s + w.exercises.reduce((es, ex) => es + ex.weight * ex.sets * ex.reps, 0), 0)
                                / workoutHistory.length / 1000).toFixed(1)}k`
                            : '—',
                          sub: 'lbs avg',
                          color: 'text-green-400',
                        },
                      ].map(({ label, value, sub, color }) => (
                        <div key={label} className="text-center bg-white/5 rounded-xl py-3">
                          <p className="text-white/40 text-xs mb-1">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                          <p className="text-white/30 text-xs">{sub}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              )}
            </motion.div>
          )}

          {/* ── Muscles Tab ──────────────────────────────────────────── */}
          {activeTab === 'muscles' && (
            <motion.div key="muscles"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-base">Muscle Recovery</h3>
                    <p className="text-white/40 text-xs mt-0.5">Based on last 14 days of training</p>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    {[
                      { label: 'Due', color: 'text-amber-400' },
                      { label: 'Recovered', color: 'text-green-400' },
                      { label: 'Fresh', color: 'text-blue-400' },
                    ].map(({ label, color }) => (
                      <span key={label} className={`text-[10px] font-semibold ${color}`}>{label}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {muscleData.map(({ group, color, pct, daysSince, status }) => {
                    const statusColor =
                      status === 'today' ? 'text-blue-300'
                      : status === 'fresh' ? 'text-blue-400'
                      : status === 'recovered' ? 'text-green-400'
                      : status === 'due' ? 'text-amber-400'
                      : 'text-white/30';
                    const statusLabel =
                      status === 'today' ? 'Trained today'
                      : status === 'fresh' ? `${daysSince}d ago`
                      : status === 'recovered' ? `${daysSince}d ago`
                      : status === 'due' ? `${daysSince}d ago — due`
                      : 'Not trained yet';

                    return (
                      <div key={group}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-semibold">{group}</span>
                          <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                              opacity: pct === 0 ? 0.15 : 0.8,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Recovery legend */}
              <GlassCard>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Recovery Guide</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Trained today', color: 'text-blue-300', desc: 'Rest — let it recover' },
                    { label: 'Fresh (1–2d)', color: 'text-blue-400', desc: 'Still recovering' },
                    { label: 'Recovered (3–4d)', color: 'text-green-400', desc: 'Ready to train' },
                    { label: 'Due (5d+)', color: 'text-amber-400', desc: 'Prioritize this group' },
                  ].map(({ label, color, desc }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-2.5">
                      <p className={`font-semibold ${color}`}>{label}</p>
                      <p className="text-white/40 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Which exercises hit what */}
              {workoutHistory.length === 0 && (
                <GlassCard>
                  <div className="text-center py-6">
                    <p className="text-4xl mb-3">💪</p>
                    <p className="text-white/60 text-sm">Complete a workout to see your muscle recovery status</p>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* ── History Tab ───────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3">

              {workoutHistory.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-10 space-y-3">
                    <div className="text-5xl">📅</div>
                    <p className="text-white font-semibold text-lg">No workout history yet</p>
                    <p className="text-white/50 text-sm">Complete workouts to see your history here</p>
                  </div>
                </GlassCard>
              ) : (
                <>
                  <p className="text-white/40 text-xs px-1">
                    {workoutHistory.length} session{workoutHistory.length !== 1 ? 's' : ''} logged
                  </p>
                  {[...workoutHistory].reverse().slice(0, 20).map((workout, i) => {
                    const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.weight * ex.sets * ex.reps, 0);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <GlassCard>
                          {/* Date header */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-white font-bold text-sm">
                                {new Date(workout.date).toLocaleDateString('en-US', {
                                  weekday: 'short', month: 'short', day: 'numeric',
                                })}
                              </p>
                              <p className="text-white/40 text-xs">
                                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {workout.rating && (
                                <span className="text-xl" title={['Easy','Good','Solid','Great','PR Day'][workout.rating - 1]}>
                                  {['😴','🙂','💪','🔥','⚡'][workout.rating - 1]}
                                </span>
                              )}
                              <div className="text-right">
                                <p className="text-amber-400 font-bold text-sm">
                                  {(totalVolume / 1000).toFixed(1)}k
                                </p>
                                <p className="text-white/40 text-xs">total vol</p>
                              </div>
                            </div>
                          </div>

                          {/* Workout name */}
                          {workout.dayName && (
                            <p className="text-amber-400/70 text-xs font-semibold mb-2 uppercase tracking-wider">{workout.dayName}</p>
                          )}

                          {/* Exercise list */}
                          <div className="space-y-1.5">
                            {workout.exercises.map((ex, ei) => (
                              <div key={ei} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5">
                                <span className="text-white/70 text-xs">{ex.name}</span>
                                <span className="text-orange-400 text-xs font-semibold">
                                  {displayWeight(ex.weight)} {unitLabel} × {ex.sets}×{ex.reps}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Session notes */}
                          {workout.notes && (
                            <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">
                              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Notes</p>
                              <p className="text-amber-200/60 text-xs leading-relaxed">{workout.notes}</p>
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TierBackgroundWrapper>
  );
};

export default Progress;
