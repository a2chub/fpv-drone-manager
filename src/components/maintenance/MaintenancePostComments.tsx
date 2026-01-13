import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Send, Trash2, User, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMaintenancePostComments,
  useAddComment,
  useDeleteComment,
  useCanDeleteComment,
} from '@/hooks/useMaintenancePostComments'
import type { MaintenancePostComment } from '@/types/maintenancePost'
import { cn } from '@/lib/utils'

interface MaintenancePostCommentsProps {
  postId: string
  postOwnerId: string
  className?: string
}

/**
 * 整備記録投稿のコメントセクションコンポーネント
 */
export function MaintenancePostComments({
  postId,
  postOwnerId,
  className,
}: MaintenancePostCommentsProps) {
  const { user, isAuthenticated } = useAuth()
  const { data: comments = [], isLoading } = useMaintenancePostComments(postId)
  const addCommentMutation = useAddComment()
  const deleteCommentMutation = useDeleteComment()
  const canDeleteComment = useCanDeleteComment(postOwnerId)

  const [newComment, setNewComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await addCommentMutation.mutateAsync({
        postId,
        content: newComment.trim(),
      })
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleDelete = async (comment: MaintenancePostComment) => {
    if (!canDeleteComment(comment)) return

    if (window.confirm('このコメントを削除しますか?')) {
      try {
        await deleteCommentMutation.mutateAsync({
          postId,
          commentId: comment.id,
        })
      } catch (error) {
        console.error('Failed to delete comment:', error)
      }
    }
  }

  const formatDate = (timestamp: { toDate: () => Date }) => {
    try {
      return formatDistanceToNow(timestamp.toDate(), {
        addSuffix: true,
        locale: ja,
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            コメント
            {comments.length > 0 && (
              <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({comments.length})
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Comment Input Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 ring-2 ring-transparent">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを書く..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm"
              />
              <div className="mt-2 flex justify-end">
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-primary-300 disabled:to-primary-400 dark:disabled:from-primary-700 dark:disabled:to-primary-800 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-primary-500/20 disabled:shadow-none flex items-center gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>投稿中...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>投稿</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            コメントするにはログインが必要です
          </p>
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            ログイン
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              まだコメントがありません
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              最初のコメントを投稿してみましょう
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {comments.map((comment) => {
                const canDelete = canDeleteComment(comment)
                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3"
                  >
                    {/* Author Avatar */}
                    <Link
                      to={`/u/${comment.authorId}`}
                      className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary-500/50 transition-all"
                    >
                      {comment.authorPhotoURL ? (
                        <img
                          src={comment.authorPhotoURL}
                          alt={comment.authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                    </Link>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/u/${comment.authorId}`}
                            className="font-medium text-sm text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                          >
                            {comment.authorName}
                          </Link>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>

                      {/* Delete Button */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment)}
                          disabled={deleteCommentMutation.isPending}
                          className="mt-1 ml-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          <span>削除</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/**
 * コメントセクションのスケルトンローダー
 */
export function MaintenancePostCommentsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-pulse',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Comments Skeleton */}
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
