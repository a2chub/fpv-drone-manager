import { cn } from '@/lib/utils'
import { Timeline, type TimelineEntryType } from '@/components/ui/timeline-entry'
import { motion } from 'framer-motion'
import { History, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PartHistory } from '@/types'

interface MaintenanceHistoryEntry extends PartHistory {
  droneName: string
  droneId: string
}

export interface MaintenanceTimelineProps {
  history: MaintenanceHistoryEntry[]
  className?: string
  maxItems?: number
  showHeader?: boolean
}

export function MaintenanceTimeline({
  history,
  className,
  maxItems = 5,
  showHeader = true,
}: MaintenanceTimelineProps) {
  // Convert PartHistory to Timeline entries
  const entries = history.slice(0, maxItems).map((item) => ({
    type: item.type as TimelineEntryType,
    title: item.title,
    description: item.description,
    date: item.date.toDate(),
    partName: item.droneName,
    images: item.images,
    onClick: () => {
      // Navigate to drone detail
      window.location.href = `/drones/${item.droneId}`
    },
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('panel-card', className)}
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-navy-500" />
            <h3 className="panel-card-header mb-0">整備履歴</h3>
          </div>
          {history.length > maxItems && (
            <Link
              to="/drones"
              className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              すべて見る
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}

      <Timeline
        entries={entries}
        emptyMessage="整備記録がありません"
      />
    </motion.div>
  )
}

// Summary stats for maintenance history
export function MaintenanceStats({
  totalCount,
  repairCount,
  adjustmentCount,
  replacementCount,
  className,
}: {
  totalCount: number
  repairCount: number
  adjustmentCount: number
  replacementCount: number
  className?: string
}) {
  const stats = [
    { label: '総整備', value: totalCount, color: 'text-gray-600 dark:text-gray-300' },
    { label: '修理', value: repairCount, color: 'text-status-danger' },
    { label: '調整', value: adjustmentCount, color: 'text-status-warning' },
    { label: '交換', value: replacementCount, color: 'text-status-active' },
  ]

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
        >
          <p className={cn('font-mono text-lg font-semibold', stat.color)}>
            {stat.value}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
