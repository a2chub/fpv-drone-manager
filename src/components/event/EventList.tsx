import type { RaceEvent } from '@/types'
import { EventCard } from './EventCard'

interface EventListProps {
  events: RaceEvent[]
  onEdit?: (event: RaceEvent) => void
  onDelete?: (event: RaceEvent) => void
  emptyMessage?: string
}

export function EventList({
  events,
  onEdit,
  onDelete,
  emptyMessage = 'イベントがありません',
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="event-list">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit ? () => onEdit(event) : undefined}
          onDelete={onDelete ? () => onDelete(event) : undefined}
        />
      ))}
    </div>
  )
}
