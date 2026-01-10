import type { CalendarEvent } from '@/types'
import { EVENT_COLORS } from '@/types'

interface EventIndicatorProps {
  events: CalendarEvent[]
  maxDisplay?: number
}

export function EventIndicator({ events, maxDisplay = 3 }: EventIndicatorProps) {
  if (events.length === 0) return null

  // イベントタイプごとにグループ化してユニークな色を取得
  const uniqueTypes = [...new Set(events.map((e) => e.type))]
  const displayTypes = uniqueTypes.slice(0, maxDisplay)
  const hasMore = uniqueTypes.length > maxDisplay

  return (
    <div className="flex items-center justify-center gap-0.5 mt-1">
      {displayTypes.map((type) => (
        <span
          key={type}
          className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[type].dot}`}
        />
      ))}
      {hasMore && (
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
      )}
    </div>
  )
}
