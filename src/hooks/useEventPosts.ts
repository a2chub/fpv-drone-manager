import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { eventPostService } from '@/services/eventPostService'
import { eventService } from '@/services/eventService'
import type { EventPostFormData } from '@/types/event'

const EVENT_POSTS_QUERY_KEY = 'eventPosts'

/**
 * イベントの投稿一覧を取得するフック
 */
export function useEventPosts(eventId: string | undefined) {
  return useQuery({
    queryKey: [EVENT_POSTS_QUERY_KEY, eventId],
    queryFn: () => eventPostService.getByEvent(eventId!),
    enabled: !!eventId,
  })
}

/**
 * 単一の投稿を取得するフック
 */
export function useEventPost(eventId: string | undefined, postId: string | undefined) {
  return useQuery({
    queryKey: [EVENT_POSTS_QUERY_KEY, eventId, postId],
    queryFn: () => eventPostService.getById(eventId!, postId!),
    enabled: !!eventId && !!postId,
  })
}

/**
 * 投稿を作成するフック
 */
export function useCreateEventPost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      data,
      isOrganizer,
    }: {
      eventId: string
      data: EventPostFormData
      isOrganizer: boolean
    }) => {
      const author = {
        id: user!.id,
        displayName: user!.displayName,
        photoURL: user!.photoURL,
      }
      const postId = await eventPostService.create(eventId, author, data, isOrganizer)
      await eventService.incrementPostCount(eventId, 1)
      return postId
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENT_POSTS_QUERY_KEY, variables.eventId] })
    },
  })
}

/**
 * 投稿を更新するフック
 */
export function useUpdateEventPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      postId,
      data,
    }: {
      eventId: string
      postId: string
      data: Partial<EventPostFormData>
    }) => eventPostService.update(eventId, postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENT_POSTS_QUERY_KEY, variables.eventId] })
      queryClient.invalidateQueries({
        queryKey: [EVENT_POSTS_QUERY_KEY, variables.eventId, variables.postId],
      })
    },
  })
}

/**
 * 投稿を削除するフック
 */
export function useDeleteEventPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, postId }: { eventId: string; postId: string }) => {
      await eventPostService.delete(eventId, postId)
      await eventService.incrementPostCount(eventId, -1)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EVENT_POSTS_QUERY_KEY, variables.eventId] })
    },
  })
}
