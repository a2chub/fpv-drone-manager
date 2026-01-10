import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react'

interface ImageUploaderProps {
  images: string[]
  onUpload: (files: File[]) => Promise<string[]>
  onRemove: (imageUrl: string) => Promise<void>
  isUploading?: boolean
  maxImages?: number
  label?: string
}

export function ImageUploader({
  images,
  onUpload,
  onRemove,
  isUploading = false,
  maxImages = 5,
  label = '画像',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingUrl, setRemovingUrl] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)

    if (images.length + fileArray.length > maxImages) {
      setError(`画像は最大${maxImages}枚までです`)
      return
    }

    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== fileArray.length) {
      setError('画像ファイルのみアップロードできます')
      return
    }

    try {
      await onUpload(imageFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    }
  }, [images.length, maxImages, onUpload])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files)
      // Reset input for re-selection of same file
      e.target.value = ''
    }
  }, [handleFiles])

  const handleRemove = useCallback(async (imageUrl: string) => {
    setRemovingUrl(imageUrl)
    try {
      await onRemove(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setRemovingUrl(null)
    }
  }, [onRemove])

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>

      {/* Existing images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt=""
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={removingUrl === url}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity disabled:opacity-50"
              >
                {removingUrl === url ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-500">アップロード中...</p>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500">
                クリックまたはドラッグ&ドロップで画像を追加
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/{maxImages}枚（最大10MB）
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
