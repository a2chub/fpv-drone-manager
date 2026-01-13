import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useIsFollowing, useFollow, useUnfollow } from '@/hooks/useFollow'

interface FollowButtonProps {
  targetUserId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function FollowButton({ targetUserId, className = '', size = 'md' }: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const { data: isFollowing, isLoading: isCheckingFollow } = useIsFollowing(targetUserId)
  const followMutation = useFollow()
  const unfollowMutation = useUnfollow()

  // 自分自身は表示しない
  if (!isAuthenticated || user?.id === targetUserId) {
    return null
  }

  const isLoading = isCheckingFollow || followMutation.isPending || unfollowMutation.isPending

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync(targetUserId)
    } else {
      await followMutation.mutateAsync(targetUserId)
    }
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          sizeClasses[size],
          'font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50',
          className
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            処理中...
          </span>
        ) : (
          'フォロー中'
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        'font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50',
        className
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          処理中...
        </span>
      ) : (
        'フォローする'
      )}
    </button>
  )
}
