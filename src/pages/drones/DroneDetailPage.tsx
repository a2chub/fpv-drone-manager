import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDrone, useDeleteDrone } from '@/hooks/useDrones'
import { PartList } from '@/components/parts'
import { DroneRaceList } from '@/components/race'

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

export function DroneDetailPage() {
  const { droneId } = useParams<{ droneId: string }>()
  const navigate = useNavigate()
  const { data: drone, isLoading, error } = useDrone(droneId)
  const deleteMutation = useDeleteDrone()

  const handleDelete = async () => {
    if (confirm('この機体を削除しますか？関連するパーツ情報も削除されます。')) {
      await deleteMutation.mutateAsync(droneId!)
      navigate('/drones')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !drone) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">機体が見つかりませんでした</p>
        <Link to="/drones" className="text-primary-500 hover:underline mt-4 inline-block">
          機体一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/drones"
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          機体一覧に戻る
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/drones/${droneId}/edit`} className="btn-secondary">
            編集
          </Link>
          <button onClick={handleDelete} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30">
            削除
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image section */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700">
              {drone.mainImageUrl ? (
                <img
                  src={drone.mainImageUrl}
                  alt={drone.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
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
            <div className="card p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">説明</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{drone.description}</p>
            </div>
          )}

          {/* Parts section */}
          <div className="card p-6 mt-6">
            <PartList droneId={droneId!} />
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{drone.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  drone.isPublic
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {drone.isPublic ? '公開中' : '非公開'}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {STATUS_LABELS[drone.status]}
              </span>
            </div>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">カテゴリー</dt>
                <dd className="text-gray-900 dark:text-white">{CATEGORY_LABELS[drone.category]}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">フレームサイズ</dt>
                <dd className="text-gray-900 dark:text-white">{drone.specifications.frameSize || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">重量</dt>
                <dd className="text-gray-900 dark:text-white">
                  {drone.specifications.weight ? `${drone.specifications.weight}g` : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">バッテリー</dt>
                <dd className="text-gray-900 dark:text-white">{drone.specifications.batteryType || '-'}</dd>
              </div>
            </dl>
          </div>

          {/* Race history */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">レース履歴</h2>
            <DroneRaceList droneId={droneId!} />
          </div>
        </div>
      </div>
    </div>
  )
}
