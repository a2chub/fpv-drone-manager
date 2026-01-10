import { useState, useCallback } from 'react'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { EventDetailModal } from './EventDetailModal'
import { useCalendarEventsByMonth } from '@/hooks/useCalendarEvents'
import { addMonths } from '@/utils/calendarUtils'
import type { CalendarEvent } from '@/types'

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const { eventsByDate, isLoading } = useCalendarEventsByMonth(year, month)

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, -1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }, [])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleDateClick = useCallback((date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date)
    setSelectedEvents(events)
    if (events.length > 0) {
      setIsModalOpen(true)
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <div className="card p-6">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          eventsByDate={eventsByDate}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
      )}

      {selectedDate && (
        <EventDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
          events={selectedEvents}
        />
      )}
    </div>
  )
}
