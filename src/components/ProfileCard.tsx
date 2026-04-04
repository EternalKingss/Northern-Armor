import React from 'react';
import GlassCard from './GlassCard';

interface ProfileCardProps {
  name: string;
  greeting?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  status?: string;
  statusColor?: 'online' | 'away' | 'offline';
  className?: string;
}

/**
 * ProfileCard - User profile card component
 *
 * Features:
 * - Avatar with initials fallback
 * - User name and greeting
 * - Status indicator with color variations
 * - Built on GlassCard for consistency
 * - Clean, modern layout
 */
const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  greeting = 'Good morning',
  avatarUrl,
  avatarInitials,
  status,
  statusColor = 'online',
  className = ''
}) => {
  const statusColors = {
    online: 'bg-green-400',
    away: 'bg-yellow-400',
    offline: 'bg-gray-400'
  };

  // Generate initials from name if not provided
  const initials = avatarInitials || name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <GlassCard className={className}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              background: !avatarUrl
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(249, 115, 22, 0.3))'
                : undefined
            }}
          >
            {!avatarUrl && (
              <span className="text-orange-300">{initials}</span>
            )}
          </div>

          {/* Status indicator */}
          {status && (
            <div
              className={`
                absolute
                bottom-0
                right-0
                w-4
                h-4
                rounded-full
                border-2
                border-black/40
                ${statusColors[statusColor]}
              `}
            />
          )}
        </div>

        {/* Profile info */}
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{greeting}</p>
          <h2 className="text-xl font-bold text-white">{name}</h2>
          {status && (
            <p className="text-xs text-gray-500 mt-1">{status}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProfileCard;
