import { cn } from '@/lib/utils'
import { GaugeIndicator } from '@/components/ui/gauge-indicator'
import { StatusBadge } from '@/components/ui/status-badge'
import { motion } from 'framer-motion'
import { Plane, AlertTriangle, CheckCircle } from 'lucide-react'

export interface DroneStatusGaugeProps {
  healthScore: number
  droneCount: number
  activeCount: number
  needsAttentionCount: number
  className?: string
}

export function DroneStatusGauge({
  healthScore,
  droneCount,
  activeCount,
  needsAttentionCount,
  className,
}: DroneStatusGaugeProps) {
  const getHealthLabel = () => {
    if (healthScore >= 80) return '良好'
    if (healthScore >= 60) return '注意'
    if (healthScore >= 40) return '要整備'
    return '警告'
  }

  const getHealthColor = () => {
    if (healthScore >= 80) return 'text-status-active'
    if (healthScore >= 60) return 'text-status-warning'
    return 'text-status-danger'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('panel-card', className)}
    >
      <div className="panel-card-header">Fleet Status</div>

      <div className="flex items-center gap-6">
        {/* Main Gauge */}
        <div className="flex-shrink-0">
          <GaugeIndicator
            value={healthScore}
            size="lg"
            label="%"
            showValue={true}
          />
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn('text-2xl font-bold font-mono', getHealthColor())}>
                {getHealthLabel()}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              フリート健康度
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
                <Plane size={14} />
                <span className="font-mono font-semibold">{droneCount}</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">総機体</span>
            </div>

            <div className="text-center p-2 rounded-lg bg-status-active/5">
              <div className="flex items-center justify-center gap-1 text-status-active">
                <CheckCircle size={14} />
                <span className="font-mono font-semibold">{activeCount}</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">稼働中</span>
            </div>

            <div className="text-center p-2 rounded-lg bg-status-warning/5">
              <div className="flex items-center justify-center gap-1 text-status-warning">
                <AlertTriangle size={14} />
                <span className="font-mono font-semibold">{needsAttentionCount}</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">要注意</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for sidebar or smaller spaces
export function DroneStatusGaugeCompact({
  healthScore,
  className,
}: {
  healthScore: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <GaugeIndicator
        value={healthScore}
        size="sm"
        showValue={true}
      />
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          フリート状態
        </p>
        <StatusBadge
          variant={healthScore >= 80 ? 'active' : healthScore >= 60 ? 'warning' : 'danger'}
          size="sm"
        >
          {healthScore >= 80 ? '良好' : healthScore >= 60 ? '注意' : '要整備'}
        </StatusBadge>
      </div>
    </div>
  )
}
