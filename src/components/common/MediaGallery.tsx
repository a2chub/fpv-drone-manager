import { useState } from 'react'
import type { MediaItem } from '@/types/media'
import { MediaLightbox } from './MediaLightbox'

interface MediaGalleryProps {
  media: MediaItem[]
  className?: string
  showComments?: boolean
  eventId?: string
  postId?: string
}

export function MediaGallery({
  media,
  className = '',
  showComments = false,
  eventId,
  postId,
}: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (media.length === 0) return null

  const getGridClass = () => {
    if (media.length === 1) return 'grid-cols-1'
    if (media.length === 2) return 'grid-cols-2'
    if (media.length === 3) return 'grid-cols-3'
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
  }

  return (
    <>
      <div className={`grid gap-2 ${getGridClass()} ${className}`}>
        {media.map((item, index) => (
          <button
            key={item.url}
            onClick={() => setLightboxIndex(index)}
            className="relative aspect-square group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-gray-900 ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge */}
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {Math.floor(item.duration / 60)}:
                    {String(Math.floor(item.duration % 60)).padStart(2, '0')}
                  </div>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          showComments={showComments}
          eventId={eventId}
          postId={postId}
        />
      )}
    </>
  )
}
