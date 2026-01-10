import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaItem } from '@/types/media'
import { VideoPlayer } from './VideoPlayer'
import { MediaCommentList } from '@/components/event/MediaCommentList'
import { MediaCommentForm } from '@/components/event/MediaCommentForm'
import { useMediaComments, useCreateMediaComment, useDeleteMediaComment } from '@/hooks/useMediaComments'

interface MediaMetadata {
  postId: string
  mediaIndex: number
}

interface MediaLightboxProps {
  media: MediaItem[]
  initialIndex: number
  onClose: () => void
  showComments?: boolean
  eventId?: string
  postId?: string
  // 複数投稿のメディアを集約表示する場合、各メディアのpostIdとローカルインデックスを渡す
  mediaMetadata?: MediaMetadata[]
}

export function MediaLightbox({
  media,
  initialIndex,
  onClose,
  showComments = false,
  eventId,
  postId,
  mediaMetadata,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentMedia = media[currentIndex]

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
  }, [media.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
  }, [media.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToPrevious, goToNext])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }

    setTouchStart(null)
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="メディアビューア"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {media.length}
      </div>

      {/* Previous button */}
      {media.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="前へ"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {media.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="次へ"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Media content */}
      <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt=""
            className="max-w-full max-h-[80vh] object-contain"
          />
        ) : (
          <VideoPlayer
            src={currentMedia.url}
            className="max-w-full max-h-[80vh]"
            autoPlay
          />
        )}
      </div>

      {/* Thumbnail navigation */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
          {media.map((item, index) => (
            <button
              key={item.url}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Comments section */}
      {showComments && eventId && (
        (() => {
          // mediaMetadataがある場合は、現在のメディアの正しいpostIdとmediaIndexを使用
          const currentMetadata = mediaMetadata?.[currentIndex]
          const effectivePostId = currentMetadata?.postId || postId
          const effectiveMediaIndex = currentMetadata?.mediaIndex ?? currentIndex

          if (!effectivePostId) return null

          return (
            <CommentsPanel
              eventId={eventId}
              postId={effectivePostId}
              mediaIndex={effectiveMediaIndex}
            />
          )
        })()
      )}
    </div>
  )
}

// Separate component for comments to isolate hooks
function CommentsPanel({
  eventId,
  postId,
  mediaIndex,
}: {
  eventId: string
  postId: string
  mediaIndex: number
}) {
  const { data: comments = [], isLoading } = useMediaComments(eventId, postId, mediaIndex)
  const createComment = useCreateMediaComment(eventId, postId, mediaIndex)
  const deleteComment = useDeleteMediaComment(eventId, postId)

  const handleSubmit = (content: string) => {
    createComment.mutate({ content })
  }

  const handleDelete = (commentId: string) => {
    deleteComment.mutate(commentId)
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 hidden lg:flex flex-col border-l border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">コメント</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : (
          <MediaCommentList
            comments={comments}
            onDelete={handleDelete}
            isDeleting={deleteComment.isPending}
          />
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <MediaCommentForm
          onSubmit={handleSubmit}
          isSubmitting={createComment.isPending}
        />
      </div>
    </div>
  )
}
