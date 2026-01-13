import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { maintenancePostService } from '@/services/maintenancePostService'
import { useFollowingIds } from './useFollow'
import type { MaintenancePostFormData, MaintenancePost } from '@/types/maintenancePost'

// Query Keys
const MAINTENANCE_POSTS_QUERY_KEY = 'maintenancePosts'
const MAINTENANCE_POST_QUERY_KEY = 'maintenancePost'
const MAINTENANCE_POST_LIKE_QUERY_KEY = 'maintenancePostLike'

/**
 * 公開投稿フィードを取得するフック
 */
export function usePublicMaintenancePosts(limit = 20) {
  return useQuery({
    queryKey: [MAINTENANCE_POSTS_QUERY_KEY, 'public', limit],
    queryFn: () => maintenancePostService.getPublicPosts(limit),
    staleTime: 2 * 60 * 1000, // 2分
  })
}

/**
 * フォロー中ユーザーの投稿を取得するフック
 */
export function useFollowingMaintenancePosts(limit = 20) {
  const { data: followingIds = [], isLoading: isLoadingFollowing } = useFollowingIds()

  return useQuery({
    queryKey: [MAINTENANCE_POSTS_QUERY_KEY, 'following', followingIds, limit],
    queryFn: () => maintenancePostService.getFollowingPosts(followingIds, limit),
    enabled: !isLoadingFollowing && followingIds.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * ユーザーの投稿一覧を取得するフック
 */
export function useUserMaintenancePosts(userId: string, limit = 20) {
  return useQuery({
    queryKey: [MAINTENANCE_POSTS_QUERY_KEY, 'user', userId, limit],
    queryFn: () => maintenancePostService.getPostsByUser(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * ユーザーの公開投稿一覧を取得するフック（プロフィール表示用）
 */
export function usePublicUserMaintenancePosts(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: [MAINTENANCE_POSTS_QUERY_KEY, 'publicUser', userId, limit],
    queryFn: () => maintenancePostService.getPublicPostsByUser(userId!, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * ドローン別投稿一覧を取得するフック
 */
export function useDroneMaintenancePosts(droneId: string, limit = 20) {
  return useQuery({
    queryKey: [MAINTENANCE_POSTS_QUERY_KEY, 'drone', droneId, limit],
    queryFn: () => maintenancePostService.getPostsByDrone(droneId, limit),
    enabled: !!droneId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * 単一投稿を取得するフック
 */
export function useMaintenancePost(postId: string) {
  return useQuery({
    queryKey: [MAINTENANCE_POST_QUERY_KEY, postId],
    queryFn: () => maintenancePostService.getPost(postId),
    enabled: !!postId,
  })
}

/**
 * 公開投稿を取得するフック（isPublic: true のみ）
 */
export function usePublicMaintenancePost(postId: string | undefined) {
  return useQuery({
    queryKey: [MAINTENANCE_POST_QUERY_KEY, 'public', postId],
    queryFn: () => maintenancePostService.getPublicPost(postId!),
    enabled: !!postId,
  })
}

/**
 * 投稿作成ミューテーションフック
 */
export function useCreateMaintenancePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      droneId,
      droneName,
      droneImageUrl,
      data,
    }: {
      droneId: string
      droneName: string
      droneImageUrl: string | null
      data: MaintenancePostFormData
    }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      const userData = {
        displayName: user.displayName,
        photoURL: user.photoURL,
      }

      const droneData = {
        id: droneId,
        name: droneName,
        imageUrl: droneImageUrl,
      }

      return maintenancePostService.createPost(user.id, userData, droneData, data)
    },
    onSuccess: () => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POSTS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error('Failed to create maintenance post:', error)
    },
  })
}

/**
 * 投稿更新ミューテーションフック
 */
export function useUpdateMaintenancePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string
      data: Partial<MaintenancePostFormData>
    }) => maintenancePostService.updatePost(postId, data),
    onSuccess: (_, variables) => {
      // 単一投稿とリストの両方を無効化
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POST_QUERY_KEY, variables.postId] })
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POSTS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error('Failed to update maintenance post:', error)
    },
  })
}

/**
 * 投稿削除ミューテーションフック
 */
export function useDeleteMaintenancePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => maintenancePostService.deletePost(postId),
    onSuccess: (_, postId) => {
      // 単一投稿とリストの両方を無効化
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POST_QUERY_KEY, postId] })
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POSTS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error('Failed to delete maintenance post:', error)
    },
  })
}

/**
 * いいねトグルミューテーションフック（楽観的更新付き）
 */
export function useToggleLike() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) {
        throw new Error('Authentication required')
      }
      return maintenancePostService.toggleLike(postId, user.id)
    },
    onMutate: async (postId: string) => {
      if (!user) return

      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: [MAINTENANCE_POST_LIKE_QUERY_KEY, postId, user.id] })
      await queryClient.cancelQueries({ queryKey: [MAINTENANCE_POST_QUERY_KEY, postId] })

      // 以前の状態を保存
      const previousLiked = queryClient.getQueryData<boolean>([
        MAINTENANCE_POST_LIKE_QUERY_KEY,
        postId,
        user.id,
      ])
      const previousPost = queryClient.getQueryData<MaintenancePost>([
        MAINTENANCE_POST_QUERY_KEY,
        postId,
      ])

      // 楽観的に状態を更新
      queryClient.setQueryData<boolean>(
        [MAINTENANCE_POST_LIKE_QUERY_KEY, postId, user.id],
        (old) => !old
      )

      // 投稿のいいね数も楽観的に更新
      if (previousPost) {
        const wasLiked = previousLiked ?? false
        queryClient.setQueryData<MaintenancePost>([MAINTENANCE_POST_QUERY_KEY, postId], {
          ...previousPost,
          likeCount: previousPost.likeCount + (wasLiked ? -1 : 1),
        })
      }

      return { previousLiked, previousPost }
    },
    onError: (error, postId, context) => {
      // エラー時は以前の状態に戻す
      if (context?.previousLiked !== undefined && user) {
        queryClient.setQueryData(
          [MAINTENANCE_POST_LIKE_QUERY_KEY, postId, user.id],
          context.previousLiked
        )
      }
      if (context?.previousPost) {
        queryClient.setQueryData([MAINTENANCE_POST_QUERY_KEY, postId], context.previousPost)
      }
      console.error('Failed to toggle like:', error)
    },
    onSettled: (_, __, postId) => {
      // 最終的にサーバーの状態で再検証
      if (user) {
        queryClient.invalidateQueries({
          queryKey: [MAINTENANCE_POST_LIKE_QUERY_KEY, postId, user.id],
        })
      }
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POST_QUERY_KEY, postId] })
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_POSTS_QUERY_KEY] })
    },
  })
}

/**
 * いいね状態をチェックするフック
 */
export function useHasLiked(postId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [MAINTENANCE_POST_LIKE_QUERY_KEY, postId, user?.id],
    queryFn: () => maintenancePostService.hasUserLiked(postId, user!.id),
    enabled: !!postId && !!user,
    staleTime: 30 * 1000, // 30秒
  })
}
