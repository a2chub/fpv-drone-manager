import type { EventPost } from '@/types'

interface AlbumGalleryProps {
  posts: EventPost[]
  onImageClick?: (imageUrl: string, postId: string) => void
}

interface ImageItem {
  url: string
  postId: string
  authorName: string
}

export function AlbumGallery({ posts, onImageClick }: AlbumGalleryProps) {
  // Collect all images from posts
  const allImages: ImageItem[] = posts.flatMap((post) =>
    post.images.map((url) => ({
      url,
      postId: post.id,
      authorName: post.authorName,
    }))
  )

  if (allImages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">写真がまだありません</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          参加者が写真を投稿すると、ここに表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {allImages.map((image, index) => (
        <div
          key={`${image.postId}-${index}`}
          className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group relative"
          onClick={() => onImageClick?.(image.url, image.postId)}
        >
          <img
            src={image.url}
            alt={`投稿画像 by ${image.authorName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs truncate">{image.authorName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
