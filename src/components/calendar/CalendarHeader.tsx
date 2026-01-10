import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { MONTH_LABELS } from '@/utils/calendarUtils'

interface CalendarHeaderProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {year}年 {MONTH_LABELS[month]}
        </h3>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          今日
        </button>
        <button
          onClick={onPrevMonth}
          className="p-1.5 text-gray-600 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="前の月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNextMonth}
          className="p-1.5 text-gray-600 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="次の月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
