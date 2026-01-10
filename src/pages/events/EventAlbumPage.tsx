import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvents'
import { useEventPosts } from '@/hooks/useEventPosts'
import { AlbumGallery } from '@/components/event'

export function EventAlbumPage() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
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
          参加者が投稿した写真のギャラリー
        </p>
      </div>

      {/* Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <AlbumGallery
          posts={posts || []}
          onImageClick={handleImageClick}
        />
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="拡大画像"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
