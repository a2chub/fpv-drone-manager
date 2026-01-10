import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  uploadMultipleMedia,
  deleteMedia,
  validateMediaFile,
} from '@/lib/firebase/storage'
import type { MediaItem } from '@/types/media'

interface UseMediaUploadOptions {
  path: string
  maxFiles?: number
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useMediaUpload({ path, maxFiles = 10 }: UseMediaUploadOptions) {
  const { user } = useAuth()
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]): Promise<MediaItem[]> => {
      if (!user) throw new Error('ログインが必要です')

      if (files.length > maxFiles) {
        throw new Error(`一度にアップロードできるのは${maxFiles}件までです`)
      }

      // 全ファイルをバリデーション
      for (const file of files) {
        const validation = await validateMediaFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
      }

      setState((prev) => ({ ...prev, isUploading: true, error: null }))

      const mediaItems = await uploadMultipleMedia(user.id, files, path)

      setState((prev) => ({ ...prev, isUploading: false, progress: 100 }))

      return mediaItems
    },
    onError: (error: Error) => {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: error.message,
      }))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (mediaUrl: string): Promise<void> => {
      await deleteMedia(mediaUrl)
    },
  })

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<MediaItem[]> => {
      return uploadMutation.mutateAsync(files)
    },
    [uploadMutation]
  )

  const remove = useCallback(
    async (mediaUrl: string): Promise<void> => {
      return deleteMutation.mutateAsync(mediaUrl)
    },
    [deleteMutation]
  )

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    uploadMultiple,
    remove,
    isUploading: state.isUploading || uploadMutation.isPending,
    progress: state.progress,
    error: state.error || (uploadMutation.error?.message ?? null),
    clearError,
  }
}
