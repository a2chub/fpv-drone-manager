import { useParams, Link } from 'react-router-dom'
import { usePublicDrone, usePublicUser } from '@/hooks/usePublicData'
import { useAuth } from '@/contexts/AuthContext'
import { ContentGate } from '@/components/common'

// 名前を部分的に隠すヘルパー関数
function maskName(name: string): string {
  if (name.length <= 3) return name[0] + '***'
  return name.slice(0, 3) + '***'
}

const CATEGORY_LABELS: Record<string, string> = {
  racing: 'レーシング',
  freestyle: 'フリースタイル',
  long_range: 'ロングレンジ',
  micro: 'マイクロ',
  other: 'その他',
}

const STATUS_LABELS: Record<string, string> = {
  active: '稼働中',
  retired: '引退',
  under_repair: '修理中',
}

function ShareButtons({ url, droneName }: { url: string; droneName: string }) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${droneName} - ドローン情報をチェック！`
  )}&url=${encodeURIComponent(url)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert('リンクをコピーしました')
    } catch {
      alert('リンクのコピーに失敗しました')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        シェア
      </a>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        コピー
      </button>
    </div>
  )
}

export function PublicDrone() {
  const { userId, droneId } = useParams<{ userId: string; droneId: string }>()
  const { isAuthenticated } = useAuth()
  const { data: drone, isLoading: droneLoading, error: droneError } = usePublicDrone(userId, droneId)
  const { data: user, isLoading: userLoading } = usePublicUser(userId)

  const isLoading = droneLoading || userLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (droneError || !drone) {
    return (
      <div className="text-center py-12">
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">
          機体が見つからないか、公開されていません
        </p>
        {userId && (
          <Link
            to={`/u/${userId}`}
            className="text-primary-500 hover:underline mt-4 inline-block"
          >
            プロフィールに戻る
          </Link>
        )}
      </div>
    )
  }

  const currentUrl = window.location.href

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/u/${userId}`}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isAuthenticated ? (user?.displayName || 'プロフィール') : maskName(user?.displayName || 'ユーザー')}に戻る
        </Link>
        <ShareButtons url={currentUrl} droneName={drone.name} />
      </div>

      {/* コンテンツ全体をContentGateでラップ */}
      <ContentGate
        previewHeight={350}
        title="ログインして機体詳細を見る"
        description="アカウントを作成して、機体の詳細スペックや他のパイロットの機体情報をチェックしましょう。"
        benefits={[
          '詳細な技術仕様を閲覧',
          '自分の機体を管理・共有',
          '他のパイロットと繋がる',
        ]}
      >
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image section */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden dark:bg-gray-800">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                {drone.mainImageUrl ? (
                  <img
                    src={drone.mainImageUrl}
                    alt={drone.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg
                      className="w-16 h-16"
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
              </div>
              {drone.images && drone.images.length > 0 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {drone.images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${drone.name} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {drone.description && (
              <div className="card p-6 mt-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  説明
                </h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {drone.description}
                </p>
              </div>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            <div className="card p-6 dark:bg-gray-800">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {drone.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                  公開中
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {STATUS_LABELS[drone.status]}
                </span>
              </div>

              {/* 基本情報 */}
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">カテゴリー</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {CATEGORY_LABELS[drone.category]}
                  </dd>
                </div>
              </dl>

              {/* 詳細スペック */}
              <dl className="space-y-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">フレームサイズ</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {drone.specifications.frameSize || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">重量</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {drone.specifications.weight ? `${drone.specifications.weight}g` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">バッテリー</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {drone.specifications.batteryType || '-'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Owner info */}
            {user && (
              <div className="card p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  オーナー
                </h2>
                <Link
                  to={`/u/${userId}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={isAuthenticated ? user.displayName : 'オーナー'}
                        className={`w-full h-full object-cover ${!isAuthenticated ? 'blur-md' : ''}`}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 ${!isAuthenticated ? 'blur-sm' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* 非認証時のオーバーレイ */}
                    {!isAuthenticated && (
                      <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
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
              </div>
            )}
          </div>
        </div>
      </ContentGate>
    </div>
  )
}
