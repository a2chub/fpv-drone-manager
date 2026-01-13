import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  useCombinedFeed,
  useFollowingCombinedFeed,
} from '@/hooks/useActivity'
import { useAuth } from '@/contexts/AuthContext'
import { MaintenancePostCardCompact } from '@/components/maintenance/MaintenancePostCard'
import type { Drone } from '@/types'
import type { FeedItem, FeedFilter } from '@/types/feed'
import { FEED_FILTER_LABELS } from '@/types/feed'

type FeedTab = 'all' | 'following'

export function ActivityFeed() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<FeedTab>('all')
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')

  // Combined feed data (drones + maintenance posts)
  const { data: allCombinedFeed = [], isLoading: isLoadingAllCombined } = useCombinedFeed(20)
  const { data: followingCombinedFeed = [], isLoading: isLoadingFollowingCombined } = useFollowingCombinedFeed(20)

  // Determine which data to use based on tab
  const combinedFeed = activeTab === 'all' ? allCombinedFeed : followingCombinedFeed
  const isLoadingCombined = activeTab === 'all' ? isLoadingAllCombined : isLoadingFollowingCombined

  // Apply filter to combined feed
  const filteredFeed = useMemo(() => {
    if (feedFilter === 'all') {
      return combinedFeed
    }
    if (feedFilter === 'drones') {
      return combinedFeed.filter(item => item.type === 'drone_update')
    }
    if (feedFilter === 'maintenance') {
      return combinedFeed.filter(item => item.type === 'maintenance_post')
    }
    // events filter - for future use
    return combinedFeed.filter(item => item.type === 'event_post')
  }, [combinedFeed, feedFilter])

  const isLoading = isLoadingCombined

  const formatDate = useCallback((timestamp: { toDate: () => Date } | undefined) => {
    if (!timestamp) return ''
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
  }, [])

  // Filter options to display (exclude events for now if not used)
  const filterOptions: FeedFilter[] = ['all', 'drones', 'maintenance']

  // Render a drone feed item
  const renderDroneItem = useCallback((drone: Drone) => (
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
  ), [formatDate])

  // Render a combined feed item
  const renderFeedItem = useCallback((item: FeedItem) => {
    if (item.type === 'drone_update') {
      return renderDroneItem(item.data)
    }
    if (item.type === 'maintenance_post') {
      return (
        <MaintenancePostCardCompact
          key={item.id}
          post={item.data}
          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
        />
      )
    }
    // Future: handle event_post type
    return null
  }, [renderDroneItem])

  // Get empty state message
  const getEmptyMessage = useCallback(() => {
    if (activeTab === 'following') {
      if (feedFilter === 'maintenance') {
        return 'フォロー中のパイロットの整備記録がありません'
      }
      if (feedFilter === 'drones') {
        return 'フォロー中のパイロットのドローン更新がありません'
      }
      return 'フォロー中のパイロットの更新がありません'
    }
    if (feedFilter === 'maintenance') {
      return '整備記録の投稿がありません'
    }
    if (feedFilter === 'drones') {
      return 'ドローンの更新がありません'
    }
    return '最近の更新がありません'
  }, [activeTab, feedFilter])

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近の更新
          </h2>

          {/* フィルター */}
          <div className="flex gap-1">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setFeedFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  feedFilter === filter
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {FEED_FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : filteredFeed.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {getEmptyMessage()}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredFeed.map((item) => renderFeedItem(item))}
          </div>
        )}
      </div>
    </div>
  )
}
