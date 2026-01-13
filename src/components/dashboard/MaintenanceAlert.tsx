import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, X, ChevronRight, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { MaintenanceAlert as AlertType } from '@/hooks/useMaintenanceStatus'

export interface MaintenanceAlertBannerProps {
  alerts: AlertType[]
  className?: string
  maxVisible?: number
  dismissible?: boolean
}

export function MaintenanceAlertBanner({
  alerts,
  className,
  maxVisible = 3,
  dismissible = true,
}: MaintenanceAlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const visibleAlerts = alerts
    .filter((alert) => !dismissedIds.has(alert.id))
    .slice(0, maxVisible)

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]))
  }

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onDismiss={dismissible ? () => handleDismiss(alert.id) : undefined}
          />
        ))}
      </AnimatePresence>

      {alerts.length > maxVisible && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          他 {alerts.length - maxVisible} 件のアラートがあります
        </p>
      )}
    </div>
  )
}

interface AlertItemProps {
  alert: AlertType
  onDismiss?: () => void
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const config = {
    high: {
      icon: AlertTriangle,
      bg: 'bg-status-danger/10',
      border: 'border-status-danger/30',
      text: 'text-status-danger',
      iconBg: 'bg-status-danger/20',
    },
    medium: {
      icon: AlertCircle,
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      text: 'text-status-warning',
      iconBg: 'bg-status-warning/20',
    },
    low: {
      icon: Info,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/20',
    },
  }

  const style = config[alert.priority]
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border',
        style.bg,
        style.border
      )}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-lg flex-shrink-0', style.iconBg)}>
        <Icon size={16} className={style.text} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/drones/${alert.droneId}`}
            className={cn(
              'font-medium text-sm hover:underline',
              style.text
            )}
          >
            {alert.droneName}
          </Link>
          {alert.type === 'overdue' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-status-danger/20 text-status-danger">
              期限超過
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {alert.message}
        </p>
      </div>

      {/* Action */}
      <Link
        to={`/drones/${alert.droneId}`}
        className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
          'hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors',
          style.text
        )}
      >
        確認
        <ChevronRight size={12} />
      </Link>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <X size={14} className="text-gray-400" />
        </button>
      )}
    </motion.div>
  )
}

// Compact alert for dashboard header
export function MaintenanceAlertCompact({
  alerts,
  className,
}: {
  alerts: AlertType[]
  className?: string
}) {
  const highPriorityCount = alerts.filter((a) => a.priority === 'high').length
  const mediumPriorityCount = alerts.filter((a) => a.priority === 'medium').length

  if (alerts.length === 0) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-xs text-status-active',
        className
      )}>
        <Wrench size={14} />
        <span>すべての機体が正常です</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {highPriorityCount > 0 && (
        <div className="flex items-center gap-1.5 text-status-danger">
          <AlertTriangle size={14} />
          <span className="text-xs font-medium">{highPriorityCount}件の緊急</span>
        </div>
      )}
      {mediumPriorityCount > 0 && (
        <div className="flex items-center gap-1.5 text-status-warning">
          <AlertCircle size={14} />
          <span className="text-xs font-medium">{mediumPriorityCount}件の注意</span>
        </div>
      )}
    </div>
  )
}
