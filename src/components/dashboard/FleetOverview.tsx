import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { DroneStatusBadge } from '@/components/ui/status-badge'
import { MiniGauge } from '@/components/ui/gauge-indicator'
import { motion } from 'framer-motion'
import { Plane, ChevronRight, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { DroneMaintenanceStatus } from '@/hooks/useMaintenanceStatus'

export interface FleetOverviewProps {
  droneStatuses: DroneMaintenanceStatus[]
  className?: string
  maxItems?: number
}

export function FleetOverview({
  droneStatuses,
  className,
  maxItems = 6,
}: FleetOverviewProps) {
  const displayDrones = droneStatuses.slice(0, maxItems)

  if (displayDrones.length === 0) {
    return (
      <div className={cn('panel-card text-center py-8', className)}>
        <Plane size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">機体が登録されていません</p>
        <Link
          to="/drones/new"
          className="inline-block mt-3 text-sm text-primary-500 hover:text-primary-600"
        >
          最初の機体を登録する →
        </Link>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-card-header mb-0">機体一覧</h3>
        <Link
          to="/drones"
          className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          すべて見る
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayDrones.map((status, index) => (
          <FleetDroneCard key={status.drone.id} status={status} index={index} />
        ))}
      </div>
    </div>
  )
}

interface FleetDroneCardProps {
  status: DroneMaintenanceStatus
  index: number
}

function FleetDroneCard({ status, index }: FleetDroneCardProps) {
  const { drone, healthScore, lastMaintenanceDate, daysSinceLastMaintenance } = status

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/drones/${drone.id}`}
        className="block panel-card p-4 hover:border-primary-500/50 transition-all group"
      >
        <div className="flex items-start gap-3">
          {/* Drone Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">
                {drone.name}
              </h4>
              <DroneStatusBadge status={drone.status} />
            </div>

            {/* Health Gauge */}
            <div className="mt-2">
              <MiniGauge value={healthScore} />
            </div>

            {/* Last Maintenance */}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {lastMaintenanceDate ? (
                <>
                  <span className="flex items-center gap-1">
                    <Wrench size={12} />
                    {format(lastMaintenanceDate, 'M/d', { locale: ja })}
                  </span>
                  {daysSinceLastMaintenance !== null && (
                    <span className={cn(
                      'font-mono',
                      daysSinceLastMaintenance > 60 && 'text-status-warning',
                      daysSinceLastMaintenance > 90 && 'text-status-danger'
                    )}>
                      {daysSinceLastMaintenance}日前
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">整備記録なし</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Compact list view
export function FleetList({
  droneStatuses,
  className,
}: {
  droneStatuses: DroneMaintenanceStatus[]
  className?: string
}) {
  return (
    <div className={cn('divide-y divide-gray-100 dark:divide-gray-700', className)}>
      {droneStatuses.map((status) => (
        <Link
          key={status.drone.id}
          to={`/drones/${status.drone.id}`}
          className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 -mx-2 rounded-lg transition-colors"
        >
          {/* Mini Image */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            {status.drone.mainImageUrl ? (
              <img
                src={status.drone.mainImageUrl}
                alt={status.drone.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Plane size={16} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {status.drone.name}
            </p>
            <MiniGauge value={status.healthScore} className="mt-1" />
          </div>

          {/* Status */}
          <DroneStatusBadge status={status.drone.status} />
        </Link>
      ))}
    </div>
  )
}
