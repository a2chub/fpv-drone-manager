import { useQuery } from '@tanstack/react-query'
import { activityService } from '@/services/activityService'
import { useFollowingIds } from './useFollow'

const ACTIVITY_QUERY_KEY = 'activity'
const UPCOMING_EVENTS_QUERY_KEY = 'upcomingEvents'
const RECENT_DRONES_QUERY_KEY = 'recentDrones'
const COMBINED_FEED_QUERY_KEY = 'combinedFeed'
const MAINTENANCE_FEED_QUERY_KEY = 'maintenanceFeed'

// 全体のアクティビティ（公開ドローンの更新）
export function useAllActivity(limit = 20) {
  return useQuery({
    queryKey: [ACTIVITY_QUERY_KEY, 'all', limit],
    queryFn: () => activityService.getAllActivity(limit),
    staleTime: 2 * 60 * 1000, // 2分
  })
}

// フォロー中のユーザーのアクティビティ
export function useFollowingActivity(limit = 20) {
  const { data: followingIds = [], isLoading: isLoadingFollowing } = useFollowingIds()

  return useQuery({
    queryKey: [ACTIVITY_QUERY_KEY, 'following', followingIds, limit],
    queryFn: () => activityService.getFollowingActivity(followingIds, limit),
    enabled: !isLoadingFollowing && followingIds.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

// 今後のイベント
export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: [UPCOMING_EVENTS_QUERY_KEY, limit],
    queryFn: () => activityService.getUpcomingEvents(limit),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// 最近追加/更新された公開ドローン
export function useRecentPublicDrones(limit = 10) {
  return useQuery({
    queryKey: [RECENT_DRONES_QUERY_KEY, limit],
    queryFn: () => activityService.getRecentPublicDrones(limit),
    staleTime: 2 * 60 * 1000,
  })
}

// 統合フィード（ドローン更新 + 整備投稿）- 全体
export function useCombinedFeed(limit = 20) {
  return useQuery({
    queryKey: [COMBINED_FEED_QUERY_KEY, 'all', limit],
    queryFn: () => activityService.getAllCombinedFeed(limit),
    staleTime: 2 * 60 * 1000,
  })
}

// フォロー中ユーザーの統合フィード
export function useFollowingCombinedFeed(limit = 20) {
  const { data: followingIds = [], isLoading: isLoadingFollowing } = useFollowingIds()

  return useQuery({
    queryKey: [COMBINED_FEED_QUERY_KEY, 'following', followingIds, limit],
    queryFn: () => activityService.getCombinedFeed(followingIds, limit),
    enabled: !isLoadingFollowing && followingIds.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

// 整備投稿フィード（全体）
export function useMaintenanceFeed(limit = 20) {
  return useQuery({
    queryKey: [MAINTENANCE_FEED_QUERY_KEY, 'all', limit],
    queryFn: () => activityService.getRecentMaintenancePosts(limit),
    staleTime: 2 * 60 * 1000,
  })
}

// フォロー中ユーザーの整備投稿フィード
export function useFollowingMaintenanceFeed(limit = 20) {
  const { data: followingIds = [], isLoading: isLoadingFollowing } = useFollowingIds()

  return useQuery({
    queryKey: [MAINTENANCE_FEED_QUERY_KEY, 'following', followingIds, limit],
    queryFn: () => activityService.getFollowingMaintenancePosts(followingIds, limit),
    enabled: !isLoadingFollowing && followingIds.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}
