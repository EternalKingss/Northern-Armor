import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { xpService } from '../services/xpService';
import { useAuth } from './AuthContext';

interface TierColors {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  primary: string;
  light: string;
  dark: string;
  glow: string;
  glowRgb: string; // RGB values for radial gradients
}

interface TierThemeContextType {
  tierColors: TierColors;
  level: number;
  xp: number;
  refreshTier: () => Promise<void>;
}

const TierThemeContext = createContext<TierThemeContextType | undefined>(undefined);

export const useTierTheme = () => {
  const context = useContext(TierThemeContext);
  if (!context) {
    throw new Error('useTierTheme must be used within TierThemeProvider');
  }
  return context;
};

const getTierColors = (tierName: 'bronze' | 'silver' | 'gold' | 'platinum'): TierColors => {
  const tierColorMap = {
    bronze: {
      name: 'bronze' as const,
      primary: '#ff6b35',
      light: '#ff8c5a',
      dark: '#d4461f',
      glow: 'rgba(255, 107, 53, 0.6)',
      glowRgb: '255, 107, 53',
    },
    silver: {
      name: 'silver' as const,
      primary: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
      glow: 'rgba(148, 163, 184, 0.6)',
      glowRgb: '148, 163, 184',
    },
    gold: {
      name: 'gold' as const,
      primary: '#fbbf24',
      light: '#fde047',
      dark: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.6)',
      glowRgb: '251, 191, 36',
    },
    platinum: {
      name: 'platinum' as const,
      primary: '#22d3ee',
      light: '#67e8f9',
      dark: '#06b6d4',
      glow: 'rgba(34, 211, 238, 0.7)',
      glowRgb: '34, 211, 238',
    },
  };

  return tierColorMap[tierName];
};

export const TierThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tierColors, setTierColors] = useState<TierColors>(getTierColors('bronze'));
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  const refreshTier = useCallback(async () => {
    if (!user) return;

    const xpData = await xpService.getUserXP(user.id);
    setLevel(xpData.level);
    setXp(xpData.xp);

    const tier = xpService.getProfileTier(xpData.level);
    setTierColors(getTierColors(tier.name));
  }, [user]);

  useEffect(() => {
    refreshTier();
  }, [refreshTier]);

  return (
    <TierThemeContext.Provider value={{ tierColors, level, xp, refreshTier }}>
      {children}
    </TierThemeContext.Provider>
  );
};
