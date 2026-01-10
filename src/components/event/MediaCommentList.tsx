import type { MediaComment } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface MediaCommentListProps {
  comments: MediaComment[]
  onDelete?: (commentId: string) => void
  isDeleting?: boolean
}

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MediaCommentList({
  comments,
  onDelete,
  isDeleting,
}: MediaCommentListProps) {
  const { user } = useAuth()

  if (comments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          コメントはまだありません
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.authorPhotoURL ? (
              <img
                src={comment.authorPhotoURL}
                alt={comment.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {comment.authorName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.authorName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Delete button */}
              {user?.id === comment.authorId && onDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  disabled={isDeleting}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  title="削除"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
