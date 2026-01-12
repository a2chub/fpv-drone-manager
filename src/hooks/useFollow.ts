import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { followService } from '@/services/followService'
import { useAuth } from '@/contexts/AuthContext'

const FOLLOW_QUERY_KEY = 'follow'
const FOLLOWING_QUERY_KEY = 'following'
const FOLLOWERS_QUERY_KEY = 'followers'

// フォロー状態をチェック
export function useIsFollowing(targetUserId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [FOLLOW_QUERY_KEY, user?.id, targetUserId],
    queryFn: () => followService.isFollowing(user!.id, targetUserId!),
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  })
}

// フォロー中のユーザーIDリストを取得
export function useFollowingIds(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery({
    queryKey: [FOLLOWING_QUERY_KEY, targetUserId],
    queryFn: () => followService.getFollowingIds(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// フォロワーのユーザーIDリストを取得
export function useFollowerIds(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery({
    queryKey: [FOLLOWERS_QUERY_KEY, targetUserId],
    queryFn: () => followService.getFollowerIds(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
  })
}

// フォローする
export function useFollow() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetUserId: string) => followService.follow(user!.id, targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: [FOLLOW_QUERY_KEY, user?.id, targetUserId] })
      queryClient.invalidateQueries({ queryKey: [FOLLOWING_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({ queryKey: [FOLLOWERS_QUERY_KEY, targetUserId] })
    },
  })
}

// フォロー解除
export function useUnfollow() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetUserId: string) => followService.unfollow(user!.id, targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: [FOLLOW_QUERY_KEY, user?.id, targetUserId] })
      queryClient.invalidateQueries({ queryKey: [FOLLOWING_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({ queryKey: [FOLLOWERS_QUERY_KEY, targetUserId] })
    },
  })
}
