import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'

const PUBLIC_USER_QUERY_KEY = 'publicUser'
const PUBLIC_DRONES_QUERY_KEY = 'publicDrones'
const PUBLIC_RACES_QUERY_KEY = 'publicRaces'
const PUBLIC_DRONE_QUERY_KEY = 'publicDrone'
const PUBLIC_RACE_QUERY_KEY = 'publicRace'
const PUBLIC_EVENT_HISTORY_QUERY_KEY = 'publicEventHistory'

/**
 * 公開ユーザー情報を取得するフック
 */
export function usePublicUser(userId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_USER_QUERY_KEY, userId],
    queryFn: () => publicService.getPublicUser(userId!),
    enabled: !!userId,
  })
}

/**
 * 公開機体一覧を取得するフック
 */
export function usePublicDrones(userId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_DRONES_QUERY_KEY, userId],
    queryFn: () => publicService.getPublicDrones(userId!),
    enabled: !!userId,
  })
}

/**
 * 公開レース一覧を取得するフック
 */
export function usePublicRaces(userId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_RACES_QUERY_KEY, userId],
    queryFn: () => publicService.getPublicRaces(userId!),
    enabled: !!userId,
  })
}

/**
 * 公開機体詳細を取得するフック
 */
export function usePublicDrone(userId: string | undefined, droneId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_DRONE_QUERY_KEY, userId, droneId],
    queryFn: () => publicService.getPublicDrone(userId!, droneId!),
    enabled: !!userId && !!droneId,
  })
}

/**
 * 公開レース詳細を取得するフック
 */
export function usePublicRace(userId: string | undefined, raceId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_RACE_QUERY_KEY, userId, raceId],
    queryFn: () => publicService.getPublicRace(userId!, raceId!),
    enabled: !!userId && !!raceId,
  })
}

/**
 * 公開イベント参加履歴を取得するフック
 */
export function usePublicEventHistory(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: [PUBLIC_EVENT_HISTORY_QUERY_KEY, userId],
    queryFn: () => publicService.getPublicEventHistory(userId!),
    enabled: !!userId && enabled,
  })
}
