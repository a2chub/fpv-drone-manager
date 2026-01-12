import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/services/eventService'
import { participantService } from '@/services/participantService'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent, AnalyticsEvents } from '@/lib/analytics'
import type { RaceEventFormData, EventStatus } from '@/types/event'

const EVENTS_QUERY_KEY = 'events'
const USER_PARTICIPATIONS_QUERY_KEY = 'userParticipations'

/**
 * 全公開イベント一覧を取得
 */
export function useEvents() {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY],
    queryFn: () => eventService.getAll(),
  })
}

/**
 * 自分が主催するイベント一覧を取得
 */
export function useMyEvents() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, 'organizer', user?.id],
    queryFn: () => eventService.getByOrganizer(user!.id),
    enabled: !!user,
  })
}

/**
 * 単一イベントを取得
 */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, eventId],
    queryFn: () => eventService.getById(eventId!),
    enabled: !!eventId,
  })
}

/**
 * イベントを作成
 */
export function useCreateEvent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RaceEventFormData) =>
      eventService.create(data, {
        id: user!.id,
        displayName: user!.displayName || 'Unknown',
        photoURL: user!.photoURL || null,
      }),
    onSuccess: (eventId, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
      // GA4: イベント作成を追跡
      trackEvent(AnalyticsEvents.CREATE_EVENT, {
        event_id: eventId,
        event_category: variables.category,
      })
    },
  })
}

/**
 * イベントを更新
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<RaceEventFormData> }) =>
      eventService.update(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, variables.eventId] })
    },
  })
}

/**
 * イベントを削除
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventService.delete(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
      // GA4: イベント削除を追跡
      trackEvent(AnalyticsEvents.DELETE_EVENT, { event_id: eventId })
    },
  })
}

/**
 * イベントのステータスを更新
 */
export function useUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) =>
      eventService.updateStatus(eventId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, variables.eventId] })
    },
  })
}

/**
 * ユーザーの参加イベント履歴を取得
 */
export function useUserParticipations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [USER_PARTICIPATIONS_QUERY_KEY, user?.id],
    queryFn: () => participantService.getUserParticipations(user!.id),
    enabled: !!user,
  })
}

/**
 * 参加イベントの公開設定を更新
 */
export function useUpdateParticipationVisibility() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      eventId,
      participantId,
      isPublic,
    }: {
      eventId: string
      participantId: string
      isPublic: boolean
    }) => participantService.updateVisibility(eventId, participantId, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PARTICIPATIONS_QUERY_KEY, user?.id] })
    },
  })
}
