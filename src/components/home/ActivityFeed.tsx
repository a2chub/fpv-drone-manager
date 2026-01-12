import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllActivity, useFollowingActivity } from '@/hooks/useActivity'
import { useAuth } from '@/contexts/AuthContext'
import type { Drone } from '@/types'

type FeedTab = 'all' | 'following'

export function ActivityFeed() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<FeedTab>('all')

  const { data: allDrones = [], isLoading: isLoadingAll } = useAllActivity(20)
  const { data: followingDrones = [], isLoading: isLoadingFollowing } = useFollowingActivity(20)

  const drones = activeTab === 'all' ? allDrones : followingDrones
  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingFollowing

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP')
  }

  return (
    <div className="card dark:bg-gray-800">
      {/* タブ */}
      {isAuthenticated && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            フォロー中
          </button>
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          最近の更新
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : drones.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {activeTab === 'following'
              ? 'フォロー中のパイロットの更新がありません'
              : '最近の更新がありません'}
          </p>
        ) : (
          <div className="space-y-4">
            {drones.map((drone: Drone) => (
              <Link
                key={drone.id}
                to={`/u/${drone.userId}/drones/${drone.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* ドローン画像 */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {drone.mainImageUrl ? (
                    <img
                      src={drone.mainImageUrl}
                      alt={drone.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {drone.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {drone.specifications?.frameSize || 'サイズ未設定'}
                    {drone.specifications?.weight && ` / ${drone.specifications.weight}g`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {drone.updatedAt && formatDate(drone.updatedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
