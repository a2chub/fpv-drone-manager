import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDrone, useCreateDrone, useUpdateDrone } from '@/hooks/useDrones'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ImageUploader } from '@/components/common'
import type { DroneCategory, DroneStatus } from '@/types'

interface DroneFormValues {
  name: string
  description: string
  mainImageUrl: string
  category: DroneCategory
  status: DroneStatus
  specifications: {
    frameSize: string
    weight: number | undefined
    batteryType: string
  }
  isPublic: boolean
}

const MAX_IMAGES = 5

const CATEGORIES: { value: DroneCategory; label: string }[] = [
  { value: 'racing', label: 'レーシング' },
  { value: 'freestyle', label: 'フリースタイル' },
  { value: 'long_range', label: 'ロングレンジ' },
  { value: 'micro', label: 'マイクロ' },
  { value: 'other', label: 'その他' },
]

const STATUSES: { value: DroneStatus; label: string }[] = [
  { value: 'active', label: '稼働中' },
  { value: 'retired', label: '引退' },
  { value: 'under_repair', label: '修理中' },
]

export function DroneFormPage() {
  const { droneId } = useParams<{ droneId: string }>()
  const navigate = useNavigate()
  const isEditing = !!droneId

  const { data: drone, isLoading: isDroneLoading } = useDrone(droneId)
  const createMutation = useCreateDrone()
  const updateMutation = useUpdateDrone()

  // Image upload state
  const [images, setImages] = useState<string[]>([])
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const { uploadMultiple, remove, isUploading, error: uploadError } = useImageUpload({ path: 'drones', maxFiles: MAX_IMAGES })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DroneFormValues>({
    defaultValues: {
      name: '',
      description: '',
      mainImageUrl: '',
      category: 'racing',
      status: 'active',
      specifications: {
        frameSize: '',
        weight: undefined,
        batteryType: '',
      },
      isPublic: false,
    },
  })

  // Load existing images when editing
  useEffect(() => {
    if (drone) {
      reset({
        name: drone.name,
        description: drone.description,
        mainImageUrl: drone.mainImageUrl,
        category: drone.category,
        status: drone.status,
        specifications: {
          frameSize: drone.specifications.frameSize,
          weight: drone.specifications.weight,
          batteryType: drone.specifications.batteryType,
        },
        isPublic: drone.isPublic,
      })
      // Set images from drone data
      setImages(drone.images || [])
      setMainImageUrl(drone.mainImageUrl || '')
    }
  }, [drone, reset])

  // Handle image upload
  const handleImageUpload = useCallback(async (files: File[]): Promise<string[]> => {
    const uploadedUrls = await uploadMultiple(files)
    setImages((prev) => {
      const newImages = [...prev, ...uploadedUrls]
      // Set the first image as main image if no main image is set
      if (!mainImageUrl && newImages.length > 0) {
        setMainImageUrl(newImages[0])
      }
      return newImages
    })
    return uploadedUrls
  }, [uploadMultiple, mainImageUrl])

  // Handle image removal
  const handleImageRemove = useCallback(async (imageUrl: string): Promise<void> => {
    await remove(imageUrl)
    setImages((prev) => {
      const newImages = prev.filter((url) => url !== imageUrl)
      // Update main image if the removed image was the main image
      if (mainImageUrl === imageUrl) {
        setMainImageUrl(newImages.length > 0 ? newImages[0] : '')
      }
      return newImages
    })
  }, [remove, mainImageUrl])

  const onSubmit = async (data: DroneFormValues) => {
    try {
      const formData = {
        ...data,
        images,
        mainImageUrl,
        specifications: {
          ...data.specifications,
          weight: data.specifications.weight || 0,
        },
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ droneId: droneId!, data: formData })
      } else {
        const newId = await createMutation.mutateAsync(formData)
        navigate(`/drones/${newId}`)
        return
      }
      navigate(`/drones/${droneId}`)
    } catch (error) {
      console.error('Failed to save drone:', error)
    }
  }

  if (isEditing && isDroneLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          to={isEditing ? `/drones/${droneId}` : '/drones'}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </Link>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEditing ? '機体を編集' : '新しい機体を登録'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              機体名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="input"
              placeholder="例: Nazgul Evoque F5"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="label">
                カテゴリー
              </label>
              <select id="category" {...register('category')} className="input">
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="label">
                ステータス
              </label>
              <select id="status" {...register('status')} className="input">
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">スペック</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="frameSize" className="label text-xs">
                  フレームサイズ
                </label>
                <input
                  type="text"
                  id="frameSize"
                  {...register('specifications.frameSize')}
                  className="input"
                  placeholder="例: 5inch"
                />
              </div>
              <div>
                <label htmlFor="weight" className="label text-xs">
                  重量 (g)
                </label>
                <input
                  type="number"
                  id="weight"
                  {...register('specifications.weight')}
                  className="input"
                  placeholder="例: 650"
                />
              </div>
              <div>
                <label htmlFor="batteryType" className="label text-xs">
                  バッテリー
                </label>
                <input
                  type="text"
                  id="batteryType"
                  {...register('specifications.batteryType')}
                  className="input"
                  placeholder="例: 6S 1300mAh"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              説明
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="input min-h-[120px]"
              placeholder="機体の特徴や用途など"
            />
          </div>

          {/* Image Upload */}
          <ImageUploader
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            isUploading={isUploading}
            maxImages={MAX_IMAGES}
            label="機体画像"
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
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              この機体を公開する
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              to={isEditing ? `/drones/${droneId}` : '/drones'}
              className="btn-secondary"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : isEditing ? '更新する' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
