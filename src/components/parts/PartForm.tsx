import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { PART_CATEGORIES, type Part, type PartFormData } from '@/types'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ImageUploader } from '@/components/common'

// フォーム入力用の型（imagesとpurchaseDateはフォーム外で管理）
interface PartFormInput {
  category: PartFormData['category']
  name: string
  manufacturer: string
  model: string
  purchasePrice: number
  purchaseStore: string
  purchaseUrl: string
  notes: string
  isPublic: boolean
}

const MAX_IMAGES = 5

interface PartFormProps {
  part?: Part | null
  onSubmit: (data: PartFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  images?: string[]
  onImagesChange?: (images: string[]) => void
}

export function PartForm({ part, onSubmit, onCancel, isSubmitting, images = [], onImagesChange }: PartFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartFormInput>({
    defaultValues: {
      category: 'motor',
      name: '',
      manufacturer: '',
      model: '',
      purchasePrice: 0,
      purchaseStore: '',
      purchaseUrl: '',
      notes: '',
      isPublic: false,
    },
  })

  // Image upload hook
  const { uploadMultiple, remove, isUploading, error: uploadError } = useImageUpload({ path: 'parts', maxFiles: MAX_IMAGES })

  useEffect(() => {
    if (part) {
      reset({
        category: part.category,
        name: part.name,
        manufacturer: part.manufacturer,
        model: part.model,
        purchasePrice: part.purchasePrice,
        purchaseStore: part.purchaseStore,
        purchaseUrl: part.purchaseUrl || '',
        notes: part.notes,
        isPublic: part.isPublic,
      })
    }
  }, [part, reset])

  // Handle image upload
  const handleImageUpload = useCallback(async (files: File[]): Promise<string[]> => {
    const uploadedUrls = await uploadMultiple(files)
    const newImages = [...images, ...uploadedUrls]
    onImagesChange?.(newImages)
    return uploadedUrls
  }, [uploadMultiple, images, onImagesChange])

  // Handle image removal
  const handleImageRemove = useCallback(async (imageUrl: string): Promise<void> => {
    await remove(imageUrl)
    const newImages = images.filter((url) => url !== imageUrl)
    onImagesChange?.(newImages)
  }, [remove, images, onImagesChange])

  const handleFormSubmit = async (data: PartFormInput) => {
    // PartFormInput を PartFormData に変換
    const formData: PartFormData = {
      ...data,
      purchasePrice: Number(data.purchasePrice) || 0,
      purchaseDate: null,
      images, // Use images from props
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Category */}
      <div>
        <label htmlFor="category" className="label">
          カテゴリー <span className="text-red-500">*</span>
        </label>
        <select id="category" {...register('category')} className="input">
          {PART_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="label">
          パーツ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'パーツ名を入力してください' })}
          className="input"
          placeholder="例: EMAX ECO II 2807"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Manufacturer & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="manufacturer" className="label">
            メーカー
          </label>
          <input
            type="text"
            id="manufacturer"
            {...register('manufacturer')}
            className="input"
            placeholder="例: EMAX"
          />
        </div>
        <div>
          <label htmlFor="model" className="label">
            型番
          </label>
          <input
            type="text"
            id="model"
            {...register('model')}
            className="input"
            placeholder="例: ECO II 2807 1300KV"
          />
        </div>
      </div>

      {/* Purchase Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="purchasePrice" className="label">
            購入価格（円）
          </label>
          <input
            type="number"
            id="purchasePrice"
            {...register('purchasePrice')}
            className="input"
            placeholder="例: 3500"
          />
        </div>
        <div>
          <label htmlFor="purchaseStore" className="label">
            購入店舗
          </label>
          <input
            type="text"
            id="purchaseStore"
            {...register('purchaseStore')}
            className="input"
            placeholder="例: Amazon"
          />
        </div>
      </div>

      {/* Purchase URL */}
      <div>
        <label htmlFor="purchaseUrl" className="label">
          購入URL
        </label>
        <input
          type="url"
          id="purchaseUrl"
          {...register('purchaseUrl')}
          className="input"
          placeholder="https://..."
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          メモ
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          className="input min-h-[80px]"
          placeholder="パーツに関するメモ"
        />
      </div>

      {/* Image Upload */}
      <ImageUploader
        images={images}
        onUpload={handleImageUpload}
        onRemove={handleImageRemove}
        isUploading={isUploading}
        maxImages={MAX_IMAGES}
        label="パーツ画像"
      />
      {uploadError && (
        <p className="text-red-500 text-sm">{uploadError}</p>
      )}

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          {...register('isPublic')}
          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          このパーツを公開する
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
          {isSubmitting ? '保存中...' : part ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  )
}
