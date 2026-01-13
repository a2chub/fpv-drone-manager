import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Plane, Clock, ChevronRight, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface EnhancedActivityCardProps {
  drone: {
    id: string
    name: string
    mainImageUrl?: string | null
    specifications?: {
      frameSize?: string
      weight?: string
    }
    updatedAt: { toDate: () => Date }
    userId: string
  }
  ownerName?: string
  ownerPhotoUrl?: string | null
  className?: string
  index?: number
}

export function EnhancedActivityCard({
  drone,
  ownerName,
  ownerPhotoUrl,
  className,
  index = 0,
}: EnhancedActivityCardProps) {
  const timeAgo = formatDistanceToNow(drone.updatedAt.toDate(), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(className)}
    >
      <Link
        to={`/u/${drone.userId}/drones/${drone.id}`}
        className="block panel-card p-4 hover:border-primary-500/50 transition-all group"
      >
        <div className="flex gap-4">
          {/* Drone Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            {drone.mainImageUrl ? (
              <img
                src={drone.mainImageUrl}
                alt={drone.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Plane size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Header */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
                {drone.name}
              </h3>

              {/* Owner Info */}
              {ownerName && (
                <div className="flex items-center gap-2 mt-1">
                  {ownerPhotoUrl ? (
                    <img
                      src={ownerPhotoUrl}
                      alt={ownerName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User size={12} className="text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ownerName}
                  </span>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 mt-2">
              {drone.specifications?.frameSize && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {drone.specifications.frameSize}
                </span>
              )}
              {drone.specifications?.weight && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {drone.specifications.weight}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock size={12} />
                {timeAgo}
              </span>
              <span className="text-xs text-primary-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                詳細を見る
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Compact version for sidebar
export function ActivityCardCompact({
  drone,
  className,
}: {
  drone: EnhancedActivityCardProps['drone']
  className?: string
}) {
  const timeAgo = formatDistanceToNow(drone.updatedAt.toDate(), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <Link
      to={`/u/${drone.userId}/drones/${drone.id}`}
      className={cn(
        'flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group',
        className
      )}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
        {drone.mainImageUrl ? (
          <img
            src={drone.mainImageUrl}
            alt={drone.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane size={16} className="text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
          {drone.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {timeAgo}
        </p>
      </div>
    </Link>
  )
}
