import { useNavigate, useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvents'
import { useEventPosts } from '@/hooks/useEventPosts'
import { AlbumGallery } from '@/components/event'

export function EventAlbumPage() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()

  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: posts, isLoading: postsLoading } = useEventPosts(eventId)

  const isLoading = eventLoading || postsLoading

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">イベントが見つかりませんでした</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 text-primary-500 hover:text-primary-600"
        >
          イベント一覧に戻る
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          イベント詳細に戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {event.title} - アルバム
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          参加者が投稿した写真・動画のギャラリー
        </p>
      </div>

      {/* Gallery with integrated lightbox */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <AlbumGallery
          posts={posts || []}
          eventId={eventId}
        />
      </div>
    </div>
  )
}
