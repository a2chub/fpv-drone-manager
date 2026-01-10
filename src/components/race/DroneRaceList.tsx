import { Link } from 'react-router-dom'
import { useRacesByDrone } from '@/hooks/useRaces'
import { RACE_CATEGORIES } from '@/types'

interface DroneRaceListProps {
  droneId: string
}

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DroneRaceList({ droneId }: DroneRaceListProps) {
  const { data: races, isLoading, error } = useRacesByDrone(droneId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p className="text-sm">レース履歴の取得に失敗しました</p>
      </div>
    )
  }

  if (!races || races.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <svg
          className="w-8 h-8 mx-auto mb-2"
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
        <p className="text-sm">レース記録がありません</p>
        <Link
          to="/races/new"
          className="text-primary-500 text-sm hover:underline mt-2 inline-block"
        >
          レースを記録する
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {races.map((race) => {
        const categoryLabel =
          RACE_CATEGORIES.find((c) => c.value === race.category)?.label || race.category
        const rankDisplay =
          race.result.rank !== null
            ? race.result.totalParticipants !== null
              ? `${race.result.rank}位/${race.result.totalParticipants}人`
              : `${race.result.rank}位`
            : null

        return (
          <Link
            key={race.id}
            to={`/races/${race.id}`}
            className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {categoryLabel}
              </span>
              {rankDisplay && (
                <span className="text-xs font-medium text-primary-600">{rankDisplay}</span>
              )}
            </div>
            <h4 className="font-medium text-gray-900 text-sm truncate">{race.name}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{formatDate(race.date)}</span>
              <span className="text-xs text-gray-400 truncate max-w-[100px]">{race.location}</span>
            </div>
          </Link>
        )
      })}
      <Link
        to="/races"
        className="block text-center text-sm text-primary-500 hover:underline pt-2"
      >
        すべてのレースを見る →
      </Link>
    </div>
  )
}
