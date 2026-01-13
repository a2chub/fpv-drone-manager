import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Inbox } from 'lucide-react'
import {
  MaintenancePostCard,
  MaintenancePostCardSkeleton,
} from './MaintenancePostCard'
import type { MaintenancePost } from '@/types/maintenancePost'
import { cn } from '@/lib/utils'

interface MaintenancePostListProps {
  posts: MaintenancePost[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

/**
 * 整備記録投稿一覧コンポーネント
 * - レスポンシブグリッド表示(1-3列)
 * - ローディングスケルトン
 * - 空状態メッセージ
 * - 無限スクロール対応(オプション)
 */
export function MaintenancePostList({
  posts,
  isLoading = false,
  emptyMessage = '整備記録がありません',
  className,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MaintenancePostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore()
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [handleIntersect])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MaintenancePostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-12 text-center',
          className
        )}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <Inbox size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          整備記録を投稿して、メンテナンス履歴を共有しましょう
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
          <Wrench size={16} />
          <span className="text-sm">定期的な整備がドローンの寿命を延ばします</span>
        </div>
      </motion.div>
    )
  }

  // Posts list
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
            >
              <MaintenancePostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Trigger */}
      {onLoadMore && (
        <div ref={loadMoreRef} className="mt-6">
          {isLoadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <MaintenancePostCardSkeleton key={`loading-${i}`} />
              ))}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-sm text-gray-400 dark:text-gray-500">
                全ての投稿を表示しました
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * コンパクトリスト表示(単一カラム)
 */
export function MaintenancePostListCompact({
  posts,
  isLoading = false,
  emptyMessage = '整備記録がありません',
  className,
}: Omit<MaintenancePostListProps, 'onLoadMore' | 'hasMore' | 'isLoadingMore'>) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <Inbox size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{
              duration: 0.2,
              delay: index * 0.03,
            }}
          >
            <MaintenancePostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * フィードレイアウト(中央揃え、最大幅制限)
 */
export function MaintenancePostFeed({
  posts,
  isLoading = false,
  emptyMessage = '整備記録がありません',
  className,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MaintenancePostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore()
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [handleIntersect])

  if (isLoading) {
    return (
      <div className={cn('max-w-2xl mx-auto space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <MaintenancePostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-12 text-center',
          className
        )}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <Inbox size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          フォローしているユーザーの整備記録がここに表示されます
        </p>
      </motion.div>
    )
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
            >
              <MaintenancePostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Trigger */}
      {onLoadMore && (
        <div ref={loadMoreRef} className="mt-6">
          {isLoadingMore && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <MaintenancePostCardSkeleton key={`loading-${i}`} />
              ))}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-sm text-gray-400 dark:text-gray-500">
                全ての投稿を表示しました
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
