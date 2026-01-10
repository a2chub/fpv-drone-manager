import { Link } from 'react-router-dom'
import type { Race } from '@/types'
import { RACE_CATEGORIES } from '@/types'

interface RaceCardProps {
  race: Race
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
}

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function RaceCard({ race, onEdit, onDelete, onTogglePublic }: RaceCardProps) {
  const categoryLabel =
    RACE_CATEGORIES.find((c) => c.value === race.category)?.label || race.category

  const rankDisplay =
    race.result.rank !== null
      ? race.result.totalParticipants !== null
        ? `${race.result.rank}位 / ${race.result.totalParticipants}人中`
        : `${race.result.rank}位`
      : null

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
          {race.images && race.images.length > 0 ? (
            <img
              src={race.images[0]}
              alt={race.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {categoryLabel}
            </span>
            {race.isPublic && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                公開
              </span>
            )}
          </div>
          <Link to={`/races/${race.id}`}>
            <h4 className="font-medium text-gray-900 dark:text-white truncate hover:text-primary-500 transition-colors">
              {race.name}
            </h4>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(race.date)}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{race.location}</p>
            {rankDisplay && (
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{rankDisplay}</span>
            )}
          </div>
          {race.usedDroneName && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              使用機体: {race.usedDroneName}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onTogglePublic && (
            <button
              onClick={onTogglePublic}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={race.isPublic ? '非公開にする' : '公開する'}
            >
              {race.isPublic ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
