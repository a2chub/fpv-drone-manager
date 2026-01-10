import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { HISTORY_TYPES, type PartHistory, type PartHistoryFormData } from '@/types'

interface PartHistoryFormProps {
  history?: PartHistory | null
  onSubmit: (data: PartHistoryFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

interface FormInput {
  type: PartHistoryFormData['type']
  title: string
  description: string
  date: string
  isPublic: boolean
}

export function PartHistoryForm({
  history,
  onSubmit,
  onCancel,
  isSubmitting,
}: PartHistoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    defaultValues: {
      type: 'note',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isPublic: false,
    },
  })

  useEffect(() => {
    if (history) {
      const date = history.date.toDate()
      reset({
        type: history.type,
        title: history.title,
        description: history.description,
        date: date.toISOString().split('T')[0],
        isPublic: history.isPublic,
      })
    }
  }, [history, reset])

  const handleFormSubmit = async (data: FormInput) => {
    const formData: PartHistoryFormData = {
      type: data.type,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      isPublic: data.isPublic,
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Type */}
      <div>
        <label htmlFor="type" className="label">
          種類 <span className="text-red-500">*</span>
        </label>
        <select id="type" {...register('type')} className="input">
          {HISTORY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="label">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'タイトルを入力してください' })}
          className="input"
          placeholder="例: モーター交換"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="label">
          日付 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          {...register('date', { required: '日付を入力してください' })}
          className="input"
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          説明
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="input min-h-[100px]"
          placeholder="詳細な説明を入力..."
        />
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          {...register('isPublic')}
          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          この履歴を公開する
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : history ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  )
}
