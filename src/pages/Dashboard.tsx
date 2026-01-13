import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStats } from '@/hooks/useStats'
import { useMaintenanceStatus, useRecentMaintenanceHistory } from '@/hooks/useMaintenanceStatus'
import { Calendar } from '@/components/calendar'
import { ActivityFeed, UpcomingEvents } from '@/components/home'
import {
  DroneStatusGauge,
  FleetOverview,
  MaintenanceTimeline,
  MaintenanceAlertBanner,
  MaintenanceAlertCompact,
} from '@/components/dashboard'
import { StatCard, QuickStatBar } from '@/components/ui/stat-card'
import { motion } from 'framer-motion'
import { Plus, Zap, Calendar as CalendarIcon, Wrench, Plane, Flag, Globe } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats()
  const { data: maintenanceData, isLoading: maintenanceLoading } = useMaintenanceStatus()
  const { data: recentHistory } = useRecentMaintenanceHistory(5)

  const isLoading = statsLoading || maintenanceLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            こんにちは、{user?.displayName}さん
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600 dark:text-gray-400">
              機体の状態を確認しましょう
            </p>
            {maintenanceData && (
              <MaintenanceAlertCompact alerts={maintenanceData.alerts} />
            )}
          </div>
        </div>

        {/* Quick Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/drones/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>機体を登録</span>
          </Link>
          <Link
            to="/races/new"
            className="btn-secondary flex items-center gap-2"
          >
            <Zap size={18} />
            <span>フライト記録</span>
          </Link>
          <Link
            to="/maintenance/new"
            className="btn-secondary flex items-center gap-2"
          >
            <Wrench size={18} />
            <span>整備を投稿</span>
          </Link>
        </div>
      </motion.div>

      {/* Maintenance Alerts */}
      {maintenanceData && maintenanceData.alerts.length > 0 && (
        <MaintenanceAlertBanner alerts={maintenanceData.alerts} maxVisible={2} />
      )}

      {/* Fleet Status & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status Gauge */}
        <div className="lg:col-span-1">
          {maintenanceData ? (
            <DroneStatusGauge
              healthScore={maintenanceData.fleetHealthScore}
              droneCount={stats?.droneCount ?? 0}
              activeCount={maintenanceData.droneStatuses.filter(s => s.drone.status === 'active').length}
              needsAttentionCount={maintenanceData.dronesNeedingAttention}
            />
          ) : (
            <div className="panel-card h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="登録機体"
              value={stats?.droneCount ?? 0}
              icon={Plane}
              loading={isLoading}
              onClick={() => window.location.href = '/drones'}
            />
            <StatCard
              label="パーツ"
              value={stats?.partCount ?? 0}
              icon={Wrench}
              loading={isLoading}
            />
            <StatCard
              label="フライト記録"
              value={stats?.raceCount ?? 0}
              icon={Flag}
              loading={isLoading}
              onClick={() => window.location.href = '/races'}
            />
            <StatCard
              label="公開中"
              value={(stats?.publicDroneCount ?? 0) + (stats?.publicRaceCount ?? 0)}
              icon={Globe}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions (Mobile) */}
      <div className="md:hidden">
        <QuickStatBar
          items={[
            { label: '機体', value: stats?.droneCount ?? 0, icon: Plane, onClick: () => window.location.href = '/drones' },
            { label: 'パーツ', value: stats?.partCount ?? 0, icon: Wrench },
            { label: '記録', value: stats?.raceCount ?? 0, icon: Flag, onClick: () => window.location.href = '/races' },
          ]}
        />
        <div className="flex gap-3 mt-4">
          <Link to="/drones/new" className="btn-primary flex-1 justify-center">
            <Plus size={18} className="mr-2" />
            機体登録
          </Link>
          <Link to="/races/new" className="btn-secondary flex-1 justify-center">
            <Zap size={18} className="mr-2" />
            記録
          </Link>
          <Link to="/maintenance/new" className="btn-secondary flex-1 justify-center">
            <Wrench size={18} className="mr-2" />
            整備
          </Link>
        </div>
      </div>

      {/* Fleet Overview */}
      {maintenanceData && maintenanceData.droneStatuses.length > 0 && (
        <FleetOverview droneStatuses={maintenanceData.droneStatuses} maxItems={6} />
      )}

      {/* Activity Calendar & Maintenance Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Calendar */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={16} className="text-navy-500" />
            <h2 className="panel-card-header mb-0">活動カレンダー</h2>
          </div>
          <Calendar />
        </div>

        {/* Maintenance Timeline */}
        <div>
          {recentHistory.length > 0 ? (
            <MaintenanceTimeline history={recentHistory} maxItems={5} />
          ) : (
            <div className="panel-card h-full flex flex-col items-center justify-center text-center py-12">
              <Wrench size={40} className="mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">整備記録がありません</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                パーツの使用履歴や整備履歴を記録しましょう
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - 2/3 */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Upcoming Events - 1/3 */}
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* Recent Drones (Legacy - kept for compatibility) */}
      {stats && stats.recentDrones.length > 0 && maintenanceData?.droneStatuses.length === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            最近登録した機体
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentDrones.map((drone) => (
              <Link
                key={drone.id}
                to={`/drones/${drone.id}`}
                className="card p-4 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  {drone.mainImageUrl ? (
                    <img
                      src={drone.mainImageUrl}
                      alt={drone.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Plane size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {drone.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {drone.isPublic ? '公開中' : '非公開'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {statsError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            統計情報の取得に失敗しました。再度お試しください。
          </p>
        </div>
      )}
    </div>
  )
}
