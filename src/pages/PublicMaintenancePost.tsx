import { useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ArrowLeft,
  User,
  Plane,
  Heart,
  MessageCircle,
  Droplets,
  Wrench,
  RefreshCw,
  SlidersHorizontal,
  Cpu,
  Search,
  TrendingUp,
  MoreHorizontal,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePublicMaintenancePost } from '@/hooks/useMaintenancePosts'
import { usePublicUser } from '@/hooks/usePublicData'
import { ContentGate } from '@/components/common'
import { MediaGallery } from '@/components/common/MediaGallery'
import { ShareButtons } from '@/components/social/ShareButtons'
import { cn } from '@/lib/utils'
import type { MaintenanceType } from '@/types/maintenancePost'
import { MAINTENANCE_TYPE_LABELS } from '@/types/maintenancePost'

/**
 * 名前を部分的に隠すヘルパー関数
 */
function maskName(name: string): string {
  if (name.length <= 3) return name[0] + '***'
  return name.slice(0, 3) + '***'
}

/**
 * 整備タイプに対応するアイコンコンポーネント
 */
const MaintenanceTypeIcon = ({ type }: { type: MaintenanceType }) => {
  const iconProps = { size: 16 }

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
 * 公開整備記録ページ
 * `/u/:userId/maintenance/:postId` でアクセス
 * 非ログインでも閲覧可能（isPublic: true の投稿のみ）
 */
export function PublicMaintenancePost() {
  const { userId, postId } = useParams<{ userId: string; postId: string }>()
  const { isAuthenticated } = useAuth()

  const { data: post, isLoading: postLoading, error: postError } = usePublicMaintenancePost(postId)
  const { data: user, isLoading: userLoading } = usePublicUser(userId)

  const isLoading = postLoading || userLoading

  // 相対時間を計算
  const timeAgo = useMemo(() => {
    if (!post) return ''
    try {
      return formatDistanceToNow(post.createdAt.toDate(), {
        addSuffix: true,
        locale: ja,
      })
    } catch {
      return ''
    }
  }, [post])

  // シェアURL・タイトル
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = post
    ? `${post.droneName}の${MAINTENANCE_TYPE_LABELS[post.type]} - ${post.title}`
    : '整備記録'

  // ドキュメントタイトルの設定
  useEffect(() => {
    if (post) {
      document.title = `${shareTitle} | FPV Drone Manager`
    }
    return () => {
      document.title = 'FPV Drone Manager'
    }
  }, [post, shareTitle])

  // ローディング状態
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    )
  }

  // エラー状態または投稿が見つからない
  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            投稿が見つかりません
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            この投稿は削除されたか、公開されていません。
          </p>
          {userId && (
            <Link
              to={`/u/${userId}`}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              プロフィールに戻る
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link
            to={`/u/${userId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>
              {isAuthenticated ? (user?.displayName || 'プロフィール') : maskName(user?.displayName || 'ユーザー')}に戻る
            </span>
          </Link>
          <ShareButtons url={currentUrl} title={shareTitle} description={post.content.slice(0, 100)} />
        </motion.div>

        {/* コンテンツ全体をContentGateでラップ */}
        <ContentGate
          previewHeight={400}
          title="ログインして整備記録を見る"
          description="アカウントを作成して、他のパイロットの整備記録をチェックしましょう。"
          benefits={[
            '詳細な整備情報を閲覧',
            '自分の整備記録を共有',
            '他のパイロットと情報交換',
          ]}
        >
          {/* 投稿カード */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
          >
            {/* ヘッダー: 投稿者情報 + ドローン情報 */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                {/* 投稿者情報 */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* アバター */}
                  <Link
                    to={`/u/${post.userId}`}
                    className="relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-transparent hover:ring-primary-500/50 transition-all"
                  >
                    {post.userPhotoURL ? (
                      <img
                        src={post.userPhotoURL}
                        alt={isAuthenticated ? post.userName : 'ユーザー'}
                        className={cn('w-full h-full object-cover', !isAuthenticated && 'blur-md')}
                      />
                    ) : (
                      <div className={cn('w-full h-full flex items-center justify-center', !isAuthenticated && 'blur-sm')}>
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                    {/* 非認証時のオーバーレイ */}
                    {!isAuthenticated && (
                      <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                        <Lock size={12} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* 名前と時間 */}
                  <div className="min-w-0">
                    <Link
                      to={`/u/${post.userId}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate block"
                    >
                      {isAuthenticated ? post.userName : maskName(post.userName)}
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h1>

              {/* 本文 */}
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

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

            {/* フッター: エンゲージメント情報 */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                {/* いいね + コメント */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Heart size={20} />
                    <span className="text-sm font-medium tabular-nums">
                      {post.likeCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium tabular-nums">
                      {post.commentCount}
                    </span>
                  </div>
                </div>

                {/* シェアボタン（モバイル用） */}
                <div className="sm:hidden">
                  <ShareButtons
                    url={currentUrl}
                    title={shareTitle}
                    description={post.content.slice(0, 100)}
                  />
                </div>
              </div>
            </div>
          </motion.article>

          {/* オーナー情報 */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                投稿者
              </h2>
              <Link
                to={`/u/${userId}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={isAuthenticated ? user.displayName : 'ユーザー'}
                      className={cn('w-full h-full object-cover', !isAuthenticated && 'blur-md')}
                    />
                  ) : (
                    <div className={cn('w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500', !isAuthenticated && 'blur-sm')}>
                      <User size={24} />
                    </div>
                  )}
                  {/* 非認証時のオーバーレイ */}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                      <Lock size={14} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isAuthenticated ? user.displayName : maskName(user.displayName)}
                  </p>
                  <p className="text-sm text-primary-500">プロフィールを見る</p>
                </div>
              </Link>
            </motion.div>
          )}
        </ContentGate>
    </div>
  )
}
