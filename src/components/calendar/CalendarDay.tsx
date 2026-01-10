import { motion } from 'framer-motion'
import { EventIndicator } from './EventIndicator'
import type { CalendarEvent } from '@/types'

interface CalendarDayProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
  onClick: () => void
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  events,
  onClick,
}: CalendarDayProps) {
  const day = date.getDate()
  const hasEvents = events.length > 0

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-start
        w-full aspect-square p-1 rounded-lg transition-colors
        ${isCurrentMonth
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-400 dark:text-gray-600'
        }
        ${isToday
          ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
          : ''
        }
        ${isSelected && !isToday
          ? 'bg-gray-100 dark:bg-gray-700'
          : ''
        }
        ${hasEvents && isCurrentMonth
          ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
      `}
      disabled={!hasEvents}
    >
      <span
        className={`
          text-sm font-medium
          ${isToday ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}
        `}
      >
        {day}
      </span>
      <EventIndicator events={events} />
    </motion.button>
  )
}
