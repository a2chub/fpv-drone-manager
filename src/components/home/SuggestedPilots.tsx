import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import { FollowButton } from '@/components/user/FollowButton'
import { motion } from 'framer-motion'
import { Users, ChevronRight, MapPin, Plane } from 'lucide-react'
import { usePopularUsers } from '@/hooks/useUserSearch'
import { useAuth } from '@/contexts/AuthContext'

export interface SuggestedPilotsProps {
  className?: string
  maxItems?: number
  showHeader?: boolean
}

export function SuggestedPilots({
  className,
  maxItems = 5,
  showHeader = true,
}: SuggestedPilotsProps) {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading } = usePopularUsers(maxItems + 1) // +1 to filter self

  // Filter out current user
  const suggestedUsers = (users || [])
    .filter((u) => u.id !== currentUser?.id)
    .slice(0, maxItems)

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              おすすめパイロット
            </h3>
          </div>
        )}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (suggestedUsers.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              おすすめパイロット
            </h3>
          </div>
          <Link
            to="/users"
            className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            すべて見る
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {suggestedUsers.map((user, index) => (
          <SuggestedPilotCard key={user.id} user={user} index={index} />
        ))}
      </div>
    </div>
  )
}

interface SuggestedPilotCardProps {
  user: {
    id: string
    displayName?: string
    photoURL?: string | null
    profile?: {
      location?: string
      bio?: string
    }
  }
  index: number
}

function SuggestedPilotCard({ user, index }: SuggestedPilotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
    >
      {/* Avatar */}
      <Link to={`/u/${user.id}`} className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Pilot'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
              {user.displayName?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link to={`/u/${user.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
          {user.displayName || 'Unknown Pilot'}
        </p>
        {user.profile?.location && (
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={10} />
            {user.profile.location}
          </p>
        )}
      </Link>

      {/* Follow Button */}
      <FollowButton targetUserId={user.id} size="sm" />
    </motion.div>
  )
}

// Featured Pilot Card (larger, more prominent)
export function FeaturedPilotCard({
  user,
  className,
}: {
  user: {
    id: string
    displayName?: string
    photoURL?: string | null
    profile?: {
      location?: string
      bio?: string
    }
    droneCount?: number
  }
  className?: string
}) {
  return (
    <GlassCard className={cn('p-6', className)}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar */}
        <Link to={`/u/${user.id}`}>
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-primary-500/20">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Pilot'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400 font-medium">
                {user.displayName?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <Link to={`/u/${user.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
              {user.displayName || 'Unknown Pilot'}
            </h3>
          </Link>

          {user.profile?.location && (
            <p className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={14} />
              {user.profile.location}
            </p>
          )}

          {user.profile?.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
              {user.profile.bio}
            </p>
          )}

          {/* Stats */}
          {user.droneCount !== undefined && (
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Plane size={14} />
                <span className="font-mono">{user.droneCount}</span>
                <span>機体</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
            <FollowButton targetUserId={user.id} />
            <Link
              to={`/u/${user.id}`}
              className="btn-outline text-sm"
            >
              プロフィールを見る
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
