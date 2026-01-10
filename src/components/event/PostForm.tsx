import { useState } from 'react'
import type { EventPostFormData } from '@/types'

interface PostFormProps {
  initialData?: Partial<EventPostFormData>
  onSubmit: (data: EventPostFormData) => void
  isSubmitting?: boolean
  onCancel?: () => void
}

export function PostForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: PostFormProps) {
  const [content, setContent] = useState(initialData?.content || '')
  const [imagesText, setImagesText] = useState(initialData?.images?.join(', ') || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('内容を入力してください')
      return
    }

    const images = imagesText
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    onSubmit({
      content: content.trim(),
      images,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          感想・振り返り <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="イベントの感想や振り返りを入力..."
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          画像URL（カンマ区切り）
        </label>
        <input
          type="text"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          画像アップロード機能は別途実装されます
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 dark:disabled:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>投稿中...</span>
            </>
          ) : (
            <span>{initialData ? '更新する' : '投稿する'}</span>
          )}
        </button>
      </div>
    </form>
  )
}
