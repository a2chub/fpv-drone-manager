import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, MapPin, Activity, Filter, X } from 'lucide-react'

export type UserFilterType = 'popular' | 'recent' | 'nearby' | 'active'

interface FilterTab {
  id: UserFilterType
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const filterTabs: FilterTab[] = [
  { id: 'popular', label: '人気', icon: TrendingUp },
  { id: 'recent', label: '新着', icon: Clock },
  { id: 'nearby', label: '近く', icon: MapPin },
  { id: 'active', label: 'アクティブ', icon: Activity },
]

interface UserFilterBarProps {
  activeFilter: UserFilterType
  onFilterChange: (filter: UserFilterType) => void
  className?: string
}

export function UserFilterBar({
  activeFilter,
  onFilterChange,
  className,
}: UserFilterBarProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
      {filterTabs.map((tab) => {
        const isActive = activeFilter === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterBg"
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon size={16} />
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Advanced filter panel (expandable)
interface AdvancedFilterPanelProps {
  isOpen: boolean
  onToggle: () => void
  filters: {
    hasAvatar?: boolean
    hasDrones?: boolean
    minFollowers?: number
  }
  onFiltersChange: (filters: AdvancedFilterPanelProps['filters']) => void
}

export function AdvancedFilterPanel({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
}: AdvancedFilterPanelProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
          isOpen || activeFilterCount > 0
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <Filter size={16} />
        <span>詳細フィルター</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              詳細フィルター
            </h4>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Has Avatar */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasAvatar || false}
                onChange={(e) =>
                  onFiltersChange({ ...filters, hasAvatar: e.target.checked || undefined })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                プロフィール写真あり
              </span>
            </label>

            {/* Has Drones */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasDrones || false}
                onChange={(e) =>
                  onFiltersChange({ ...filters, hasDrones: e.target.checked || undefined })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                機体登録あり
              </span>
            </label>

            {/* Min Followers */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                最小フォロワー数
              </label>
              <select
                value={filters.minFollowers || 0}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minFollowers: Number(e.target.value) || undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                <option value={0}>指定なし</option>
                <option value={5}>5人以上</option>
                <option value={10}>10人以上</option>
                <option value={50}>50人以上</option>
                <option value={100}>100人以上</option>
              </select>
            </div>
          </div>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange({})}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              すべてクリア
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
