import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMaintenancePost,
  useDeleteMaintenancePost,
  useToggleLike,
  useHasLiked,
} from '@/hooks/useMaintenancePosts'
import {
  useMaintenancePostComments,
  useAddComment,
  useDeleteComment,
  useCanDeleteComment,
} from '@/hooks/useMaintenancePostComments'
import { MaintenancePostCard, MaintenancePostCardSkeleton } from '@/components/maintenance/MaintenancePostCard'

/**
 * 整備記録投稿詳細ページ
 * `/maintenance/:postId` でアクセス
 */
export function MaintenancePostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: post, isLoading: postLoading, error: postError } = useMaintenancePost(postId || '')
  const { data: isLiked } = useHasLiked(postId || '')
  const { data: comments, isLoading: commentsLoading } = useMaintenancePostComments(postId || '')

  const deletePostMutation = useDeleteMaintenancePost()
  const toggleLikeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const deleteCommentMutation = useDeleteComment()
  const canDeleteComment = useCanDeleteComment(post?.userId || '')

  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(true)

  // 自分の投稿かどうか
  const isOwner = user?.id === post?.userId

  const handleDelete = async () => {
    if (!postId) return
    if (!window.confirm('この投稿を削除しますか？この操作は取り消せません。')) return

    try {
      await deletePostMutation.mutateAsync(postId)
      navigate('/maintenance')
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleLikeToggle = async () => {
    if (!postId) return
    try {
      await toggleLikeMutation.mutateAsync(postId)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId || !commentText.trim()) return

    try {
      await addCommentMutation.mutateAsync({
        postId,
        content: commentText.trim(),
      })
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!postId) return
    if (!window.confirm('このコメントを削除しますか？')) return

    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  // ローディング状態
  if (postLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>戻る</span>
          </button>
        </div>
        <MaintenancePostCardSkeleton />
      </div>
    )
  }

  // エラー状態または投稿が見つからない
  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            投稿が見つかりません
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            この投稿は削除されたか、存在しません。
          </p>
          <button
            onClick={() => navigate('/maintenance')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            投稿一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={() => navigate('/maintenance')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>投稿一覧</span>
        </button>

        {/* オーナーアクション */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/maintenance/${postId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Pencil size={16} />
              <span>編集</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {deletePostMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>削除</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* 投稿カード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MaintenancePostCard
          post={post}
          isLiked={isLiked}
          onLikeToggle={handleLikeToggle}
          onCommentClick={() => setShowComments(!showComments)}
          showComments={false}
        />
      </motion.div>

      {/* コメントセクション */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* コメントヘッダー */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle size={20} />
                コメント ({post.commentCount})
              </h3>
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                {showComments ? '閉じる' : '表示'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* コメント入力 */}
                {user && (
                  <form onSubmit={handleAddComment} className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="コメントを入力..."
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 dark:disabled:bg-primary-700 text-white rounded-full transition-colors flex items-center gap-1.5"
                        >
                          {addCommentMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* コメント一覧 */}
                <div className="p-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          canDelete={canDeleteComment(comment)}
                          onDelete={() => handleDeleteComment(comment.id)}
                          isDeleting={deleteCommentMutation.isPending}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      まだコメントはありません
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * コメントアイテムコンポーネント
 */
interface CommentItemProps {
  comment: {
    id: string
    authorId: string
    authorName: string
    authorPhotoURL: string | null
    content: string
    createdAt: { toDate: () => Date }
  }
  canDelete: boolean
  onDelete: () => void
  isDeleting: boolean
}

function CommentItem({ comment, canDelete, onDelete, isDeleting }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(comment.createdAt.toDate(), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <div className="flex gap-3 group">
      <Link
        to={`/u/${comment.authorId}`}
        className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"
      >
        {comment.authorPhotoURL ? (
          <img
            src={comment.authorPhotoURL}
            alt={comment.authorName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={14} className="text-gray-400" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <Link
              to={`/u/${comment.authorId}`}
              className="font-medium text-sm text-gray-900 dark:text-white hover:text-primary-500 transition-colors"
            >
              {comment.authorName}
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="mt-1 ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>
    </div>
  )
}
