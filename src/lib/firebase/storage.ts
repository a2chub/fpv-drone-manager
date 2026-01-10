import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './config'
import type { MediaItem } from '@/types/media'
import { getMediaType, MEDIA_LIMITS } from '@/types/media'

export const uploadImage = async (
  userId: string,
  file: File,
  path: string
): Promise<string> => {
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export const deleteImage = async (imageUrl: string): Promise<void> => {
  const storageRef = ref(storage, imageUrl)
  await deleteObject(storageRef)
}

export const uploadMultipleImages = async (
  userId: string,
  files: File[],
  path: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(userId, file, path))
  return Promise.all(uploadPromises)
}

// 動画アップロード
export const uploadVideo = async (
  userId: string,
  file: File,
  path: string
): Promise<string> => {
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// メディア（画像または動画）アップロード
export const uploadMedia = async (
  userId: string,
  file: File,
  path: string
): Promise<MediaItem> => {
  const mediaType = getMediaType(file.type)
  if (!mediaType) {
    throw new Error('サポートされていないファイル形式です')
  }

  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  const mediaItem: MediaItem = {
    type: mediaType,
    url,
  }

  // 動画の場合は長さを取得
  if (mediaType === 'video') {
    const duration = await getVideoDuration(file)
    mediaItem.duration = duration
  }

  return mediaItem
}

// 複数メディアアップロード
export const uploadMultipleMedia = async (
  userId: string,
  files: File[],
  path: string
): Promise<MediaItem[]> => {
  const uploadPromises = files.map((file) => uploadMedia(userId, file, path))
  return Promise.all(uploadPromises)
}

// メディア削除
export const deleteMedia = async (mediaUrl: string): Promise<void> => {
  const storageRef = ref(storage, mediaUrl)
  await deleteObject(storageRef)
}

// 動画の長さを取得（クライアント側）
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('動画の読み込みに失敗しました'))
    }

    video.src = URL.createObjectURL(file)
  })
}

// ファイルバリデーション
export const validateMediaFile = async (
  file: File
): Promise<{ valid: boolean; error?: string }> => {
  const mediaType = getMediaType(file.type)

  if (!mediaType) {
    return { valid: false, error: 'サポートされていないファイル形式です' }
  }

  if (mediaType === 'image') {
    if (file.size > MEDIA_LIMITS.image.maxSizeBytes) {
      return { valid: false, error: '画像ファイルは10MB以下にしてください' }
    }
  }

  if (mediaType === 'video') {
    if (file.size > MEDIA_LIMITS.video.maxSizeBytes) {
      return { valid: false, error: '動画ファイルは500MB以下にしてください' }
    }

    try {
      const duration = await getVideoDuration(file)
      if (duration > MEDIA_LIMITS.video.maxDurationSeconds) {
        return { valid: false, error: '動画は7分以内にしてください' }
      }
    } catch {
      return { valid: false, error: '動画の長さを確認できませんでした' }
    }
  }

  return { valid: true }
}
