import { useQuery } from '@tanstack/react-query'
import { droneService } from '@/services/droneService'
import { partService } from '@/services/partService'
import { raceService } from '@/services/raceService'
import { followService } from '@/services/followService'
import { activityService } from '@/services/activityService'
import { useAuth } from '@/contexts/AuthContext'
import type { Drone } from '@/types'

export interface Stats {
  droneCount: number
  partCount: number
  raceCount: number
  publicDroneCount: number
  publicRaceCount: number
  recentDrones: Drone[]
  followingCount: number
  upcomingEventCount: number
}

const STATS_QUERY_KEY = 'stats'

export function useStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [STATS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<Stats> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // 機体一覧を取得
      const drones = await droneService.getAll(user.id)

      // 各機体のパーツ数を並列で取得
      const partCounts = await Promise.all(
        drones.map(async (drone) => {
          const parts = await partService.getAll(user.id, drone.id)
          return parts.length
        })
      )

      // パーツ総数を計算
      const partCount = partCounts.reduce((sum, count) => sum + count, 0)

      // 公開中の機体数
      const publicDroneCount = drones.filter((drone) => drone.isPublic).length

      // 最近登録した機体（最新3件、createdAtで降順ソート済み）
      const recentDrones = drones.slice(0, 3)

      // レース一覧を取得
      const races = await raceService.getAll(user.id)
      const raceCount = races.length
      const publicRaceCount = races.filter((race) => race.isPublic).length

      // フォロー数を取得
      let followingCount = 0
      try {
        const followingIds = await followService.getFollowingIds(user.id)
        followingCount = followingIds.length
      } catch {
        // フォロー機能が未実装の場合は0
      }

      // 今後のイベント数を取得
      let upcomingEventCount = 0
      try {
        const events = await activityService.getUpcomingEvents(5)
        upcomingEventCount = events.length
      } catch {
        // イベント機能が未実装の場合は0
      }

      return {
        droneCount: drones.length,
        partCount,
        raceCount,
        publicDroneCount,
        publicRaceCount,
        recentDrones,
        followingCount,
        upcomingEventCount,
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  })
}
