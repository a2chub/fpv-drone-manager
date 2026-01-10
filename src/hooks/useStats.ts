import { useQuery } from '@tanstack/react-query'
import { droneService } from '@/services/droneService'
import { partService } from '@/services/partService'
import { raceService } from '@/services/raceService'
import { useAuth } from '@/contexts/AuthContext'
import type { Drone } from '@/types'

export interface Stats {
  droneCount: number
  partCount: number
  raceCount: number
  publicDroneCount: number
  publicRaceCount: number
  recentDrones: Drone[]
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

      return {
        droneCount: drones.length,
        partCount,
        raceCount,
        publicDroneCount,
        publicRaceCount,
        recentDrones,
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  })
}
