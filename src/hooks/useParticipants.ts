import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { participantService } from '@/services/participantService'
import { eventService } from '@/services/eventService'
import { trackEvent, AnalyticsEvents } from '@/lib/analytics'
import type { ParticipantFormData, RegistrationType, ParticipantStatus } from '@/types/event'

const PARTICIPANTS_QUERY_KEY = 'participants'

/**
 * イベントの参加者一覧を取得
 */
export function useParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: [PARTICIPANTS_QUERY_KEY, eventId],
    queryFn: () => participantService.getByEvent(eventId!),
    enabled: !!eventId,
  })
}

/**
 * 自分の参加情報を取得
 */
export function useMyParticipation(eventId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [PARTICIPANTS_QUERY_KEY, eventId, 'my'],
    queryFn: () => participantService.getByUser(eventId!, user!.id),
    enabled: !!eventId && !!user,
  })
}

/**
 * イベントに参加登録
 */
export function useJoinEvent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      data,
      registrationType,
    }: {
      eventId: string
      data: ParticipantFormData
      registrationType: RegistrationType
    }) => {
      if (!user) throw new Error('User not authenticated')

      const participantId = await participantService.create(
        eventId,
        {
          id: user.id,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        data,
        registrationType
      )

      // 自由参加の場合のみカウント+1（承認制はpendingなのでカウントしない）
      if (registrationType === 'open') {
        await eventService.incrementParticipantCount(eventId, 1)
      }

      return participantId
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId, 'my'],
      })
      // GA4: イベント参加を追跡
      trackEvent(AnalyticsEvents.JOIN_EVENT, { event_id: variables.eventId })
    },
  })
}

/**
 * 参加者を承認
 */
export function useApproveParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      participantId,
    }: {
      eventId: string
      participantId: string
    }) => {
      await participantService.approve(eventId, participantId)
      // 承認時にカウント+1
      await eventService.incrementParticipantCount(eventId, 1)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      // GA4: 参加者承認を追跡
      trackEvent(AnalyticsEvents.APPROVE_PARTICIPANT, {
        event_id: variables.eventId,
        participant_id: variables.participantId,
      })
    },
  })
}

/**
 * 参加者を拒否
 */
export function useRejectParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      participantId,
    }: {
      eventId: string
      participantId: string
    }) => participantService.reject(eventId, participantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      // GA4: 参加者拒否を追跡
      trackEvent(AnalyticsEvents.REJECT_PARTICIPANT, {
        event_id: variables.eventId,
        participant_id: variables.participantId,
      })
    },
  })
}

/**
 * 参加をキャンセル
 */
export function useCancelParticipation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      participantId,
      currentStatus,
    }: {
      eventId: string
      participantId: string
      currentStatus: ParticipantStatus
    }) => {
      await participantService.cancel(eventId, participantId)

      // approvedからのキャンセルのみカウント-1（pendingからは変化なし）
      if (currentStatus === 'approved') {
        await eventService.incrementParticipantCount(eventId, -1)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId, 'my'],
      })
      // GA4: イベント参加キャンセルを追跡
      trackEvent(AnalyticsEvents.LEAVE_EVENT, { event_id: variables.eventId })
    },
  })
}

/**
 * イベントに再参加（キャンセル・拒否後の復帰）
 */
export function useRejoinEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      participantId,
      registrationType,
    }: {
      eventId: string
      participantId: string
      registrationType: RegistrationType
    }) => {
      await participantService.rejoin(eventId, participantId, registrationType)

      // 自由参加の場合のみカウント+1（承認制はpendingなのでカウントしない）
      if (registrationType === 'open') {
        await eventService.incrementParticipantCount(eventId, 1)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId, 'my'],
      })
      // GA4: イベント再参加を追跡
      trackEvent(AnalyticsEvents.JOIN_EVENT, {
        event_id: variables.eventId,
        is_rejoin: true,
      })
    },
  })
}

/**
 * Race記録と参加を紐付け
 */
export function useLinkRaceToParticipation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      participantId,
      raceId,
    }: {
      eventId: string
      participantId: string
      raceId: string
    }) => participantService.linkRace(eventId, participantId, raceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTICIPANTS_QUERY_KEY, variables.eventId, 'my'],
      })
    },
  })
}
