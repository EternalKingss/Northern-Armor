import React from 'react'
import { motion } from 'framer-motion'
import type { StatCardProps } from '../types'

/**
 * StatCard - Displays a single fitness statistic
 *
 * Features:
 * - Glassmorphic design
 * - Support for icons
 * - Trend indicators
 * - Multiple size variants
 * - Hover animations
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  description,
  trend,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
}) => {
  const variantClasses = {
    primary: 'glass-dark border-white/20',
    secondary: 'glass border-white/10',
    accent: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-white/20',
  }

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-xl
        backdrop-blur-glass-lg
        transition-all
        duration-300
        cursor-pointer
        ${onClick ? 'hover:shadow-glass-lg' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-gray-300 text-sm">{unit}</span>}
          </div>
          {description && <p className="text-gray-500 text-xs mt-2">{description}</p>}
        </div>
        {icon && (
          <div className="text-cyan-400 text-2xl ml-4 opacity-80">{icon}</div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                trend.direction === 'up'
                  ? 'text-green-400'
                  : trend.direction === 'down'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {trend.direction === 'up' && '+'}
              {trend.direction === 'down' && '-'}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500 text-xs">
              {trend.direction === 'up' ? 'Increase' : trend.direction === 'down' ? 'Decrease' : 'No change'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default StatCard
