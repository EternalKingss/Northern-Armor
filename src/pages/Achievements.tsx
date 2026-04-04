import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, TierBackgroundWrapper } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { achievementsService, Achievement, AchievementUnlockedResult } from '../services/achievementsService';
import { xpService } from '../services/xpService';

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [xpData, setXpData] = useState({ xp: 0, level: 1 });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementUnlockedResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsChecking(true);

      // First, check for any retroactive achievements that should have been unlocked
      // This handles workouts done before achievements were added
      const retroactiveUnlocks = await achievementsService.checkAndUnlockAchievements(user.id);

      if (retroactiveUnlocks.length > 0) {
        setNewlyUnlocked(retroactiveUnlocks);
      }

      // Now fetch the updated achievements list
      const userAchievements = await achievementsService.getUserAchievements(user.id);
      setAchievements(userAchievements);

      const userXP = await xpService.getUserXP(user.id);
      setXpData(userXP);

      setIsChecking(false);
    };

    loadData();
  }, [user]);

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'from-amber-500/20 to-orange-500/20 border-amber-400/30';
      case 'streak':
        return 'from-red-500/20 to-orange-500/20 border-orange-400/30';
      case 'volume':
        return 'from-cyan-500/20 to-teal-500/20 border-cyan-400/30';
      case 'consistency':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
    }
  };

  return (
    <TierBackgroundWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-white/60">Track your progress and unlock rewards</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="mb-4"
        >
          <GlassCard>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {unlockedCount}/{achievements.length}
                </div>
                <div className="text-white/60 text-sm">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">{totalXP}</div>
                <div className="text-white/60 text-sm">Total XP Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </div>
                <div className="text-white/60 text-sm">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300">
                  Level {xpData.level}
                </div>
                <div className="text-white/60 text-sm">Current Level</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex gap-2 flex-wrap">
            {(['all', 'unlocked', 'locked'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`relative rounded-2xl p-6 border-2 backdrop-blur-xl ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${getAchievementTypeColor(achievement.type)}`
                    : 'bg-black/40 border-white/10 opacity-60'
                }`}
              >
                {/* Achievement Icon */}
                <div className="text-6xl mb-4 text-center">{achievement.icon}</div>

                {/* Achievement Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{achievement.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        achievement.unlocked
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      +{achievement.xpReward} XP
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        achievement.type === 'milestone'
                          ? 'bg-amber-500/20 text-amber-300'
                          : achievement.type === 'streak'
                          ? 'bg-orange-500/20 text-orange-300'
                          : achievement.type === 'volume'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {achievement.type}
                    </span>
                  </div>
                </div>

                {/* Unlocked Badge */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-xs text-white/50">Unlocked on</div>
                      <div className="text-sm text-white/70">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Locked Overlay */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                    <div className="text-4xl">🔒</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white/80 mb-2">No achievements found</h3>
            <p className="text-white/60">Try changing the filter or complete more workouts to unlock achievements!</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isChecking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 left-4 bg-amber-950/90 backdrop-blur-xl rounded-xl px-4 py-2 border border-amber-400/30"
          >
            <p className="text-amber-300 text-sm">Checking for achievements...</p>
          </motion.div>
        )}
      </div>

      {/* Retroactive Achievements Unlocked Modal */}
      <AnimatePresence>
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setNewlyUnlocked([])}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-amber-950/90 via-black/90 to-orange-950/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-400/50 shadow-2xl">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Achievements Unlocked!
                  </h2>
                  <p className="text-white/60 text-sm mt-2">
                    Based on your workout history, you've earned these achievements!
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {newlyUnlocked.map((item, index) => (
                    <motion.div
                      key={item.achievement.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 bg-amber-950/50 rounded-xl p-4 border border-amber-400/20"
                    >
                      <div className="text-4xl">{item.achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{item.achievement.name}</h3>
                        <p className="text-white/60 text-sm">{item.achievement.description}</p>
                      </div>
                      <div className="text-amber-400 font-bold text-sm">
                        +{item.xpAwarded} XP
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-amber-300 text-lg font-semibold mb-4">
                    Total XP Earned: +{newlyUnlocked.reduce((sum, item) => sum + item.xpAwarded, 0)} XP
                  </p>
                  <button
                    onClick={() => setNewlyUnlocked([])}
                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/30"
                  >
                    Awesome!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TierBackgroundWrapper>
  );
};

export default Achievements;
