import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plane, Calendar, Users, TrendingUp } from 'lucide-react'
import { useRecentPublicDrones, useUpcomingEvents } from '@/hooks/useActivity'
import { usePopularUsers } from '@/hooks/useUserSearch'

type HighlightType = 'drones' | 'events' | 'pilots'

interface HighlightSlide {
  type: HighlightType
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
}

const slides: HighlightSlide[] = [
  { type: 'drones', title: '注目のビルド', icon: Plane, color: 'from-primary-500 to-primary-600' },
  { type: 'events', title: '今後のイベント', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { type: 'pilots', title: '人気パイロット', icon: Users, color: 'from-pink-500 to-pink-600' },
]

export interface CommunityHighlightsProps {
  className?: string
  autoPlay?: boolean
  interval?: number
}

export function CommunityHighlights({
  className,
  autoPlay = true,
  interval = 5000,
}: CommunityHighlightsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: recentDrones } = useRecentPublicDrones(4)
  const { data: upcomingEvents } = useUpcomingEvents(4)
  const { data: popularUsers } = usePopularUsers(4)

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval])

  const currentSlide = slides[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            コミュニティハイライト
          </h2>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-primary-500 w-4'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6" hover={false}>
              {/* Slide Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  currentSlide.color
                )}>
                  <currentSlide.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentSlide.title}
                </h3>
              </div>

              {/* Slide Content */}
              {currentSlide.type === 'drones' && (
                <DroneHighlights drones={recentDrones || []} />
              )}
              {currentSlide.type === 'events' && (
                <EventHighlights events={upcomingEvents || []} />
              )}
              {currentSlide.type === 'pilots' && (
                <PilotHighlights pilots={popularUsers || []} />
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  )
}

// Drone Highlights Component
function DroneHighlights({ drones }: { drones: Array<{ id: string; name: string; mainImageUrl?: string | null; userId: string }> }) {
  if (drones.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        公開されている機体がありません
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {drones.map((drone) => (
        <Link
          key={drone.id}
          to={`/u/${drone.userId}/drones/${drone.id}`}
          className="group"
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2">
            {drone.mainImageUrl ? (
              <img
                src={drone.mainImageUrl}
                alt={drone.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Plane size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
            {drone.name}
          </p>
        </Link>
      ))}
    </div>
  )
}

// Event Highlights Component
function EventHighlights({ events }: { events: Array<{ id: string; title: string; date: { toDate: () => Date }; location?: string }> }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        今後のイベントがありません
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {events.slice(0, 3).map((event) => (
        <Link
          key={event.id}
          to={`/e/${event.id}`}
          className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {event.date.toDate().toLocaleDateString('ja-JP', { month: 'short' })}
            </span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {event.date.toDate().getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
              {event.title}
            </p>
            {event.location && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {event.location}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// Pilot Highlights Component
function PilotHighlights({ pilots }: { pilots: Array<{ id: string; displayName?: string; photoURL?: string | null }> }) {
  if (pilots.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        パイロットがいません
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {pilots.map((pilot) => (
        <Link
          key={pilot.id}
          to={`/u/${pilot.id}`}
          className="text-center group"
        >
          <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2 ring-2 ring-transparent group-hover:ring-primary-500 transition-all">
            {pilot.photoURL ? (
              <img
                src={pilot.photoURL}
                alt={pilot.displayName || 'Pilot'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                {pilot.displayName?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
            {pilot.displayName || 'Unknown'}
          </p>
        </Link>
      ))}
    </div>
  )
}
