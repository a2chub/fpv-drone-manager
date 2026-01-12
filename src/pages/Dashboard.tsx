import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStats } from '@/hooks/useStats'
import { Calendar } from '@/components/calendar'
import { ActivityFeed, UpcomingEvents } from '@/components/home'

export function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading, error } = useStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          こんにちは、{user?.displayName}さん
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">機体やレースの情報を管理しましょう</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link
          to="/drones/new"
          className="card p-6 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">新しい機体を登録</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">機体の情報を追加します</p>
            </div>
          </div>
        </Link>

        <Link
          to="/races/new"
          className="card p-6 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">レースを記録</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">参加レースを記録します</p>
            </div>
          </div>
        </Link>

        <Link
          to="/drones"
          className="card p-6 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">機体一覧</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">登録済み機体を確認</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          {isLoading ? (
            <div className="h-9 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.droneCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">登録機体</p>
        </div>
        <div className="card p-4 text-center">
          {isLoading ? (
            <div className="h-9 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.partCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">登録パーツ</p>
        </div>
        <div className="card p-4 text-center">
          {isLoading ? (
            <div className="h-9 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.raceCount ?? 0}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">レース記録</p>
        </div>
        <div className="card p-4 text-center">
          {isLoading ? (
            <div className="h-9 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(stats?.publicDroneCount ?? 0) + (stats?.publicRaceCount ?? 0)}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">公開中</p>
        </div>
      </div>

      {/* Activity Calendar */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          活動カレンダー
        </h2>
        <Calendar />
      </section>

      {/* Activity Feed & Upcoming Events */}
      <section className="mt-8">
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
      </section>

      {/* Recent Drones */}
      {stats && stats.recentDrones.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近登録した機体</h2>
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
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{drone.name}</p>
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
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            統計情報の取得に失敗しました。再度お試しください。
          </p>
        </div>
      )}
    </div>
  )
}
