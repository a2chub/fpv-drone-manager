import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMaintenancePost, useToggleLike, useHasLiked } from '@/hooks/useMaintenancePosts'
import { useAuth } from '@/contexts/AuthContext'
import { MaintenancePostCard, MaintenancePostCardSkeleton } from '@/components/maintenance/MaintenancePostCard'

export function PublicMaintenancePost() {
  const { userId, postId } = useParams<{ userId: string; postId: string }>()
  const { isAuthenticated } = useAuth()
  const { data: post, isLoading, error } = useMaintenancePost(postId ?? '')
  const toggleLikeMutation = useToggleLike()
  const { data: isLiked } = useHasLiked(postId ?? '')

  const handleLikeToggle = () => {
    if (postId && isAuthenticated) {
      toggleLikeMutation.mutate(postId)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to={`/u/${userId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>プロフィールに戻る</span>
          </Link>
        </div>
        <MaintenancePostCardSkeleton />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to={`/u/${userId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>プロフィールに戻る</span>
          </Link>
        </div>
        <div className="card p-12 text-center">
          <p className="text-red-500">整備記録が見つかりません</p>
          <Link to={`/u/${userId}`} className="btn-primary mt-4 inline-block">
            プロフィールに戻る
          </Link>
        </div>
      </div>
    )
  }

  // Check if the post is public
  if (!post.isPublic) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to={`/u/${userId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>プロフィールに戻る</span>
          </Link>
        </div>
        <div className="card p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">この整備記録は非公開です</p>
          <Link to={`/u/${userId}`} className="btn-primary mt-4 inline-block">
            プロフィールに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/u/${userId}`}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>プロフィールに戻る</span>
        </Link>
      </div>

      <MaintenancePostCard
        post={post}
        isLiked={isAuthenticated ? (isLiked ?? false) : false}
        onLikeToggle={isAuthenticated ? handleLikeToggle : undefined}
        showComments={false}
      />
    </div>
  )
}
