import { Link } from 'react-router-dom'
import { useUpcomingEvents } from '@/hooks/useActivity'
import { Calendar, ChevronRight, MapPin, Users } from 'lucide-react'
import type { RaceEvent } from '@/types'

interface UpcomingEventsProps {
  maxItems?: number
  showHeader?: boolean
}

export function UpcomingEvents({ maxItems = 5, showHeader = true }: UpcomingEventsProps) {
  const { data: events = [], isLoading } = useUpcomingEvents(maxItems)

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
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              今後のイベント
            </h3>
          </div>
          <Link
            to="/events"
            className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            すべて見る
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            予定されているイベントはありません
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: RaceEvent) => (
            <Link
              key={event.id}
              to={`/e/${event.id}`}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              {/* 日付バッジ */}
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/10 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  {event.date.toDate().toLocaleDateString('ja-JP', { month: 'short' })}
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400 leading-none">
                  {event.date.toDate().getDate()}
                </span>
              </div>

              {/* イベント情報 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                  {event.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {getEventCategoryLabel(event.category)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={10} />
                      {event.location}
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <Users size={10} />
                  {event.participantCount || 0}人参加予定
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
