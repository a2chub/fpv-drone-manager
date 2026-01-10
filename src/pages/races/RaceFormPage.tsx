import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRace, useCreateRace, useUpdateRace } from '@/hooks/useRaces'
import { RaceForm } from '@/components/race'
import type { RaceFormData } from '@/types'

export function RaceFormPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const navigate = useNavigate()
  const isEditing = !!raceId

  const { data: race, isLoading: isRaceLoading } = useRace(raceId)
  const createMutation = useCreateRace()
  const updateMutation = useUpdateRace()

  const handleSubmit = async (data: RaceFormData, usedDroneName: string) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ raceId: raceId!, data, usedDroneName })
        navigate(`/races/${raceId}`)
      } else {
        const newId = await createMutation.mutateAsync({ data, usedDroneName })
        navigate(`/races/${newId}`)
      }
    } catch (error) {
      console.error('Failed to save race:', error)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/races/${raceId}`)
    } else {
      navigate('/races')
    }
  }

  if (isEditing && isRaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          to={isEditing ? `/races/${raceId}` : '/races'}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </Link>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'レースを編集' : '新しいレースを記録'}
        </h1>

        <RaceForm
          race={race}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  )
}
