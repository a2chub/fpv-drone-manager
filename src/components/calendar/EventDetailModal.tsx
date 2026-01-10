import { AnimatePresence, motion } from 'framer-motion'
import { X, Trophy, Package, Wrench, Plane } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EVENT_COLORS, EVENT_LABELS } from '@/types/calendar'
import type { CalendarEvent } from '@/types'
import { formatDateJapanese, getWeekdayLabel } from '@/utils/calendarUtils'

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  events: CalendarEvent[]
}

const EVENT_ICONS = {
  race: Trophy,
  partPurchase: Package,
  partHistory: Wrench,
  droneCreated: Plane,
} as const

export function EventDetailModal({
  isOpen,
  onClose,
  date,
  events,
}: EventDetailModalProps) {
  const navigate = useNavigate()

  const handleEventClick = (event: CalendarEvent) => {
    const { metadata } = event

    switch (metadata.type) {
      case 'race':
        navigate(`/races/${metadata.raceId}`)
        break
      case 'partPurchase':
      case 'partHistory':
        navigate(`/drones/${metadata.droneId}/parts/${metadata.partId}`)
        break
      case 'droneCreated':
        navigate(`/drones/${metadata.droneId}`)
        break
    }

    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDateJapanese(date)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ({getWeekdayLabel(date)})
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event List */}
            <div className="px-5 py-4 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  この日にイベントはありません
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => {
                    const Icon = EVENT_ICONS[event.type]
                    const colors = EVENT_COLORS[event.type]

                    return (
                      <motion.button
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEventClick(event)}
                        className={`w-full text-left p-4 rounded-lg border-l-4 ${colors.border}
                                    ${colors.bgLight} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colors.bg} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bgLight} ${colors.text}`}>
                                {EVENT_LABELS[event.type]}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {event.title}
                            </h4>
                            {renderEventDetails(event)}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function renderEventDetails(event: CalendarEvent) {
  const { metadata } = event

  switch (metadata.type) {
    case 'race':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {metadata.location}
          {metadata.rank && ` - ${metadata.rank}位`}
        </p>
      )
    case 'partPurchase':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {metadata.droneName} / {metadata.purchaseStore}
        </p>
      )
    case 'partHistory':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {metadata.droneName} / {metadata.partName}
        </p>
      )
    case 'droneCreated':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          カテゴリ: {metadata.category}
        </p>
      )
    default:
      return null
  }
}
