import type { PartHistory } from '@/types'
import { HISTORY_TYPES } from '@/types'

interface PartHistoryCardProps {
  history: PartHistory
  onEdit?: () => void
  onDelete?: () => void
}

export function PartHistoryCard({
  history,
  onEdit,
  onDelete,
}: PartHistoryCardProps) {
  const typeLabel =
    HISTORY_TYPES.find((t) => t.value === history.type)?.label || history.type

  const formatDate = (timestamp: { toDate: () => Date }) => {
    try {
      const date = timestamp.toDate()
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '不明な日付'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'usage':
        return 'bg-blue-100 text-blue-700'
      case 'repair':
        return 'bg-red-100 text-red-700'
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-700'
      case 'replacement':
        return 'bg-green-100 text-green-700'
      case 'note':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(history.type)}`}
            >
              {typeLabel}
            </span>
            {history.isPublic && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
                公開
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{history.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{formatDate(history.date)}</p>
          {history.description && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {history.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
      </div>
    </div>
  )
}
