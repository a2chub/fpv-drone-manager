import { Link } from 'react-router-dom'
import { useUpcomingEvents } from '@/hooks/useActivity'
import type { RaceEvent } from '@/types'

export function UpcomingEvents() {
  const { data: events = [], isLoading } = useUpcomingEvents(5)

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return '今日'
    if (days === 1) return '明日'
    if (days < 7) return `${days}日後`

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const getEventCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      race: 'レース',
      freestyle: 'フリースタイル',
      meetup: '交流会',
      workshop: 'ワークショップ',
      other: 'その他',
    }
    return labels[category] || category
  }

  return (
    <div className="card dark:bg-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            今後のイベント
          </h2>
          <Link
            to="/events"
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            すべて見る
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            予定されているイベントはありません
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event: RaceEvent) => (
              <Link
                key={event.id}
                to={`/e/${event.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* 日付バッジ */}
                  <div className="flex-shrink-0 w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  {/* イベント情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {getEventCategoryLabel(event.category)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.location}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {event.participantCount || 0}人参加予定
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
