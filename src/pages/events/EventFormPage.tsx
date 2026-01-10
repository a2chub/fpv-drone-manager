import { useNavigate, useParams } from 'react-router-dom'
import { useEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents'
import { EventForm } from '@/components/event'
import type { RaceEventFormData } from '@/types'

// datetime-local 入力用に Date を文字列に変換
function formatDateForInput(date: Date): string {
  // ローカルタイムゾーンで YYYY-MM-DDTHH:mm 形式に変換
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function EventFormPage() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const isEditing = !!eventId

  const { data: event, isLoading } = useEvent(eventId)
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  const handleSubmit = async (data: RaceEventFormData) => {
    try {
      if (isEditing && eventId) {
        await updateEventMutation.mutateAsync({ eventId, data })
        navigate(`/events/${eventId}`)
      } else {
        const newEventId = await createEventMutation.mutateAsync(data)
        navigate(`/events/${newEventId}`)
      }
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  if (isEditing && isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    )
  }

  // Convert Timestamp to string for datetime-local inputs
  const initialData = event
    ? {
        title: event.title,
        description: event.description,
        date: formatDateForInput(event.date.toDate()),
        endDate: event.endDate ? formatDateForInput(event.endDate.toDate()) : '',
        location: event.location,
        locationDetails: event.locationDetails || '',
        officialUrl: event.officialUrl || '',
        category: event.category,
        capacity: event.capacity,
        registrationType: event.registrationType,
        visibility: event.visibility,
        status: event.status,
        coverImageUrl: event.coverImageUrl || '',
        images: event.images,
      }
    : undefined

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'イベントを編集' : '新規イベント'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <EventForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={createEventMutation.isPending || updateEventMutation.isPending}
        />
      </div>
    </div>
  )
}
