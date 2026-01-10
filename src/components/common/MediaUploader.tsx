import { useRef, useState, useCallback } from 'react'
import type { MediaItem } from '@/types/media'
import { getMediaType, formatFileSize, getAcceptString, MEDIA_LIMITS } from '@/types/media'

interface MediaUploaderProps {
  media: MediaItem[]
  onUpload: (files: File[]) => Promise<MediaItem[]>
  onRemove: (mediaUrl: string) => Promise<void>
  isUploading?: boolean
  maxMedia?: number
  label?: string
  error?: string | null
}

export function MediaUploader({
  media,
  onUpload,
  onRemove,
  isUploading = false,
  maxMedia = 10,
  label = 'メディア',
  error,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      // ファイル数チェック
      if (media.length + fileArray.length > maxMedia) {
        setUploadError(`${label}は最大${maxMedia}件までです`)
        return
      }

      // ファイルタイプチェック
      const invalidFile = fileArray.find((file) => !getMediaType(file.type))
      if (invalidFile) {
        setUploadError('サポートされていないファイル形式です')
        return
      }

      setUploadError(null)

      try {
        await onUpload(fileArray)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'アップロードに失敗しました')
      }
    },
    [media.length, maxMedia, label, onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
      // Reset input
      e.target.value = ''
    },
    [handleFiles]
  )

  const handleRemove = useCallback(
    async (mediaUrl: string) => {
      try {
        await onRemove(mediaUrl)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '削除に失敗しました')
      }
    },
    [onRemove]
  )

  const displayError = error || uploadError

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
          ({media.length}/{maxMedia})
        </span>
      </label>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString()}
          multiple
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">アップロード中...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              クリックまたはドラッグ＆ドロップ
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              画像: {formatFileSize(MEDIA_LIMITS.image.maxSizeBytes)}以下 / 動画:{' '}
              {formatFileSize(MEDIA_LIMITS.video.maxSizeBytes)}以下、7分以内
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-red-500 dark:text-red-400">{displayError}</p>
      )}

      {/* Media preview grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item, index) => (
            <div key={item.url} className="relative group aspect-square">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`${label} ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center relative">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover rounded-lg"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {item.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                    </div>
                  )}
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(item.url)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
