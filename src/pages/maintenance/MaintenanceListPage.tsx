import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wrench, Users, Globe, User } from 'lucide-react'
import {
  useUserMaintenancePosts,
  usePublicMaintenancePosts,
  useFollowingMaintenancePosts,
  useToggleLike,
  useHasLiked,
} from '@/hooks/useMaintenancePosts'
import { useAuth } from '@/contexts/AuthContext'
import { MaintenancePostCard, MaintenancePostCardSkeleton } from '@/components/maintenance/MaintenancePostCard'
import { FilterBar } from '@/components/common'
import { MAINTENANCE_TYPE_LABELS } from '@/types/maintenancePost'
import type { MaintenancePost } from '@/types/maintenancePost'

const MAINTENANCE_TYPE_OPTIONS = Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

type TabType = 'following' | 'all' | 'mine'

const TABS: { id: TabType; label: string; icon: typeof Users }[] = [
  { id: 'following', label: 'フォロー中', icon: Users },
  { id: 'all', label: 'すべて', icon: Globe },
  { id: 'mine', label: '自分の投稿', icon: User },
]

/**
 * 整備記録一覧ページ
 * `/maintenance` でアクセス
 */
export function MaintenanceListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // 各タブ用のデータ取得
  const { data: followingPosts, isLoading: followingLoading } = useFollowingMaintenancePosts()
  const { data: publicPosts, isLoading: publicLoading } = usePublicMaintenancePosts()
  const { data: myPosts, isLoading: myPostsLoading } = useUserMaintenancePosts(user?.id ?? '')

  const toggleLikeMutation = useToggleLike()

  // アクティブなタブに応じてデータを選択
  const { posts, isLoading } = useMemo(() => {
    switch (activeTab) {
      case 'following':
        return { posts: followingPosts, isLoading: followingLoading }
      case 'all':
        return { posts: publicPosts, isLoading: publicLoading }
      case 'mine':
        return { posts: myPosts, isLoading: myPostsLoading }
      default:
        return { posts: [], isLoading: false }
    }
  }, [activeTab, followingPosts, publicPosts, myPosts, followingLoading, publicLoading, myPostsLoading])

  // フィルタ適用
  const filteredPosts = useMemo(() => {
    if (!posts) return []
    return posts.filter((post) => {
      return typeFilter === 'all' || post.type === typeFilter
    })
  }, [posts, typeFilter])

  const handleLikeToggle = (postId: string) => {
    toggleLikeMutation.mutate(postId)
  }

  const handleCommentClick = (postId: string) => {
    navigate(`/maintenance/${postId}`)
  }

  // タブに応じた空状態メッセージ
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'following':
        return {
          title: 'フォロー中のユーザーの投稿がありません',
          description: '他のパイロットをフォローして、整備記録をチェックしましょう',
        }
      case 'all':
        return {
          title: 'まだ投稿がありません',
          description: '最初の整備記録を投稿してみましょう',
        }
      case 'mine':
        return {
          title: 'まだ整備記録がありません',
          description: '最初の整備記録を投稿して、機体のメンテナンス履歴を残しましょう',
        }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">整備記録</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ドローンのメンテナンス情報を共有
          </p>
        </div>
        <Link
          to="/maintenance/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus size={18} />
          <span>投稿する</span>
        </Link>
      </motion.div>

      {/* タブ切り替え */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* フィルタバー */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <FilterBar
          filters={[
            {
              id: 'type',
              label: '整備タイプ',
              options: MAINTENANCE_TYPE_OPTIONS,
              value: typeFilter,
              onChange: setTypeFilter,
            },
          ]}
        />
      </motion.div>

      {/* 投稿一覧 */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[...Array(3)].map((_, i) => (
              <MaintenancePostCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : filteredPosts.length > 0 ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4"
            data-testid="maintenance-list"
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MaintenancePostCardWithLike
                  post={post}
                  onLikeToggle={() => handleLikeToggle(post.id)}
                  onCommentClick={() => handleCommentClick(post.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : posts && posts.length > 0 ? (
          <motion.div
            key="no-filter-match"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center"
          >
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              条件に一致する整備記録がありません
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              フィルタ条件を変更してください
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center"
          >
            <Wrench className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {getEmptyMessage().title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {getEmptyMessage().description}
            </p>
            {activeTab !== 'following' && (
              <Link
                to="/maintenance/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25"
              >
                <Plus size={18} />
                最初の整備を記録
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * いいね状態を取得するラッパーコンポーネント
 */
function MaintenancePostCardWithLike({
  post,
  onLikeToggle,
  onCommentClick,
}: {
  post: MaintenancePost
  onLikeToggle: () => void
  onCommentClick: () => void
}) {
  const { data: isLiked } = useHasLiked(post.id)

  return (
    <MaintenancePostCard
      post={post}
      isLiked={isLiked ?? false}
      onLikeToggle={onLikeToggle}
      onCommentClick={onCommentClick}
    />
  )
}
