import { useQuery } from '@tanstack/react-query'
import { publicEventService } from '@/services/publicEventService'

const PUBLIC_EVENTS_QUERY_KEY = 'publicEvents'

// 公開データは5分間キャッシュ
const STALE_TIME = 1000 * 60 * 5

/**
 * 公開イベント一覧を取得するフック
 */
export function usePublicEvents() {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY],
    queryFn: () => publicEventService.getPublicEvents(),
    staleTime: STALE_TIME,
  })
}

/**
 * 今後のイベント一覧を取得するフック
 */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, 'upcoming'],
    queryFn: () => publicEventService.getUpcomingEvents(),
    staleTime: STALE_TIME,
  })
}

/**
 * 過去のイベント一覧を取得するフック
 */
export function usePastEvents() {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, 'past'],
    queryFn: () => publicEventService.getPastEvents(),
    staleTime: STALE_TIME,
  })
}

/**
 * 公開イベント詳細を取得するフック
 */
export function usePublicEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, eventId],
    queryFn: () => publicEventService.getPublicEventById(eventId!),
    enabled: !!eventId,
    staleTime: STALE_TIME,
  })
}

/**
 * 承認済み参加者一覧を取得するフック
 */
export function usePublicEventParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, eventId, 'participants'],
    queryFn: () => publicEventService.getApprovedParticipants(eventId!),
    enabled: !!eventId,
    staleTime: STALE_TIME,
  })
}

/**
 * 公開投稿一覧を取得するフック
 */
export function usePublicEventPosts(eventId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_EVENTS_QUERY_KEY, eventId, 'posts'],
    queryFn: () => publicEventService.getPublicPosts(eventId!),
    enabled: !!eventId,
    staleTime: STALE_TIME,
  })
}
