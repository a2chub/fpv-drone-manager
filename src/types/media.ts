import type { Timestamp } from 'firebase/firestore'

// メディアタイプ
export type MediaType = 'image' | 'video'

// メディアアイテム
export interface MediaItem {
  type: MediaType
  url: string
  thumbnailUrl?: string
  duration?: number // 動画の長さ（秒）
  width?: number
  height?: number
}

// メディアコメント
export interface MediaComment {
  id: string
  postId: string
  mediaIndex: number
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// メディアコメントフォームデータ
export interface MediaCommentFormData {
  content: string
}

// メディア制限
export const MEDIA_LIMITS = {
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  video: {
    maxSizeBytes: 500 * 1024 * 1024, // 500MB
    maxDurationSeconds: 420, // 7分
    acceptedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    acceptedExtensions: ['.mp4', '.webm', '.mov'],
  },
}

// MIMEタイプ判定
export function isImageType(mimeType: string): boolean {
  return MEDIA_LIMITS.image.acceptedTypes.includes(mimeType)
}

export function isVideoType(mimeType: string): boolean {
  return MEDIA_LIMITS.video.acceptedTypes.includes(mimeType)
}

export function getMediaType(mimeType: string): MediaType | null {
  if (isImageType(mimeType)) return 'image'
  if (isVideoType(mimeType)) return 'video'
  return null
}

// 後方互換性ヘルパー（旧 images: string[] から新 media: MediaItem[] へ）
export function normalizeMedia(post: { media?: MediaItem[]; images?: string[] }): MediaItem[] {
  if (post.media && post.media.length > 0) return post.media
  if (post.images && post.images.length > 0) {
    return post.images.map((url) => ({ type: 'image' as const, url }))
  }
  return []
}

// ファイルサイズをフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 動画の長さをフォーマット
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// acceptタイプ文字列を生成
export function getAcceptString(): string {
  return [...MEDIA_LIMITS.image.acceptedTypes, ...MEDIA_LIMITS.video.acceptedTypes].join(',')
}
