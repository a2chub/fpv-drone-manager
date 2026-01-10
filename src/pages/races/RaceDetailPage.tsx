import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRace, useDeleteRace, useToggleRacePublic } from '@/hooks/useRaces'
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

export function RaceDetailPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const navigate = useNavigate()
  const { data: race, isLoading, error } = useRace(raceId)
  const deleteMutation = useDeleteRace()
  const togglePublicMutation = useToggleRacePublic()

  const handleDelete = async () => {
    if (confirm('このレース記録を削除しますか？')) {
      await deleteMutation.mutateAsync(raceId!)
      navigate('/races')
    }
  }

  const handleTogglePublic = () => {
    if (race) {
      togglePublicMutation.mutate({ raceId: race.id, isPublic: !race.isPublic })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !race) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">レース記録が見つかりませんでした</p>
        <Link to="/races" className="text-primary-500 hover:underline mt-4 inline-block">
          レース一覧に戻る
        </Link>
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/races"
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          レース一覧に戻る
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublic}
            className="btn-secondary flex items-center gap-2"
          >
            {race.isPublic ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                非公開にする
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                公開する
              </>
            )}
          </button>
          <Link to={`/races/${raceId}/edit`} className="btn-secondary">
            編集
          </Link>
          <button onClick={handleDelete} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30">
            削除
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images and Impressions */}
        <div className="lg:col-span-2">
          {/* Images */}
          {race.images && race.images.length > 0 && (
            <div className="card overflow-hidden mb-6">
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
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">感想・振り返り</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{race.impressions}</p>
            </div>
          )}

          {/* No content placeholder */}
          {!race.impressions && (!race.images || race.images.length === 0) && (
            <div className="card p-12 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">感想や画像がまだ登録されていません</p>
              <Link to={`/races/${raceId}/edit`} className="text-primary-500 hover:underline">
                編集して追加する
              </Link>
            </div>
          )}
        </div>

        {/* Right column - Info sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{race.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {categoryLabel}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  race.isPublic
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {race.isPublic ? '公開中' : '非公開'}
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
                      className="text-primary-500 hover:underline"
                    >
                      {race.officialUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Results card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">結果</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">順位</dt>
                <dd className="text-2xl font-bold text-primary-600 dark:text-primary-400">{rankDisplay}</dd>
              </div>
              {race.result.lapTime && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">ベストラップ</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">{race.result.lapTime}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Used drone card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">使用機体</h2>
            {race.usedDroneId ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <Link
                    to={`/drones/${race.usedDroneId}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    {race.usedDroneName || '不明な機体'}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">詳細を見る</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">機体が登録されていません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
