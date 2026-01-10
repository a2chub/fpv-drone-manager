import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface MediaCommentFormProps {
  onSubmit: (content: string) => void
  isSubmitting?: boolean
  placeholder?: string
}

export function MediaCommentForm({
  onSubmit,
  isSubmitting = false,
  placeholder = 'コメントを入力...',
}: MediaCommentFormProps) {
  const { user, isAuthenticated } = useAuth()
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    onSubmit(content.trim())
    setContent('')
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
        コメントするにはログインしてください
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {user?.displayName.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 dark:disabled:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isSubmitting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
