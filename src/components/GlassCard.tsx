import React, { useMemo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * GlassCard - A reusable glassmorphic card component with golden/amber aesthetic
 *
 * Features:
 * - Backdrop blur effect for glassmorphism (reduced on mobile for performance)
 * - Semi-transparent warm background
 * - Golden/amber borders with glow
 * - Highly rounded corners
 * - Luxurious golden shadows (simplified on mobile)
 * - Mobile-optimized with reduced GPU-intensive effects
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick
}) => {
  const isMobile = useIsMobile();

  // Memoize boxShadow to avoid recalculation on every render
  const boxShadow = useMemo(() => {
    return isMobile
      ? '0 4px 16px rgba(217, 119, 6, 0.2)'
      : '0 8px 32px rgba(217, 119, 6, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.1), inset 0 1px 0 rgba(251, 191, 36, 0.2)';
  }, [isMobile]);

  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-md md:backdrop-blur-xl
        bg-gradient-to-br from-amber-950/40 via-black/30 to-orange-950/40
        border-2
        border-amber-500/30
        rounded-2xl sm:rounded-3xl
        p-4 sm:p-6
        transition-all
        duration-300
        hover:border-amber-400/50
        md:hover:shadow-2xl
        ${onClick ? 'cursor-pointer active:scale-[0.98] md:active:scale-100' : ''}
        ${className}
      `}
      style={{
        boxShadow,
        // Performance hints for GPU acceleration
        transform: 'translateZ(0)',
        willChange: onClick ? 'transform' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
