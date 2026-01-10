import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaCommentService } from '@/services/mediaCommentService'
import { useAuth } from '@/contexts/AuthContext'
import type { MediaCommentFormData } from '@/types'

export function useMediaComments(
  eventId: string | undefined,
  postId: string | undefined,
  mediaIndex: number
) {
  return useQuery({
    queryKey: ['mediaComments', eventId, postId, mediaIndex],
    queryFn: () => mediaCommentService.getByMedia(eventId!, postId!, mediaIndex),
    enabled: !!eventId && !!postId && mediaIndex !== undefined && mediaIndex >= 0,
  })
}

export function usePostMediaComments(
  eventId: string | undefined,
  postId: string | undefined
) {
  return useQuery({
    queryKey: ['mediaComments', eventId, postId],
    queryFn: () => mediaCommentService.getByPost(eventId!, postId!),
    enabled: !!eventId && !!postId,
  })
}

export function useCreateMediaComment(
  eventId: string | undefined,
  postId: string | undefined,
  mediaIndex: number
) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: MediaCommentFormData) => {
      if (!eventId || !postId || !user) {
        throw new Error('Missing required parameters')
      }
      return mediaCommentService.create(
        eventId,
        postId,
        mediaIndex,
        {
          id: user.id,
          displayName: user.displayName,
          photoURL: user.photoURL || null,
        },
        data
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mediaComments', eventId, postId, mediaIndex],
      })
      queryClient.invalidateQueries({
        queryKey: ['mediaComments', eventId, postId],
      })
    },
  })
}

export function useDeleteMediaComment(
  eventId: string | undefined,
  postId: string | undefined
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => {
      if (!eventId || !postId) {
        throw new Error('Missing required parameters')
      }
      return mediaCommentService.delete(eventId, postId, commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mediaComments', eventId, postId],
      })
    },
  })
}
