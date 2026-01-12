import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileCommentService } from '@/services/profileCommentService'
import { useAuth } from '@/contexts/AuthContext'
import type { CreateProfileCommentInput, CommentDeleteReason } from '@/types'

const PROFILE_COMMENTS_QUERY_KEY = 'profileComments'

// プロフィールのコメント一覧を取得
export function useProfileComments(profileUserId: string | undefined) {
  return useQuery({
    queryKey: [PROFILE_COMMENTS_QUERY_KEY, profileUserId],
    queryFn: () => profileCommentService.getComments(profileUserId!),
    enabled: !!profileUserId,
    staleTime: 2 * 60 * 1000, // 2分
  })
}

// コメントを投稿
export function useCreateProfileComment(profileUserId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProfileCommentInput) =>
      profileCommentService.createComment(
        profileUserId,
        user!.id,
        user!.displayName,
        user!.photoURL,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_COMMENTS_QUERY_KEY, profileUserId] })
    },
  })
}

// コメントを削除（論理削除）
export function useDeleteProfileComment(profileUserId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: string; reason: CommentDeleteReason }) =>
      profileCommentService.deleteComment(profileUserId, commentId, user!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_COMMENTS_QUERY_KEY, profileUserId] })
    },
  })
}

// コメント削除権限をチェックするヘルパー
export function useCanDeleteComment(profileUserId: string) {
  const { user } = useAuth()

  return (comment: { authorId: string }) => {
    if (!user) return { canDelete: false }
    return profileCommentService.canDelete(
      comment as any,
      user.id,
      profileUserId
    )
  }
}
