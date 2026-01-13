import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { FollowButton } from './FollowButton'
import { motion } from 'framer-motion'
import { MapPin, Plane, Users, Activity } from 'lucide-react'
import type { User } from '@/types'

interface EnhancedUserCardProps {
  user: User & {
    droneCount?: number
    followersCount?: number
    lastActiveAt?: { toDate: () => Date }
  }
  index?: number
  className?: string
}

export function EnhancedUserCard({ user, index = 0, className }: EnhancedUserCardProps) {
  const isRecentlyActive = user.lastActiveAt
    ? Date.now() - user.lastActiveAt.toDate().getTime() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn('group', className)}
    >
      <div className="panel-card p-4 h-full hover:border-primary-500/50 transition-all">
        <div className="flex flex-col h-full">
          {/* Header: Avatar + Basic Info */}
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar with activity indicator */}
            <Link to={`/u/${user.id}`} className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-medium text-gray-400">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Activity Indicator */}
              {isRecentlyActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-status-active rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Activity size={8} className="text-white" />
                </div>
              )}
            </Link>

            {/* Name and Location */}
            <div className="flex-1 min-w-0">
              <Link to={`/u/${user.id}`}>
                <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                  {user.displayName}
                </h4>
              </Link>
              {user.profile?.location && (
                <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  <MapPin size={12} />
                  <span className="truncate">{user.profile.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-grow">
              {user.profile.bio}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
            {user.droneCount !== undefined && (
              <div className="flex items-center gap-1">
                <Plane size={14} />
                <span className="font-mono">{user.droneCount}</span>
                <span className="text-xs">機体</span>
              </div>
            )}
            {user.followersCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span className="font-mono">{user.followersCount}</span>
                <span className="text-xs">フォロワー</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
            <FollowButton targetUserId={user.id} size="sm" className="flex-1" />
            <Link
              to={`/u/${user.id}`}
              className="btn-outline text-sm px-3 py-1.5"
            >
              プロフィール
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for lists
export function UserCardCompact({
  user,
  className,
}: {
  user: User
  className?: string
}) {
  return (
    <Link
      to={`/u/${user.id}`}
      className={cn(
        'flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
          {user.displayName}
        </p>
        {user.profile?.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.profile.location}
          </p>
        )}
      </div>
    </Link>
  )
}
