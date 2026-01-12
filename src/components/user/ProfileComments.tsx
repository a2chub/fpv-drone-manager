import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProfileComments,
  useCreateProfileComment,
  useDeleteProfileComment,
  useCanDeleteComment,
} from '@/hooks/useProfileComments'
import type { ProfileComment } from '@/types'

interface ProfileCommentsProps {
  profileUserId: string
}

export function ProfileComments({ profileUserId }: ProfileCommentsProps) {
  const { user, isAuthenticated } = useAuth()
  const { data: comments = [], isLoading } = useProfileComments(profileUserId)
  const createMutation = useCreateProfileComment(profileUserId)
  const deleteMutation = useDeleteProfileComment(profileUserId)
  const canDeleteComment = useCanDeleteComment(profileUserId)

  const [newComment, setNewComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    await createMutation.mutateAsync({ content: newComment.trim() })
    setNewComment('')
  }

  const handleDelete = async (comment: ProfileComment) => {
    const { canDelete, reason } = canDeleteComment(comment)
    if (!canDelete || !reason) return

    if (window.confirm('このコメントを削除しますか？')) {
      await deleteMutation.mutateAsync({ commentId: comment.id, reason })
    }
  }

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="card p-6 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        コメント {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* コメント入力フォーム */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {user?.displayName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを書く..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || createMutation.isPending}
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? '投稿中...' : '投稿'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">コメントするにはログインが必要です</p>
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
            ログイン
          </Link>
        </div>
      )}

      {/* コメント一覧 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          まだコメントがありません
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const { canDelete } = canDeleteComment(comment)
            return (
              <div key={comment.id} className="flex gap-3">
                <Link
                  to={`/u/${comment.authorId}`}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0"
                >
                  {comment.authorPhotoURL ? (
                    <img src={comment.authorPhotoURL} alt={comment.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {comment.authorName?.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/u/${comment.authorId}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-primary-500"
                    >
                      {comment.authorName}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment)}
                      disabled={deleteMutation.isPending}
                      className="mt-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
