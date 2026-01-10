import { useState } from 'react'
import type { EventPost, MediaItem } from '@/types'
import { normalizeMedia } from '@/types/media'
import { MediaLightbox } from '@/components/common/MediaLightbox'

interface AlbumGalleryProps {
  posts: EventPost[]
  eventId?: string
  onImageClick?: (imageUrl: string, postId: string) => void
}

interface GalleryItem {
  media: MediaItem
  postId: string
  authorName: string
  index: number
}

export function AlbumGallery({ posts, eventId, onImageClick }: AlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Collect all media from posts
  const allItems: GalleryItem[] = posts.flatMap((post) => {
    const media = normalizeMedia(post)
    return media.map((item, index) => ({
      media: item,
      postId: post.id,
      authorName: post.authorName,
      index,
    }))
  })

  const allMedia = allItems.map((item) => item.media)

  // 各メディアのpostIdとローカルインデックスをメタデータとして保持
  const mediaMetadata = allItems.map((item) => ({
    postId: item.postId,
    mediaIndex: item.index,
  }))

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">写真・動画がまだありません</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          参加者が写真や動画を投稿すると、ここに表示されます
        </p>
      </div>
    )
  }

  const handleClick = (index: number) => {
    const item = allItems[index]
    if (onImageClick) {
      onImageClick(item.media.url, item.postId)
    } else {
      setLightboxIndex(index)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {allItems.map((item, index) => (
          <button
            key={`${item.postId}-${item.index}`}
            onClick={() => handleClick(index)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group relative focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {item.media.type === 'image' ? (
              <img
                src={item.media.url}
                alt={`投稿画像 by ${item.authorName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <>
                <video
                  src={item.media.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {item.media.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {Math.floor(item.media.duration / 60)}:
                    {String(Math.floor(item.media.duration % 60)).padStart(2, '0')}
                  </div>
                )}
              </>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs truncate">{item.authorName}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <MediaLightbox
          media={allMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          showComments={true}
          eventId={eventId}
          mediaMetadata={mediaMetadata}
        />
      )}
    </>
  )
}
