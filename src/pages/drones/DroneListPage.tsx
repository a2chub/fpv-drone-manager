import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDrones, useDeleteDrone, useToggleDronePublic } from '@/hooks/useDrones'
import { FilterBar } from '@/components/common'
import type { Drone } from '@/types'

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

function DroneCard({ drone }: { drone: Drone }) {
  const deleteMutation = useDeleteDrone()
  const togglePublicMutation = useToggleDronePublic()

  const handleDelete = async () => {
    if (confirm('この機体を削除しますか？')) {
      await deleteMutation.mutateAsync(drone.id)
    }
  }

  const handleTogglePublic = () => {
    togglePublicMutation.mutate({ droneId: drone.id, isPublic: !drone.isPublic })
  }

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {drone.mainImageUrl ? (
          <img
            src={drone.mainImageUrl}
            alt={drone.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
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
        <div className="absolute top-2 right-2 flex gap-1">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              drone.isPublic
                ? 'bg-primary-500 text-white'
                : 'bg-gray-600 text-white'
            }`}
          >
            {drone.isPublic ? '公開' : '非公開'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{drone.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>{CATEGORY_LABELS[drone.category]}</span>
          <span>·</span>
          <span>{STATUS_LABELS[drone.status]}</span>
        </div>
        <div className="flex items-center justify-between">
          <Link
            to={`/drones/${drone.id}`}
            className="text-primary-500 text-sm font-medium hover:underline"
          >
            詳細を見る
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublic}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={drone.isPublic ? '非公開にする' : '公開する'}
            >
              {drone.isPublic ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
            <Link
              to={`/drones/${drone.id}/edit`}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const CATEGORY_OPTIONS = [
  { value: 'racing', label: 'レーシング' },
  { value: 'freestyle', label: 'フリースタイル' },
  { value: 'long_range', label: 'ロングレンジ' },
  { value: 'micro', label: 'マイクロ' },
  { value: 'other', label: 'その他' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: '稼働中' },
  { value: 'retired', label: '引退' },
  { value: 'under_repair', label: '修理中' },
]

export function DroneListPage() {
  const { data: drones, isLoading, error } = useDrones()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredDrones = useMemo(() => {
    if (!drones) return []
    return drones.filter((drone) => {
      const categoryMatch = categoryFilter === 'all' || drone.category === categoryFilter
      const statusMatch = statusFilter === 'all' || drone.status === statusFilter
      return categoryMatch && statusMatch
    })
  }, [drones, categoryFilter, statusFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">エラーが発生しました</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">機体一覧</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {drones?.length || 0}件の機体が登録されています
          </p>
        </div>
        <Link to="/drones/new" className="btn-primary">
          新規登録
        </Link>
      </div>

      <FilterBar
        filters={[
          {
            id: 'category',
            label: 'カテゴリ',
            options: CATEGORY_OPTIONS,
            value: categoryFilter,
            onChange: setCategoryFilter,
          },
          {
            id: 'status',
            label: 'ステータス',
            options: STATUS_OPTIONS,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {filteredDrones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrones.map((drone) => (
            <DroneCard key={drone.id} drone={drone} />
          ))}
        </div>
      ) : drones && drones.length > 0 ? (
        <div className="card p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
            条件に一致する機体がありません
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            フィルタ条件を変更してください
          </p>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            まだ機体が登録されていません
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            最初の機体を登録して、管理を始めましょう
          </p>
          <Link to="/drones/new" className="btn-primary">
            最初の機体を登録
          </Link>
        </div>
      )}
    </div>
  )
}
