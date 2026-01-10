import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadImage, uploadMultipleImages, deleteImage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

interface UseImageUploadOptions {
  path: string
  maxFiles?: number
  maxSizeBytes?: number
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useImageUpload({ path, maxFiles = 5, maxSizeBytes = 10 * 1024 * 1024 }: UseImageUploadOptions) {
  const { user } = useAuth()
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '画像ファイルのみアップロードできます'
    }
    if (file.size > maxSizeBytes) {
      return `ファイルサイズは${Math.round(maxSizeBytes / 1024 / 1024)}MB以下にしてください`
    }
    return null
  }, [maxSizeBytes])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('ログインが必要です')

      const error = validateFile(file)
      if (error) throw new Error(error)

      setUploadState({ isUploading: true, progress: 0, error: null })
      const url = await uploadImage(user.id, file, path)
      setUploadState({ isUploading: false, progress: 100, error: null })
      return url
    },
    onError: (error: Error) => {
      setUploadState({ isUploading: false, progress: 0, error: error.message })
    },
  })

  const uploadMultipleMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('ログインが必要です')

      if (files.length > maxFiles) {
        throw new Error(`一度にアップロードできる画像は${maxFiles}枚までです`)
      }

      for (const file of files) {
        const error = validateFile(file)
        if (error) throw new Error(error)
      }

      setUploadState({ isUploading: true, progress: 0, error: null })
      const urls = await uploadMultipleImages(user.id, files, path)
      setUploadState({ isUploading: false, progress: 100, error: null })
      return urls
    },
    onError: (error: Error) => {
      setUploadState({ isUploading: false, progress: 0, error: error.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await deleteImage(imageUrl)
    },
  })

  const upload = useCallback(async (file: File): Promise<string> => {
    return uploadMutation.mutateAsync(file)
  }, [uploadMutation])

  const uploadMultiple = useCallback(async (files: File[]): Promise<string[]> => {
    return uploadMultipleMutation.mutateAsync(files)
  }, [uploadMultipleMutation])

  const remove = useCallback(async (imageUrl: string): Promise<void> => {
    await deleteMutation.mutateAsync(imageUrl)
  }, [deleteMutation])

  return {
    upload,
    uploadMultiple,
    remove,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    isDeleting: deleteMutation.isPending,
  }
}
