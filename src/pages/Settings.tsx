import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Button, LuxuryProfileCard, Tabs } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useUnit } from '../contexts/UnitContext';
import { useProgram } from '../contexts/ProgramContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { secureStorage } from '../utils/secureStorage';
import { programService, ProgramType } from '../services/programService';
import { xpService } from '../services/xpService';
import { workoutService } from '../services/workoutService';
import { achievementsService, Achievement } from '../services/achievementsService';
import { aiWorkoutService, StoredCustomWorkout, MAX_CUSTOM_WORKOUTS } from '../services/aiWorkoutService';

interface SettingsProps {
  onNavigate?: (page: 'workout' | 'progress' | 'program' | 'achievements' | 'settings' | 'custom') => void;
}

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'programs', label: 'Programs', icon: '📋' },
  { id: 'subscription', label: 'Subscribe', icon: '⭐' },
  { id: 'data', label: 'Data', icon: '💾' },
  { id: 'account', label: 'Account', icon: '⚙️' },
];

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { selectedProgram, setProgram } = useProgram();
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [storageStats, setStorageStats] = useState(secureStorage.getStorageStats());
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { unit: weightUnit, setUnit: setWeightUnit } = useUnit();
  const [restTimerEnabled, setRestTimerEnabledState] = useState(
    () => localStorage.getItem('restTimerEnabled') !== 'false'
  );
  const setRestTimerEnabled = (val: boolean) => {
    localStorage.setItem('restTimerEnabled', String(val));
    setRestTimerEnabledState(val);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xpData, setXpData] = useState({ xp: 0, level: 1 });
  const [workoutStats, setWorkoutStats] = useState({ totalWorkouts: 0, currentStreak: 0, totalWeightLifted: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState(1);
  const [adminXP, setAdminXP] = useState(0);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState('');
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [customWorkouts, setCustomWorkouts] = useState<StoredCustomWorkout[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsAdmin(false);

      const userXP = await xpService.getUserXP(user.id);
      setXpData(userXP);
      setAdminLevel(userXP.level);
      setAdminXP(userXP.xp);

      const history = await workoutService.getWorkoutHistory(user.id);
      const totalWorkouts = history.length;

      const totalWeight = history.reduce((total, workout) => {
        return total + workout.exercises.reduce((sum, ex) => sum + ex.weight * ex.sets * ex.reps, 0);
      }, 0);

      const sortedDates = history
        .map(w => new Date(w.date).toDateString())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const uniqueDates = [...new Set(sortedDates)];
      let currentStreak = 0;
      if (uniqueDates.length > 0) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const diff = Math.floor(
              (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000
            );
            if (diff === 1) currentStreak++;
            else break;
          }
        }
      }

      setWorkoutStats({
        totalWorkouts,
        currentStreak,
        totalWeightLifted: totalWeight,
      });

      const achievements = await achievementsService.getUserAchievements(user.id);
      setUserAchievements(achievements);

      const customWorkoutsList = await aiWorkoutService.getAllCustomWorkouts(user.id);
      setCustomWorkouts(customWorkoutsList);

      if (supabase) {
        try {
          const { data } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', user.id)
            .single();
          setSubscriptionStatus(data?.subscription_status ?? 'inactive');
        } catch {
          setSubscriptionStatus('inactive');
        }
      }
    };

    loadData();
  }, [user]);

  const handleExportData = () => {
    if (!user) return;
    try {
      secureStorage.exportUserData(user.id);
      showMessage('Data exported successfully!', 'success');
    } catch (error) {
      showMessage('Failed to export data', 'error');
      console.error(error);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      await secureStorage.importUserData(file, user.id);
      showMessage('Data imported successfully! Reloading data...', 'success');

      const userXP = await xpService.getUserXP(user.id);
      setXpData(userXP);
      setAdminLevel(userXP.level);
      setAdminXP(userXP.xp);

      const history = await workoutService.getWorkoutHistory(user.id);
      const totalWorkouts = history.length;
      const totalWeight = history.reduce((total, workout) => {
        return total + workout.exercises.reduce((sum, ex) => sum + ex.weight * ex.sets * ex.reps, 0);
      }, 0);
      const sortedDates2 = history
        .map(w => new Date(w.date).toDateString())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const uniqueDates2 = [...new Set(sortedDates2)];
      let currentStreak = 0;
      if (uniqueDates2.length > 0) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (uniqueDates2[0] === today || uniqueDates2[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates2.length; i++) {
            const diff = Math.floor(
              (new Date(uniqueDates2[i - 1]).getTime() - new Date(uniqueDates2[i]).getTime()) / 86400000
            );
            if (diff === 1) currentStreak++;
            else break;
          }
        }
      }
      setWorkoutStats({ totalWorkouts, currentStreak, totalWeightLifted: totalWeight });

      const achievements = await achievementsService.getUserAchievements(user.id);
      setUserAchievements(achievements);
    } catch (error) {
      showMessage('Failed to import data', 'error');
      console.error(error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFullBackup = () => {
    try {
      secureStorage.createFullBackup();
      showMessage('Full backup created successfully!', 'success');
    } catch (error) {
      showMessage('Failed to create backup', 'error');
      console.error(error);
    }
  };

  const handleRefreshStats = () => {
    setStorageStats(secureStorage.getStorageStats());
    showMessage('Storage stats refreshed', 'success');
  };

  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage({ text, type });
    messageTimeoutRef.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const handleSwitchProgram = async (program: ProgramType) => {
    if (!user) return;
    if (selectedProgram === program) return;

    const sessionKey = `workout_session_${user.id}`;
    const activeSession = localStorage.getItem(sessionKey);
    if (activeSession) {
      try {
        const session = JSON.parse(activeSession);
        if (session.isActive && session.exercises && session.exercises.length > 0) {
          showMessage('❌ Finish your current workout before switching programs!', 'error');
          return;
        }
      } catch (error) {
        console.error('Error checking active session:', error);
      }
    }

    const confirmed = window.confirm(
      `Switch to ${programService.getProgramDisplayName(program)} program?\n\nThis will reset your progression. Your workout history will be preserved.`
    );

    if (confirmed) {
      const resetProgression = { currentWeek: 1, completedDays: [] as number[] };
      await workoutService.updateProgression(user.id, resetProgression);
      localStorage.removeItem(sessionKey);
      setProgram(program, user.id);

      const customWorkout = programService.isCustomProgram(program)
        ? customWorkouts.find(w => w.id === programService.getCustomWorkoutId(program))
        : null;
      const displayName = programService.getProgramDisplayName(program, customWorkout?.workoutPlan.programName);
      showMessage(`✅ Switched to ${displayName} program! Starting Week 1.`, 'success');
    }
  };

  const handleDeleteCustomWorkout = async (workoutId: string) => {
    if (!user) return;
    const programType = programService.createCustomProgramType(workoutId);
    if (selectedProgram === programType) {
      showMessage('❌ Cannot delete the currently active workout. Switch to another program first.', 'error');
      return;
    }

    const workout = customWorkouts.find(w => w.id === workoutId);
    const confirmed = window.confirm(
      `Delete "${workout?.workoutPlan.programName || 'Custom Workout'}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      await aiWorkoutService.deleteCustomWorkout(user.id, workoutId);
      const updatedWorkouts = customWorkouts.filter(w => w.id !== workoutId);
      setCustomWorkouts(updatedWorkouts);
      showMessage('✅ Custom workout deleted successfully!', 'success');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAdminUpdateXP = async () => {
    if (!user) return;
    try {
      await xpService.setUserXP(user.id, adminXP, adminLevel);
      const userXP = await xpService.getUserXP(user.id);
      setXpData(userXP);
      setAdminLevel(userXP.level);
      setAdminXP(userXP.xp);
      const achievements = await achievementsService.getUserAchievements(user.id);
      setUserAchievements(achievements);
      showMessage('✅ Admin: Level and XP updated successfully!', 'success');
    } catch (error) {
      showMessage('❌ Failed to update XP', 'error');
      console.error(error);
    }
  };

  const handleAdminUnlockAchievement = async () => {
    if (!user || !selectedAchievement) {
      showMessage('❌ Please select an achievement', 'error');
      return;
    }
    try {
      const result = await achievementsService.adminUnlockAchievement(user.id, selectedAchievement);
      if (result) {
        showMessage(`✅ Achievement unlocked: ${result.achievement.name} (+${result.xpAwarded} XP)`, 'success');
        const achievements = await achievementsService.getUserAchievements(user.id);
        setUserAchievements(achievements);
        const userXP = await xpService.getUserXP(user.id);
        setXpData(userXP);
        setAdminLevel(userXP.level);
        setAdminXP(userXP.xp);
        setSelectedAchievement('');
      } else {
        showMessage('⚠️ Achievement already unlocked or not found', 'error');
      }
    } catch (error) {
      showMessage('❌ Failed to unlock achievement', 'error');
      console.error(error);
    }
  };

  const handleSubscribe = async () => {
    if (!supabase) {
      toast.error('Supabase is not configured.');
      return;
    }
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1T88JpQURNn6byUhLgxdtdzq';

    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/?subscription=success`,
          cancelUrl: `${window.location.origin}/?subscription=cancelled`,
        },
      });

      if (error || !data?.url) {
        toast.error('Failed to start checkout. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #78350f 0%, #451a03 30%, #1c1917 70%, #000000 100%)',
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(251, 146, 60, 0) 70%)' }}
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0) 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <motion.div initial="hidden" animate="visible" variants={cardVariants} className="mb-4">
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">Settings</h1>
          <p className="text-amber-200/70 text-sm">Manage your account, programs, and data</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-500/20 border-2 border-green-400 text-green-300'
                : 'bg-red-500/20 border-2 border-red-400 text-red-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <Tabs tabs={settingsTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants}>
            <LuxuryProfileCard
              username={user?.username || 'Athlete'}
              userId={user?.id || ''}
              totalWorkouts={workoutStats.totalWorkouts}
              currentStreak={workoutStats.currentStreak}
              totalWeightLifted={workoutStats.totalWeightLifted}
              joinedDate={user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2025'}
              level={xpData.level}
              xp={xpData.xp}
            />
          </motion.div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
            {/* AI Custom Workout */}
            <GlassCard>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                    🧠
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold">AI Custom Workout</h3>
                    <p className="text-white/60 text-sm">Get a personalized plan powered by AI</p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => onNavigate?.('custom')} className="w-full sm:w-auto">
                  Create Plan
                </Button>
              </div>
            </GlassCard>

            {/* Training Programs */}
            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-2">Training Program</h3>
              <p className="text-amber-200/70 text-sm mb-4">
                Choose your path. Once locked in, you must complete the program.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSwitchProgram('bodybuilding')}
                  className={`w-full text-left relative rounded-xl p-4 border-2 transition-all ${
                    selectedProgram === 'bodybuilding'
                      ? 'border-amber-500/50 opacity-100'
                      : 'border-gray-600/30 opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    background: selectedProgram === 'bodybuilding'
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.15) 100%)',
                    boxShadow: selectedProgram === 'bodybuilding' ? '0 4px 16px rgba(217, 119, 6, 0.3)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold text-lg ${selectedProgram === 'bodybuilding' ? 'text-white' : 'text-white/70'}`}>
                      💪 Bodybuilding
                    </h4>
                    {selectedProgram === 'bodybuilding' && (
                      <span className="px-2 py-0.5 bg-amber-500/30 border border-amber-400/50 rounded-full text-amber-200 text-xs font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${selectedProgram === 'bodybuilding' ? 'text-amber-100/80' : 'text-white/50'}`}>
                    Progressive muscle building focused on hypertrophy and strength gains
                  </p>
                  {selectedProgram === 'bodybuilding' && (
                    <div className="mt-2 flex items-center gap-2 text-amber-300/70 text-xs">
                      <span>5-day split</span><span>•</span><span>12 weeks</span><span>•</span><span>Weighted</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleSwitchProgram('hybrid')}
                  className={`w-full text-left relative rounded-xl p-4 border-2 transition-all ${
                    selectedProgram === 'hybrid'
                      ? 'border-amber-500/50 opacity-100'
                      : 'border-gray-600/30 opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    background: selectedProgram === 'hybrid'
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.15) 100%)',
                    boxShadow: selectedProgram === 'hybrid' ? '0 4px 16px rgba(217, 119, 6, 0.3)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold text-lg ${selectedProgram === 'hybrid' ? 'text-white' : 'text-white/70'}`}>
                      ⚡ Hybrid
                    </h4>
                    {selectedProgram === 'hybrid' && (
                      <span className="px-2 py-0.5 bg-amber-500/30 border border-amber-400/50 rounded-full text-amber-200 text-xs font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${selectedProgram === 'hybrid' ? 'text-amber-100/80' : 'text-white/50'}`}>
                    Advanced fusion of weighted exercises and bodyweight movements
                  </p>
                  {selectedProgram === 'hybrid' && (
                    <div className="mt-2 flex items-center gap-2 text-amber-300/70 text-xs">
                      <span>3-day full-body</span><span>•</span><span>12 weeks</span><span>•</span><span>Weights + Bodyweight</span>
                    </div>
                  )}
                </button>

                {/* Custom AI Workouts */}
                {customWorkouts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white/80 text-sm font-semibold">🧠 AI Custom Workouts</h4>
                      <span className="text-amber-400/70 text-xs">{customWorkouts.length}/{MAX_CUSTOM_WORKOUTS} slots</span>
                    </div>
                    <div className="space-y-3">
                      {customWorkouts.map((workout) => {
                        const programType = programService.createCustomProgramType(workout.id);
                        const isActive = selectedProgram === programType;
                        return (
                          <div key={workout.id} className="relative">
                            <button
                              onClick={() => handleSwitchProgram(programType)}
                              className={`w-full text-left relative rounded-xl p-4 border-2 transition-all ${
                                isActive
                                  ? 'border-purple-500/50 opacity-100'
                                  : 'border-gray-600/30 opacity-60 hover:opacity-80'
                              }`}
                              style={{
                                background: isActive
                                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                                  : 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.15) 100%)',
                                boxShadow: isActive ? '0 4px 16px rgba(168, 85, 247, 0.3)' : 'none',
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1 pr-8">
                                <h4 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-white/70'}`}>
                                  🧠 {workout.workoutPlan.programName}
                                </h4>
                                {isActive && (
                                  <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/50 rounded-full text-purple-200 text-xs font-semibold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${isActive ? 'text-purple-100/80' : 'text-white/50'}`}>
                                {workout.workoutPlan.description}
                              </p>
                              {isActive && (
                                <div className="mt-2 flex items-center gap-2 text-purple-300/70 text-xs">
                                  <span>{workout.workoutPlan.daysPerWeek}-day</span><span>•</span>
                                  <span>{workout.workoutPlan.weeks.length} weeks</span><span>•</span>
                                  <span>AI Generated</span>
                                </div>
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCustomWorkout(workout.id); }}
                              className="absolute top-3 right-3 w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-400/50 rounded-lg flex items-center justify-center text-red-300 hover:text-red-200 transition-all z-10"
                              title="Delete this workout"
                            >
                              🗑️
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold">Subscription Status</h3>
                {subscriptionStatus === 'active' ? (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-400/50 rounded-full text-green-300 text-sm font-semibold">
                    Active
                  </span>
                ) : subscriptionStatus === 'trialing' ? (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full text-blue-300 text-sm font-semibold">
                    Trial
                  </span>
                ) : subscriptionStatus === 'past_due' ? (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-400/50 rounded-full text-red-300 text-sm font-semibold">
                    Past Due
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/60 text-sm font-semibold">
                    Not Subscribed
                  </span>
                )}
              </div>

              {subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-300 text-sm font-semibold mb-1">You're all set!</p>
                    <p className="text-green-200/70 text-sm">
                      Your subscription is active. You have full access to AI custom workouts.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'AI-generated personalized workout plans',
                      'Up to 2 saved custom programs',
                      'Goal-based training structure',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span className="text-amber-400">✓</span>
                        <span className="text-white/70 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionStatus === 'past_due' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 text-sm">
                        Your last payment failed. Please update your payment method to restore access.
                      </p>
                    </div>
                  )}

                  <p className="text-white/60 text-sm">
                    Subscribe to unlock AI-powered custom workout generation.
                  </p>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                    {[
                      'Fully personalized to your goals and experience',
                      'Adjusts for your available equipment',
                      'Accounts for injuries and limitations',
                      'AI-generated, structured multi-week program',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span className="text-amber-400">✓</span>
                        <span className="text-amber-100/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-1 justify-center py-2">
                    <span className="text-3xl font-bold text-white">$9.99</span>
                    <span className="text-white/50">/month</span>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSubscribe}
                    disabled={isCheckoutLoading}
                    className="w-full"
                  >
                    {isCheckoutLoading ? 'Redirecting to checkout...' : 'Subscribe Now'}
                  </Button>

                  <p className="text-center text-white/30 text-xs">
                    Cancel anytime. Secure checkout powered by Stripe.
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-1">Export Your Data</h4>
                  <p className="text-white/60 text-sm mb-3">Download your workout history and progression data as a JSON file.</p>
                  <Button variant="primary" onClick={handleExportData}>📥 Export Data</Button>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-1">Import Data</h4>
                  <p className="text-white/60 text-sm mb-3">Restore your data from a previously exported JSON file.</p>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportData} className="hidden" id="file-import" />
                  <label htmlFor="file-import">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} type="button">
                      📤 Import Data
                    </Button>
                  </label>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-1">Full System Backup</h4>
                  <p className="text-white/60 text-sm mb-3">Export all data from all users. Use for complete recovery.</p>
                  <Button variant="secondary" onClick={handleFullBackup}>💾 Create Full Backup</Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold">Storage Usage</h3>
                <button onClick={handleRefreshStats} className="text-orange-400 hover:text-orange-300 text-sm">🔄 Refresh</button>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-sm">Used Storage</span>
                <span className="text-white font-semibold text-sm">
                  {formatBytes(storageStats.used)} / {formatBytes(storageStats.total)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storageStats.percentage > 80 ? 'bg-red-500' : storageStats.percentage > 50 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${storageStats.percentage}%` }}
                />
              </div>
              <p className="text-white/50 text-xs mt-2">{storageStats.percentage.toFixed(2)}% used</p>
              {storageStats.percentage > 80 && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-300 text-sm">⚠️ Storage is running low! Export old data to free up space.</p>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-3">🔒 Data Security</h3>
              <div className="space-y-2 text-sm text-amber-100/80">
                <p>✅ All data is encrypted before being stored in your browser</p>
                <p>✅ Automatic backup created after every workout</p>
                <p>✅ Data recovery available if corruption occurs</p>
                <p>✅ Unique encryption key per device</p>
                <p className="text-amber-200/60 mt-3">
                  Your data is stored locally. Export backups regularly to prevent data loss!
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
            {/* Preferences */}
            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-4">Preferences</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-white font-semibold mb-1">Weight Unit</h4>
                  <p className="text-amber-200/60 text-sm">Choose your preferred measurement</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      weightUnit === 'lbs'
                        ? 'bg-amber-500/30 border-2 border-amber-400/60 text-amber-100'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    lbs
                  </button>
                  <button
                    onClick={() => setWeightUnit('kg')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      weightUnit === 'kg'
                        ? 'bg-amber-500/30 border-2 border-amber-400/60 text-amber-100'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    kg
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/5 mt-2">
                <div>
                  <h4 className="text-white font-semibold mb-1">Rest Timer</h4>
                  <p className="text-amber-200/60 text-sm">Auto-start timer after each set</p>
                </div>
                <button
                  onClick={() => setRestTimerEnabled(!restTimerEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    restTimerEnabled ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                  aria-label="Toggle rest timer"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    restTimerEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </GlassCard>

            {/* Admin Controls */}
            {isAdmin && (
              <GlassCard>
                <div className="border-2 border-red-500/50 rounded-xl p-4 bg-red-500/10">
                  <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                    🔧 Admin Controls
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <span className="text-white/70 text-sm">Current</span>
                      <span className="text-white font-bold">Level {xpData.level} • {xpData.xp} XP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white text-sm font-semibold mb-1.5">Level</label>
                        <input
                          type="number" min="1" max="999" value={adminLevel}
                          onChange={(e) => setAdminLevel(parseInt(e.target.value) || 1)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-semibold focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-semibold mb-1.5">XP</label>
                        <input
                          type="number" min="0" value={adminXP}
                          onChange={(e) => setAdminXP(parseInt(e.target.value) || 0)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-semibold focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: '🥉', level: 1, xp: 0 },
                        { icon: '🥈', level: 10, xp: 0 },
                        { icon: '🥇', level: 50, xp: 0 },
                        { icon: '💎', level: 100, xp: 0 },
                      ].map(({ icon, level, xp }) => (
                        <button
                          key={icon}
                          onClick={() => { setAdminLevel(level); setAdminXP(xp); }}
                          className="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <Button variant="primary" onClick={handleAdminUpdateXP} className="w-full">Apply Changes</Button>

                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-white text-sm font-bold mb-3">🏆 Achievements</h4>
                      <select
                        value={selectedAchievement}
                        onChange={(e) => setSelectedAchievement(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:border-amber-500/50 focus:outline-none mb-2"
                      >
                        <option value="" className="bg-gray-900">Select Achievement</option>
                        {userAchievements.filter(ach => !ach.unlocked).map(ach => (
                          <option key={ach.id} value={ach.id} className="bg-gray-900">
                            {ach.icon} {ach.name} (+{ach.xpReward} XP)
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="primary" onClick={handleAdminUnlockAchievement} className="w-full text-sm" disabled={!selectedAchievement}>
                          Unlock
                        </Button>
                        <button
                          onClick={async () => {
                            if (!user) return;
                            const confirmed = window.confirm('Unlock ALL achievements?');
                            if (confirmed) {
                              try {
                                const allAchievements = achievementsService.getAllAchievements();
                                let unlockedCount = 0;
                                for (const ach of allAchievements) {
                                  const result = await achievementsService.adminUnlockAchievement(user.id, ach.id);
                                  if (result) unlockedCount++;
                                }
                                showMessage(`✅ Unlocked ${unlockedCount} achievements!`, 'success');
                                const achievements = await achievementsService.getUserAchievements(user.id);
                                setUserAchievements(achievements);
                                const userXP = await xpService.getUserXP(user.id);
                                setXpData(userXP);
                                setAdminLevel(userXP.level);
                                setAdminXP(userXP.xp);
                              } catch (error) {
                                showMessage('❌ Failed', 'error');
                                console.error(error);
                              }
                            }
                          }}
                          className="w-full bg-orange-500/20 border border-orange-400/50 rounded-lg px-3 py-2 text-orange-200 text-sm font-semibold hover:bg-orange-500/30 transition-all"
                        >
                          Unlock All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Logout */}
            <GlassCard>
              <h3 className="text-white text-lg font-bold mb-3">Sign Out</h3>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-200/80 text-sm mb-3">
                  Logging out will keep your data safe. Sign back in anytime to continue your journey.
                </p>
                <Button variant="secondary" onClick={logout} className="w-full">Logout</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
