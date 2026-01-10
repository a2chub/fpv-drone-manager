import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { RaceEventFormData } from '@/types'
import { EVENT_CATEGORIES, EVENT_STATUSES, REGISTRATION_TYPES, VISIBILITY_OPTIONS } from '@/types'

// フォーム内部で使用する型（日付は文字列）
interface EventFormValues {
  title: string
  description: string
  date: string
  endDate: string
  location: string
  locationDetails: string
  officialUrl: string
  category: string
  capacity: number | null
  registrationType: string
  visibility: string
  status: string
  coverImageUrl: string
  images: string[]
}

interface EventFormProps {
  initialData?: Partial<EventFormValues>
  onSubmit: (data: RaceEventFormData) => void
  isSubmitting?: boolean
}

export function EventForm({ initialData, onSubmit, isSubmitting = false }: EventFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      endDate: '',
      location: '',
      locationDetails: '',
      officialUrl: '',
      category: 'other',
      capacity: null,
      registrationType: 'open',
      visibility: 'public',
      status: 'draft',
      coverImageUrl: '',
      images: [],
    },
  })

  // initialData が変更されたらフォームをリセット
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date || '',
        endDate: initialData.endDate || '',
        location: initialData.location || '',
        locationDetails: initialData.locationDetails || '',
        officialUrl: initialData.officialUrl || '',
        category: initialData.category || 'other',
        capacity: initialData.capacity ?? null,
        registrationType: initialData.registrationType || 'open',
        visibility: initialData.visibility || 'public',
        status: initialData.status || 'draft',
        coverImageUrl: initialData.coverImageUrl || '',
        images: initialData.images || [],
      })
    }
  }, [initialData, reset])

  const onFormSubmit = (data: EventFormValues) => {
    // Convert date strings to Date objects for RaceEventFormData
    const formattedData: RaceEventFormData = {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location,
      locationDetails: data.locationDetails,
      officialUrl: data.officialUrl,
      category: data.category as RaceEventFormData['category'],
      capacity: data.capacity ? Number(data.capacity) : null,
      registrationType: data.registrationType as RaceEventFormData['registrationType'],
      visibility: data.visibility as RaceEventFormData['visibility'],
      status: data.status as RaceEventFormData['status'],
      coverImageUrl: data.coverImageUrl,
      images: data.images,
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'タイトルは必須です' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="イベントタイトル"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          説明
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="イベントの説明"
        />
      </div>

      {/* Date and End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            開催日 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="date"
            {...register('date', { required: '開催日は必須です' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            終了日時
          </label>
          <input
            type="datetime-local"
            id="endDate"
            {...register('endDate')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location and Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            開催場所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            {...register('location', { required: '開催場所は必須です' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="東京都渋谷区..."
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="locationDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            場所詳細
          </label>
          <input
            type="text"
            id="locationDetails"
            {...register('locationDetails')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="施設名、部屋番号など"
          />
        </div>
      </div>

      {/* Official URL */}
      <div>
        <label htmlFor="officialUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          公式URL
        </label>
        <input
          type="url"
          id="officialUrl"
          {...register('officialUrl')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://example.com/event"
        />
      </div>

      {/* Category and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            カテゴリー
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {EVENT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            定員
          </label>
          <input
            type="number"
            id="capacity"
            {...register('capacity')}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="定員なしの場合は空欄"
          />
        </div>
      </div>

      {/* Registration Type and Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="registrationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            参加登録タイプ
          </label>
          <select
            id="registrationType"
            {...register('registrationType')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {REGISTRATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            公開設定
          </label>
          <select
            id="visibility"
            {...register('visibility')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ステータス
        </label>
        <select
          id="status"
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {EVENT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cover Image URL */}
      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          カバー画像URL
        </label>
        <input
          type="url"
          id="coverImageUrl"
          {...register('coverImageUrl')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          画像アップロード機能は別途実装されます
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 dark:disabled:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>保存中...</span>
            </>
          ) : (
            <span>保存</span>
          )}
        </button>
      </div>
    </form>
  )
}
