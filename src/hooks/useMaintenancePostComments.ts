import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { maintenancePostService } from '@/services/maintenancePostService'
import type { MaintenancePostComment } from '@/types/maintenancePost'

// Query Keys
const MAINTENANCE_POST_COMMENTS_QUERY_KEY = 'maintenancePostComments'
const MAINTENANCE_POST_QUERY_KEY = 'maintenancePost'
const MAINTENANCE_POSTS_QUERY_KEY = 'maintenancePosts'

/**
 * 投稿のコメント一覧を取得するフック
 */
export function useMaintenancePostComments(postId: string) {
  return useQuery({
    queryKey: [MAINTENANCE_POST_COMMENTS_QUERY_KEY, postId],
    queryFn: () => maintenancePostService.getComments(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1分
  })
}

/**
 * コメント追加ミューテーションフック
 */
export function useAddComment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      const userData = {
        displayName: user.displayName,
        photoURL: user.photoURL,
      }

      return maintenancePostService.addComment(postId, user.id, userData, content)
    },
    onSuccess: (_, variables) => {
      // コメント一覧を無効化
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POST_COMMENTS_QUERY_KEY, variables.postId],
      })
      // 投稿のコメント数も更新されるため、投稿データも無効化
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POST_QUERY_KEY, variables.postId],
      })
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POSTS_QUERY_KEY],
      })
    },
    onError: (error) => {
      console.error('Failed to add comment:', error)
    },
  })
}

/**
 * コメント削除ミューテーションフック
 */
export function useDeleteComment() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      return maintenancePostService.deleteComment(postId, commentId, user.id)
    },
    onMutate: async ({ postId, commentId }) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({
        queryKey: [MAINTENANCE_POST_COMMENTS_QUERY_KEY, postId],
      })

      // 以前の状態を保存
      const previousComments = queryClient.getQueryData<MaintenancePostComment[]>([
        MAINTENANCE_POST_COMMENTS_QUERY_KEY,
        postId,
      ])

      // 楽観的にコメントを削除状態にマーク
      if (previousComments) {
        queryClient.setQueryData<MaintenancePostComment[]>(
          [MAINTENANCE_POST_COMMENTS_QUERY_KEY, postId],
          previousComments.filter((comment) => comment.id !== commentId)
        )
      }

      return { previousComments }
    },
    onError: (error, variables, context) => {
      // エラー時は以前の状態に戻す
      if (context?.previousComments) {
        queryClient.setQueryData(
          [MAINTENANCE_POST_COMMENTS_QUERY_KEY, variables.postId],
          context.previousComments
        )
      }
      console.error('Failed to delete comment:', error)
    },
    onSettled: (_, __, variables) => {
      // 最終的にサーバーの状態で再検証
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POST_COMMENTS_QUERY_KEY, variables.postId],
      })
      // 投稿のコメント数も更新されるため、投稿データも無効化
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POST_QUERY_KEY, variables.postId],
      })
      queryClient.invalidateQueries({
        queryKey: [MAINTENANCE_POSTS_QUERY_KEY],
      })
    },
  })
}

/**
 * コメント削除権限をチェックするヘルパーフック
 */
export function useCanDeleteComment(postOwnerId: string) {
  const { user } = useAuth()

  return (comment: MaintenancePostComment) => {
    if (!user) return false
    return maintenancePostService.canDeleteComment(comment, user.id, postOwnerId)
  }
}
