import { Link } from 'react-router-dom'
import type { User } from '@/types'

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Link
      to={`/u/${user.id}`}
      className="card block overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Avatar and Name */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate hover:text-primary-500 transition-colors">
              {user.displayName}
            </h4>
            {user.profile?.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.profile?.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {user.profile.bio}
          </p>
        )}
      </div>
    </Link>
  )
}
