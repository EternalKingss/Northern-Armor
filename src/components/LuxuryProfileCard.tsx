import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { xpService } from '../services/xpService';

interface LuxuryProfileCardProps {
  username: string;
  userId: string;
  totalWorkouts?: number;
  currentStreak?: number;
  totalWeightLifted?: number;
  joinedDate?: string;
  level?: number;
  xp?: number;
}

/**
 * LuxuryProfileCard - Premium adventure-style card for user profile
 *
 * Features:
 * - Tiered aesthetic (Bronze/Silver/Gold/Platinum) based on level
 * - Embossed/raised effect
 * - RPG character card style
 * - Animated shine effects
 * - Stats display like a collector's card
 * - XP progress bar
 */
const LuxuryProfileCard: React.FC<LuxuryProfileCardProps> = ({
  username,
  userId,
  totalWorkouts = 0,
  currentStreak = 0,
  totalWeightLifted = 0,
  joinedDate = 'New Member',
  level = 1,
  xp = 0,
}) => {
  const displayLevel = level;
  const tier = xpService.getProfileTier(displayLevel);
  const xpProgress = xpService.getXPProgress(xp, displayLevel);

  // Tier-specific color schemes
  const tierColors = {
    bronze: {
      primary: '#cd7f32',
      light: '#e5a855',
      dark: '#8b5a2b',
      glow: 'rgba(205, 127, 50, 0.4)',
      gradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(139, 90, 43, 0.3) 50%, rgba(101, 67, 33, 0.2) 100%)',
      border: 'rgba(205, 127, 50, 0.5)',
      shimmer: 'rgba(229, 168, 85, 0.3)',
    },
    silver: {
      primary: '#c0c0c0',
      light: '#e8e8e8',
      dark: '#808080',
      glow: 'rgba(192, 192, 192, 0.4)',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(169, 169, 169, 0.3) 50%, rgba(128, 128, 128, 0.2) 100%)',
      border: 'rgba(192, 192, 192, 0.5)',
      shimmer: 'rgba(232, 232, 232, 0.3)',
    },
    gold: {
      primary: '#fbbf24',
      light: '#fcd34d',
      dark: '#d97706',
      glow: 'rgba(217, 119, 6, 0.4)',
      gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.3) 50%, rgba(146, 64, 14, 0.2) 100%)',
      border: 'rgba(251, 191, 36, 0.5)',
      shimmer: 'rgba(251, 191, 36, 0.3)',
    },
    platinum: {
      primary: '#e5e4e2',
      light: '#ffffff',
      dark: '#a8a8a8',
      glow: 'rgba(229, 228, 226, 0.6)',
      gradient: 'linear-gradient(135deg, rgba(229, 228, 226, 0.3) 0%, rgba(192, 192, 192, 0.4) 50%, rgba(168, 168, 168, 0.3) 100%)',
      border: 'rgba(229, 228, 226, 0.6)',
      shimmer: 'rgba(255, 255, 255, 0.4)',
    },
  };

  const colors = tierColors[tier.name];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Main card - simplified */}
      <div
        className="relative backdrop-blur-xl rounded-2xl overflow-hidden border-2"
        style={{
          borderColor: colors.border,
          background: `linear-gradient(135deg, ${colors.glow}15 0%, ${colors.shimmer}10 100%)`,
          boxShadow: `0 8px 32px ${colors.glow}`,
        }}
      >
        {/* Header section with tier and level */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Tier and Level badges row */}
          <div className="flex items-center justify-between mb-6">
            {/* Tier badge */}
            <div
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 border"
              style={{
                background: `${colors.glow}20`,
                borderColor: colors.border,
              }}
            >
              <span className="text-xl">{tier.icon}</span>
              <span className="text-sm font-bold" style={{ color: colors.light }}>
                {tier.displayName}
              </span>
            </div>

            {/* Level badge */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center border-2"
              style={{
                borderColor: colors.border,
                background: `${colors.shimmer}30`,
                boxShadow: `0 4px 12px ${colors.glow}`,
              }}
            >
              <div className="text-center">
                <div className="text-xs font-semibold" style={{ color: colors.light }}>
                  LVL
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.light }}>
                  {displayLevel}
                </div>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center border-2"
              style={{
                borderColor: colors.border,
                background: `${colors.shimmer}25`,
              }}
            >
              <span className="text-3xl font-bold" style={{ color: colors.light }}>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: colors.light }}
              >
                {username}
              </h2>
              <p className="text-sm" style={{ color: `${colors.light}aa` }}>
                Member since {joinedDate}
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold" style={{ color: colors.light }}>
                XP Progress
              </span>
              <span className="text-sm font-mono" style={{ color: colors.light }}>
                {xpProgress.current} / {xpProgress.needed}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: `${colors.dark}30` }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.light} 100%)`,
                  boxShadow: `0 0 8px ${colors.glow}`,
                }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-lg p-3 text-center border"
              style={{
                borderColor: `${colors.border}40`,
                background: `${colors.shimmer}10`,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: colors.light }}>
                {totalWorkouts}
              </div>
              <div className="text-xs font-medium uppercase" style={{ color: `${colors.light}bb` }}>
                Workouts
              </div>
            </div>

            <div
              className="rounded-lg p-3 text-center border"
              style={{
                borderColor: `${colors.border}40`,
                background: `${colors.shimmer}10`,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: colors.light }}>
                {currentStreak}🔥
              </div>
              <div className="text-xs font-medium uppercase" style={{ color: `${colors.light}bb` }}>
                Streak
              </div>
            </div>

            <div
              className="rounded-lg p-3 text-center border"
              style={{
                borderColor: `${colors.border}40`,
                background: `${colors.shimmer}10`,
              }}
            >
              <div className="text-xl font-bold" style={{ color: colors.light }}>
                {totalWeightLifted >= 1000
                  ? `${(totalWeightLifted / 1000).toFixed(1)}k`
                  : totalWeightLifted}
              </div>
              <div className="text-xs font-medium uppercase" style={{ color: `${colors.light}bb` }}>
                Total lbs
              </div>
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div
          className="px-6 py-3 border-t"
          style={{
            borderColor: `${colors.border}30`,
            background: `${colors.glow}10`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase" style={{ color: `${colors.light}88` }}>
              Athlete ID
            </span>
            <span className="text-xs font-mono" style={{ color: `${colors.light}cc` }}>
              {userId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LuxuryProfileCard;
