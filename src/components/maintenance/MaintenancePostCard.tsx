import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Heart,
  MessageCircle,
  Plane,
  User,
  ChevronDown,
  ChevronUp,
  Droplets,
  Wrench,
  RefreshCw,
  SlidersHorizontal,
  Cpu,
  Search,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaGallery } from '@/components/common/MediaGallery'
import { ShareButtons } from '@/components/social/ShareButtons'
import type { MaintenancePost, MaintenanceType } from '@/types/maintenancePost'
import { MAINTENANCE_TYPE_LABELS } from '@/types/maintenancePost'

export interface MaintenancePostCardProps {
  post: MaintenancePost
  showComments?: boolean
  onCommentClick?: () => void
  onLikeToggle?: (liked: boolean) => void
  isLiked?: boolean
  className?: string
}

/**
 * 整備タイプに対応するアイコンコンポーネント
 */
const MaintenanceTypeIcon = ({ type }: { type: MaintenanceType }) => {
  const iconProps = { size: 12 }

  switch (type) {
    case 'cleaning':
      return <Droplets {...iconProps} />
    case 'repair':
      return <Wrench {...iconProps} />
    case 'replacement':
      return <RefreshCw {...iconProps} />
    case 'tuning':
      return <SlidersHorizontal {...iconProps} />
    case 'firmware':
      return <Cpu {...iconProps} />
    case 'inspection':
      return <Search {...iconProps} />
    case 'upgrade':
      return <TrendingUp {...iconProps} />
    default:
      return <MoreHorizontal {...iconProps} />
  }
}

/**
 * 整備タイプに対応する色クラス
 */
const getMaintenanceTypeColors = (type: MaintenanceType): string => {
  const colors: Record<MaintenanceType, string> = {
    cleaning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300/50 dark:border-blue-700/50',
    repair: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300/50 dark:border-red-700/50',
    replacement: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50',
    tuning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50',
    firmware: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300/50 dark:border-purple-700/50',
    inspection: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300/50 dark:border-cyan-700/50',
    upgrade: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300/50 dark:border-pink-700/50',
    other: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300/50 dark:border-gray-700/50',
  }
  return colors[type]
}

/**
 * 本文の省略表示用の最大文字数
 */
const MAX_CONTENT_LENGTH = 200

/**
 * 整備記録投稿カードコンポーネント
 */
export function MaintenancePostCard({
  post,
  showComments = false,
  onCommentClick,
  onLikeToggle,
  isLiked = false,
  className,
}: MaintenancePostCardProps) {
  const [localLiked, setLocalLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  // 相対時間を計算
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(post.createdAt.toDate(), {
        addSuffix: true,
        locale: ja,
      })
    } catch {
      return ''
    }
  }, [post.createdAt])

  // 本文が省略対象かどうか
  const shouldTruncateContent = post.content.length > MAX_CONTENT_LENGTH
  const displayContent = shouldTruncateContent && !isContentExpanded
    ? post.content.slice(0, MAX_CONTENT_LENGTH) + '...'
    : post.content

  // シェアURL
  const shareUrl = `/maintenance/${post.id}`
  const shareTitle = `${post.droneName}の${MAINTENANCE_TYPE_LABELS[post.type]} - ${post.title}`

  // いいねトグル処理
  const handleLikeToggle = () => {
    const newLikedState = !localLiked
    setLocalLiked(newLikedState)
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1))
    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 300)
    onLikeToggle?.(newLikedState)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'panel-card overflow-hidden',
        className
      )}
    >
      {/* ヘッダー: 投稿者情報 + ドローン情報 */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* 投稿者情報 */}
          <div className="flex items-center gap-3 min-w-0">
            {/* アバター */}
            <Link
              to={`/u/${post.userId}`}
              className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-transparent hover:ring-primary-500/50 transition-all"
            >
              {post.userPhotoURL ? (
                <img
                  src={post.userPhotoURL}
                  alt={post.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
              )}
            </Link>

            {/* 名前と時間 */}
            <div className="min-w-0">
              <Link
                to={`/u/${post.userId}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate block"
              >
                {post.userName}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </p>
            </div>
          </div>

          {/* ドローン情報 */}
          <Link
            to={`/u/${post.userId}/drones/${post.droneId}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            {/* ドローンサムネイル */}
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {post.droneImageUrl ? (
                <img
                  src={post.droneImageUrl}
                  alt={post.droneName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plane size={14} className="text-gray-400" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {post.droneName}
            </span>
          </Link>
        </div>

        {/* 整備タイプバッジ */}
        <div className="mt-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              getMaintenanceTypeColors(post.type)
            )}
          >
            <MaintenanceTypeIcon type={post.type} />
            {MAINTENANCE_TYPE_LABELS[post.type]}
          </span>
        </div>
      </div>

      {/* コンテンツ: タイトル + 本文 */}
      <div className="px-4 pb-3">
        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h3>

        {/* 本文 */}
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </div>

        {/* もっと見る/閉じるボタン */}
        {shouldTruncateContent && (
          <button
            onClick={() => setIsContentExpanded(!isContentExpanded)}
            className="mt-2 flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {isContentExpanded ? (
              <>
                閉じる <ChevronUp size={14} />
              </>
            ) : (
              <>
                もっと見る <ChevronDown size={14} />
              </>
            )}
          </button>
        )}

        {/* 関連パーツ */}
        {post.relatedParts && post.relatedParts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.relatedParts.map((part) => (
              <span
                key={part.partId}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {part.partName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* メディアギャラリー */}
      {post.media.length > 0 && (
        <div className="px-4 pb-3">
          <MediaGallery media={post.media} />
        </div>
      )}

      {/* フッター: アクションボタン */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {/* 左側: いいね + コメント */}
          <div className="flex items-center gap-4">
            {/* いいねボタン */}
            <motion.button
              onClick={handleLikeToggle}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1.5 group"
              aria-label={localLiked ? 'いいねを取り消す' : 'いいねする'}
            >
              <motion.div
                animate={isLikeAnimating ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  size={20}
                  className={cn(
                    'transition-colors',
                    localLiked
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400 group-hover:text-red-500'
                  )}
                />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={likeCount}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    localLiked
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {likeCount}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* コメントボタン */}
            <button
              onClick={onCommentClick}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
              aria-label="コメント"
            >
              <MessageCircle
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-medium tabular-nums">
                {post.commentCount}
              </span>
            </button>
          </div>

          {/* 右側: シェアボタン */}
          <ShareButtons
            url={shareUrl}
            title={shareTitle}
            description={post.content.slice(0, 100)}
          />
        </div>
      </div>

      {/* コメントセクション（オプション） */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                コメント機能は準備中です
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

/**
 * スケルトンローディング用コンポーネント
 */
export function MaintenancePostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('panel-card overflow-hidden animate-pulse', className)}>
      {/* ヘッダー */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="mt-3">
          <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 pb-3">
        <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* メディア */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>

      {/* フッター */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * コンパクト版カード（リスト表示用）
 */
export function MaintenancePostCardCompact({
  post,
  className,
}: {
  post: MaintenancePost
  className?: string
}) {
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(post.createdAt.toDate(), {
        addSuffix: true,
        locale: ja,
      })
    } catch {
      return ''
    }
  }, [post.createdAt])

  return (
    <Link
      to={`/maintenance/${post.id}`}
      className={cn(
        'block panel-card p-3 hover:border-primary-500/50 transition-all group',
        className
      )}
    >
      <div className="flex gap-3">
        {/* メディアサムネイル */}
        {post.media.length > 0 && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {post.media[0].type === 'image' ? (
              <img
                src={post.media[0].url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                <Plane size={24} className="text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                getMaintenanceTypeColors(post.type)
              )}
            >
              <MaintenanceTypeIcon type={post.type} />
              {MAINTENANCE_TYPE_LABELS[post.type]}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{post.droneName}</span>
            <span>-</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* エンゲージメント */}
        <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Heart size={12} />
            <span className="tabular-nums">{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle size={12} />
            <span className="tabular-nums">{post.commentCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
