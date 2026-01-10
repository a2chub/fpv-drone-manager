import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePart, useDeletePart } from '@/hooks/useParts'
import { useDrone } from '@/hooks/useDrones'
import { PartHistoryList } from '@/components/parts'
import { PART_CATEGORIES } from '@/types'

export function PartDetailPage() {
  const { droneId, partId } = useParams<{ droneId: string; partId: string }>()
  const navigate = useNavigate()
  const { data: part, isLoading: partLoading, error } = usePart(droneId, partId)
  const { data: drone, isLoading: droneLoading } = useDrone(droneId)
  const deleteMutation = useDeletePart(droneId!)

  const handleDelete = async () => {
    if (confirm('このパーツを削除しますか？関連する履歴も削除されます。')) {
      await deleteMutation.mutateAsync(partId!)
      navigate(`/drones/${droneId}`)
    }
  }

  const isLoading = partLoading || droneLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !part) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">パーツが見つかりませんでした</p>
        <Link
          to={`/drones/${droneId}`}
          className="text-primary-500 hover:underline mt-4 inline-block"
        >
          機体詳細に戻る
        </Link>
      </div>
    )
  }

  const categoryLabel =
    PART_CATEGORIES.find((c) => c.value === part.category)?.label ||
    part.category

  const formatDate = (timestamp: { toDate: () => Date } | null) => {
    if (!timestamp) return '-'
    try {
      const date = timestamp.toDate()
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/drones/${droneId}`}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {drone?.name || '機体詳細'}に戻る
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="btn-outline text-red-500 border-red-300 hover:bg-red-50"
          >
            削除
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image section */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {part.images && part.images.length > 0 ? (
                <img
                  src={part.images[0]}
                  alt={part.name}
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
            {part.images && part.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {part.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${part.name} ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {part.notes && (
            <div className="card p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">メモ</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{part.notes}</p>
            </div>
          )}

          {/* History section */}
          <div className="card p-6 mt-6">
            <PartHistoryList droneId={droneId!} partId={partId!} />
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {part.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                {categoryLabel}
              </span>
              {part.isPublic && (
                <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                  公開中
                </span>
              )}
            </div>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">メーカー</dt>
                <dd className="text-gray-900">{part.manufacturer || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">型番</dt>
                <dd className="text-gray-900">{part.model || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">購入価格</dt>
                <dd className="text-gray-900">
                  {part.purchasePrice
                    ? `¥${part.purchasePrice.toLocaleString()}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">購入店舗</dt>
                <dd className="text-gray-900">{part.purchaseStore || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">購入日</dt>
                <dd className="text-gray-900">
                  {formatDate(part.purchaseDate)}
                </dd>
              </div>
              {part.purchaseUrl && (
                <div>
                  <dt className="text-sm text-gray-500">購入URL</dt>
                  <dd>
                    <a
                      href={part.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline text-sm break-all"
                    >
                      {part.purchaseUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
