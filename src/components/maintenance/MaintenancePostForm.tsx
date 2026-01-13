import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  Wrench,
  RefreshCw,
  SlidersHorizontal,
  Cpu,
  Search,
  TrendingUp,
  MoreHorizontal,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { MediaUploader } from '@/components/common/MediaUploader'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { useDrones } from '@/hooks/useDrones'
import {
  type MaintenanceType,
  type MaintenancePostFormData,
  MAINTENANCE_TYPE_LABELS,
} from '@/types/maintenancePost'
import type { MediaItem } from '@/types/media'

interface MaintenancePostFormProps {
  droneId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormInputs {
  droneId: string
  type: MaintenanceType
  title: string
  content: string
  isPublic: boolean
}

const MAINTENANCE_TYPE_ICON_MAP: Record<MaintenanceType, React.ComponentType<{ className?: string }>> = {
  cleaning: Droplets,
  repair: Wrench,
  replacement: RefreshCw,
  tuning: SlidersHorizontal,
  firmware: Cpu,
  inspection: Search,
  upgrade: TrendingUp,
  other: MoreHorizontal,
}

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'cleaning',
  'repair',
  'replacement',
  'tuning',
  'firmware',
  'inspection',
  'upgrade',
  'other',
]

export function MaintenancePostForm({
  droneId: initialDroneId,
  onSuccess,
  onCancel,
}: MaintenancePostFormProps) {
  const { data: drones, isLoading: isDronesLoading } = useDrones()
  const [media, setMedia] = useState<MediaItem[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      droneId: initialDroneId || '',
      type: 'cleaning',
      title: '',
      content: '',
      isPublic: true,
    },
  })

  const isPublic = watch('isPublic')

  const { uploadMultiple, remove, isUploading, error: uploadError } = useMediaUpload({
    path: 'maintenance-posts',
    maxFiles: 10,
  })

  const handleMediaUpload = useCallback(
    async (files: File[]): Promise<MediaItem[]> => {
      const uploadedItems = await uploadMultiple(files)
      setMedia((prev) => [...prev, ...uploadedItems])
      return uploadedItems
    },
    [uploadMultiple]
  )

  const handleMediaRemove = useCallback(
    async (mediaUrl: string): Promise<void> => {
      await remove(mediaUrl)
      setMedia((prev) => prev.filter((item) => item.url !== mediaUrl))
    },
    [remove]
  )

  const onSubmit = async (data: FormInputs) => {
    const formData: MaintenancePostFormData = {
      droneId: data.droneId,
      type: data.type,
      title: data.title,
      content: data.content,
      media: media,
      isPublic: data.isPublic,
    }

    // TODO: Implement actual submission logic
    console.log('Submitting maintenance post:', formData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSuccess?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Drone Selection */}
        <div>
          <label
            htmlFor="droneId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            機体を選択 <span className="text-red-500">*</span>
          </label>
          {isDronesLoading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">読み込み中...</span>
            </div>
          ) : (
            <select
              id="droneId"
              {...register('droneId', { required: '機体を選択してください' })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="">機体を選択...</option>
              {drones?.map((drone) => (
                <option key={drone.id} value={drone.id}>
                  {drone.name}
                </option>
              ))}
            </select>
          )}
          {errors.droneId && (
            <p className="mt-1 text-sm text-red-500">{errors.droneId.message}</p>
          )}
        </div>

        {/* Maintenance Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            整備タイプ <span className="text-red-500">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: '整備タイプを選択してください' }}
            render={({ field }) => (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MAINTENANCE_TYPES.map((type) => {
                  const Icon = MAINTENANCE_TYPE_ICON_MAP[type]
                  const isSelected = field.value === type
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                        ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {MAINTENANCE_TYPE_LABELS[type]}
                      </span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
                          >
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </div>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register('title', {
              required: 'タイトルを入力してください',
              maxLength: { value: 100, message: 'タイトルは100文字以内で入力してください' },
            })}
            placeholder="例: モーター交換完了!"
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Content Input */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            詳細 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            {...register('content', {
              required: '詳細を入力してください',
              maxLength: { value: 2000, message: '詳細は2000文字以内で入力してください' },
            })}
            rows={5}
            placeholder="整備の詳細を記入してください..."
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Media Upload */}
        <MediaUploader
          media={media}
          onUpload={handleMediaUpload}
          onRemove={handleMediaRemove}
          isUploading={isUploading}
          maxMedia={10}
          label="写真・動画"
          error={uploadError}
        />

        {/* Public/Private Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Eye className="w-5 h-5 text-primary-500" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isPublic ? '公開' : '非公開'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPublic
                  ? 'この投稿は他のユーザーに公開されます'
                  : 'この投稿は自分だけが見ることができます'}
              </p>
            </div>
          </div>
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${field.value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.span
                  initial={false}
                  animate={{ x: field.value ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
            >
              キャンセル
            </motion.button>
          )}
          <motion.button
            type="submit"
            disabled={isSubmitting || isUploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-primary-300 disabled:to-primary-400 dark:disabled:from-primary-700 dark:disabled:to-primary-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25 disabled:shadow-none flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>投稿中...</span>
              </>
            ) : (
              <span>投稿する</span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
