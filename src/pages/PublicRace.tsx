import { useParams, Link } from 'react-router-dom'
import { usePublicRace, usePublicUser, usePublicDrone } from '@/hooks/usePublicData'
import { RACE_CATEGORIES } from '@/types'

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function ShareButtons({ url, raceName }: { url: string; raceName: string }) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${raceName} - レース結果をチェック！`
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

export function PublicRace() {
  const { userId, raceId } = useParams<{ userId: string; raceId: string }>()
  const { data: race, isLoading: raceLoading, error: raceError } = usePublicRace(userId, raceId)
  const { data: user, isLoading: userLoading } = usePublicUser(userId)
  const { data: usedDrone } = usePublicDrone(userId, race?.usedDroneId || undefined)

  const isLoading = raceLoading || userLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (raceError || !race) {
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
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">
          レースが見つからないか、公開されていません
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

  const categoryLabel =
    RACE_CATEGORIES.find((c) => c.value === race.category)?.label || race.category

  const rankDisplay =
    race.result.rank !== null
      ? race.result.totalParticipants !== null
        ? `${race.result.rank}位 / ${race.result.totalParticipants}人中`
        : `${race.result.rank}位`
      : '記録なし'

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
          {user?.displayName || 'プロフィール'}に戻る
        </Link>
        <ShareButtons url={currentUrl} raceName={race.name} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images and Impressions */}
        <div className="lg:col-span-2">
          {/* Images */}
          {race.images && race.images.length > 0 && (
            <div className="card overflow-hidden mb-6 dark:bg-gray-800">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                <img
                  src={race.images[0]}
                  alt={race.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {race.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {race.images.slice(1).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${race.name} ${index + 2}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Impressions */}
          {race.impressions && (
            <div className="card p-6 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                感想・振り返り
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {race.impressions}
              </p>
            </div>
          )}

          {/* No content placeholder */}
          {!race.impressions && (!race.images || race.images.length === 0) && (
            <div className="card p-12 text-center dark:bg-gray-800">
              <svg
                className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
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
              <p className="text-gray-500 dark:text-gray-400">
                詳細情報が登録されていません
              </p>
            </div>
          )}
        </div>

        {/* Right column - Info sidebar */}
        <div className="space-y-6">
          <div className="card p-6 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {race.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {categoryLabel}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                公開中
              </span>
            </div>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">開催日</dt>
                <dd className="text-gray-900 dark:text-white">{formatDate(race.date)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">開催場所</dt>
                <dd className="text-gray-900 dark:text-white">{race.location}</dd>
              </div>
              {race.officialUrl && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">公式サイト</dt>
                  <dd>
                    <a
                      href={race.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline break-all"
                    >
                      {race.officialUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Results card */}
          <div className="card p-6 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              結果
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">順位</dt>
                <dd className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {rankDisplay}
                </dd>
              </div>
              {race.result.lapTime && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ベストラップ</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">
                    {race.result.lapTime}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Used drone card */}
          <div className="card p-6 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              使用機体
            </h2>
            {race.usedDroneId && usedDrone ? (
              <Link
                to={`/u/${userId}/drones/${race.usedDroneId}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {usedDrone.mainImageUrl ? (
                    <img
                      src={usedDrone.mainImageUrl}
                      alt={usedDrone.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {race.usedDroneName || usedDrone.name}
                  </p>
                  <p className="text-sm text-primary-500">詳細を見る</p>
                </div>
              </Link>
            ) : race.usedDroneName ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {race.usedDroneName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">非公開の機体</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                機体が登録されていません
              </p>
            )}
          </div>

          {/* Owner info */}
          {user && (
            <div className="card p-6 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                パイロット
              </h2>
              <Link
                to={`/u/${userId}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
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
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.displayName}
                  </p>
                  <p className="text-sm text-primary-500">プロフィールを見る</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
