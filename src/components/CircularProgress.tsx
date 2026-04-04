import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'blue' | 'green' | 'cyan';
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  strokeWidth?: number;
}

/**
 * CircularProgress - Circular progress indicator component
 *
 * Features:
 * - Smooth circular progress visualization
 * - Multiple size options (sm, md, lg)
 * - Warm accent colors
 * - Optional percentage display
 * - Smooth animations
 * - Perfect for charging indicators, progress tracking
 */
const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 'md',
  color = 'orange',
  label,
  showPercentage = true,
  animated = true,
  strokeWidth = 6
}) => {
  // Clamp percentage between 0 and 100
  const validPercentage = Math.min(Math.max(percentage, 0), 100);

  // Size configurations
  const sizeConfig = {
    sm: { size: 100, textSize: 'text-lg' },
    md: { size: 150, textSize: 'text-3xl' },
    lg: { size: 200, textSize: 'text-4xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (validPercentage / 100) * circumference;

  const colorClasses = {
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400'
  };

  const strokeColors = {
    orange: '#fb923c',
    blue: '#60a5fa',
    green: '#4ade80',
    cyan: '#22d3ee'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        {/* Background circle */}
        <svg
          width={config.size}
          height={config.size}
          className="absolute inset-0 transform -rotate-90"
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
        </svg>

        {/* Progress circle */}
        <svg
          width={config.size}
          height={config.size}
          className={`absolute inset-0 transform -rotate-90 ${
            animated ? 'transition-all duration-500' : ''
          }`}
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke={strokeColors[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.5))'
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <div className={`${config.textSize} font-bold ${colorClasses[color]}`}>
              {Math.round(validPercentage)}%
            </div>
          )}
          {label && (
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
