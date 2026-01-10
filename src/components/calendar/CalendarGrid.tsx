import { CalendarDay } from './CalendarDay'
import {
  generateCalendarDays,
  getDateKey,
  isToday,
  isInMonth,
  WEEKDAY_LABELS,
  isSameDay,
} from '@/utils/calendarUtils'
import type { CalendarEvent, EventsByDate } from '@/types'

interface CalendarGridProps {
  year: number
  month: number
  eventsByDate: EventsByDate
  selectedDate: Date | null
  onDateClick: (date: Date, events: CalendarEvent[]) => void
}

export function CalendarGrid({
  year,
  month,
  eventsByDate,
  selectedDate,
  onDateClick,
}: CalendarGridProps) {
  const days = generateCalendarDays(year, month)

  const handleDayClick = (date: Date) => {
    const dateKey = getDateKey(date)
    const events = eventsByDate.get(dateKey) || []
    onDateClick(date, events)
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* 曜日ヘッダー */}
      {WEEKDAY_LABELS.map((label, index) => (
        <div
          key={label}
          className={`
            text-center text-xs font-medium py-2
            ${index === 0
              ? 'text-red-500 dark:text-red-400'
              : index === 6
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }
          `}
        >
          {label}
        </div>
      ))}

      {/* 日付グリッド（6週間分 = 42日） */}
      {days.map((date) => {
        const dateKey = getDateKey(date)
        const events = eventsByDate.get(dateKey) || []
        const isCurrentMonth = isInMonth(date, year, month)
        const isTodayDate = isToday(date)
        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

        return (
          <CalendarDay
            key={dateKey}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isToday={isTodayDate}
            isSelected={isSelected}
            events={events}
            onClick={() => handleDayClick(date)}
          />
        )
      })}
    </div>
  )
}
