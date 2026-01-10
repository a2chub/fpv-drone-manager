import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRaces, useDeleteRace, useToggleRacePublic } from '@/hooks/useRaces'
import { RaceCard } from '@/components/race'
import { FilterBar } from '@/components/common'

const CATEGORY_OPTIONS = [
  { value: 'official', label: '公式レース' },
  { value: 'local', label: 'ローカルレース' },
  { value: 'practice', label: '練習' },
  { value: 'other', label: 'その他' },
]

export function RaceListPage() {
  const { data: races, isLoading, error } = useRaces()
  const deleteMutation = useDeleteRace()
  const togglePublicMutation = useToggleRacePublic()
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredRaces = useMemo(() => {
    if (!races) return []
    return races.filter((race) => {
      return categoryFilter === 'all' || race.category === categoryFilter
    })
  }, [races, categoryFilter])

  const handleDelete = async (raceId: string) => {
    if (confirm('このレース記録を削除しますか？')) {
      await deleteMutation.mutateAsync(raceId)
    }
  }

  const handleTogglePublic = (raceId: string, isPublic: boolean) => {
    togglePublicMutation.mutate({ raceId, isPublic: !isPublic })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">レース記録</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {races?.length || 0}件のレースが記録されています
          </p>
        </div>
        <Link to="/races/new" className="btn-primary">
          新規記録
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
        ]}
      />

      {filteredRaces.length > 0 ? (
        <div className="space-y-4">
          {filteredRaces.map((race) => (
            <RaceCard
              key={race.id}
              race={race}
              onEdit={() => {
                window.location.href = `/races/${race.id}/edit`
              }}
              onDelete={() => handleDelete(race.id)}
              onTogglePublic={() => handleTogglePublic(race.id, race.isPublic)}
            />
          ))}
        </div>
      ) : races && races.length > 0 ? (
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
            条件に一致するレースがありません
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
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            まだレース記録がありません
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            最初のレースを記録して、成長を振り返りましょう
          </p>
          <Link to="/races/new" className="btn-primary">
            最初のレースを記録
          </Link>
        </div>
      )}
    </div>
  )
}
