import React, { ReactNode } from 'react';
import { useTierTheme } from '../contexts/TierThemeContext';

interface TierBackgroundWrapperProps {
  children: ReactNode;
}

/**
 * TierBackgroundWrapper - Wraps pages with STRONG tier-appropriate background AURA
 *
 * Creates an intense, visible aura effect based on user's tier:
 * - Bronze: Intense bronze/copper aura
 * - Silver: Bright silver/metallic aura
 * - Gold: Rich gold/amber aura
 * - Platinum: Brilliant platinum/white aura
 */
const TierBackgroundWrapper: React.FC<TierBackgroundWrapperProps> = ({ children }) => {
  const { tierColors } = useTierTheme();

  return (
    <div
      className="min-h-screen relative pb-20 md:pb-6 overflow-x-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(${tierColors.glowRgb}, 0.05) 0%, #1a1410 25%, #2d1f0d 50%, rgba(${tierColors.glowRgb}, 0.03) 100%)`,
        isolation: 'isolate',
      }}
    >
      {/* INTENSE Tier-based background AURA - Optimized for performance */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          isolation: 'isolate',
        }}
      >
        {/* Primary massive glow - top right - VERY VISIBLE */}
        <div
          className="absolute -top-32 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(${tierColors.glowRgb}, 0.6) 0%, rgba(${tierColors.glowRgb}, 0.3) 30%, rgba(${tierColors.glowRgb}, 0.1) 60%, transparent 100%)`,
            opacity: 0.8,
            filter: 'blur(80px)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />

        {/* Secondary glow - bottom left - STRONG */}
        <div
          className="absolute -bottom-32 -left-32 w-[1000px] h-[1000px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(${tierColors.glowRgb}, 0.5) 0%, rgba(${tierColors.glowRgb}, 0.25) 30%, rgba(${tierColors.glowRgb}, 0.08) 60%, transparent 100%)`,
            opacity: 0.7,
            filter: 'blur(80px)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />

        {/* Center ambient glow - fills the middle */}
        <div
          className="absolute top-1/2 left-1/2 w-[1200px] h-[800px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, rgba(${tierColors.glowRgb}, 0.25) 0%, rgba(${tierColors.glowRgb}, 0.08) 50%, transparent 70%)`,
            opacity: 0.5,
            filter: 'blur(100px)',
            transform: 'translate3d(-50%, -50%, 0)',
          }}
        />

        {/* Tier color accent overlay for extra visibility */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(${tierColors.glowRgb}, 0.12) 0%, transparent 60%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default TierBackgroundWrapper;
