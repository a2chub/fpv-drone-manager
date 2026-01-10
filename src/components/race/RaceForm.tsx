import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDrones } from '@/hooks/useDrones'
import type { Race, RaceFormData, RaceCategory } from '@/types'
import { RACE_CATEGORIES } from '@/types'

interface RaceFormProps {
  race?: Race | null
  onSubmit: (data: RaceFormData, usedDroneName: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

interface RaceFormValues {
  name: string
  date: string
  location: string
  officialUrl: string
  category: RaceCategory
  rank: string
  totalParticipants: string
  lapTime: string
  usedDroneId: string
  impressions: string
  isPublic: boolean
}

function formatDateForInput(timestamp: { toDate: () => Date } | null): string {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toISOString().split('T')[0]
}

export function RaceForm({ race, onSubmit, onCancel, isSubmitting }: RaceFormProps) {
  const { data: drones } = useDrones()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RaceFormValues>({
    defaultValues: {
      name: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      officialUrl: '',
      category: 'official',
      rank: '',
      totalParticipants: '',
      lapTime: '',
      usedDroneId: '',
      impressions: '',
      isPublic: false,
    },
  })

  useEffect(() => {
    if (race) {
      reset({
        name: race.name,
        date: formatDateForInput(race.date),
        location: race.location,
        officialUrl: race.officialUrl || '',
        category: race.category,
        rank: race.result.rank?.toString() || '',
        totalParticipants: race.result.totalParticipants?.toString() || '',
        lapTime: race.result.lapTime || '',
        usedDroneId: race.usedDroneId || '',
        impressions: race.impressions,
        isPublic: race.isPublic,
      })
    }
  }, [race, reset])

  const handleFormSubmit = (values: RaceFormValues) => {
    const selectedDrone = drones?.find((d) => d.id === values.usedDroneId)
    const usedDroneName = selectedDrone?.name || ''

    const formData: RaceFormData = {
      name: values.name,
      date: new Date(values.date),
      location: values.location,
      officialUrl: values.officialUrl || '',
      category: values.category,
      result: {
        rank: values.rank ? parseInt(values.rank, 10) : null,
        totalParticipants: values.totalParticipants
          ? parseInt(values.totalParticipants, 10)
          : null,
        lapTime: values.lapTime || null,
      },
      usedDroneId: values.usedDroneId || '',
      impressions: values.impressions,
      images: race?.images || [],
      isPublic: values.isPublic,
    }

    onSubmit(formData, usedDroneName)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Race Name */}
      <div>
        <label htmlFor="name" className="label">
          レース名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'レース名は必須です' })}
          className="input"
          placeholder="例: JDRA 2024 Round1"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Date and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="label">
            開催日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: '開催日は必須です' })}
            className="input"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="category" className="label">
            カテゴリー
          </label>
          <select id="category" {...register('category')} className="input">
            {RACE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="label">
          開催場所 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          {...register('location', { required: '開催場所は必須です' })}
          className="input"
          placeholder="例: 横浜赤レンガ倉庫"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Official URL */}
      <div>
        <label htmlFor="officialUrl" className="label">
          公式URL
        </label>
        <input
          type="url"
          id="officialUrl"
          {...register('officialUrl')}
          className="input"
          placeholder="https://example.com/race"
        />
      </div>

      {/* Results */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">結果</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="rank" className="label text-xs">
              順位
            </label>
            <input
              type="number"
              id="rank"
              min="1"
              {...register('rank')}
              className="input"
              placeholder="例: 3"
            />
          </div>
          <div>
            <label htmlFor="totalParticipants" className="label text-xs">
              参加者数
            </label>
            <input
              type="number"
              id="totalParticipants"
              min="1"
              {...register('totalParticipants')}
              className="input"
              placeholder="例: 24"
            />
          </div>
          <div>
            <label htmlFor="lapTime" className="label text-xs">
              ベストラップ
            </label>
            <input
              type="text"
              id="lapTime"
              {...register('lapTime')}
              className="input"
              placeholder="例: 1:23.456"
            />
          </div>
        </div>
      </div>

      {/* Used Drone */}
      <div>
        <label htmlFor="usedDroneId" className="label">
          使用機体
        </label>
        <select id="usedDroneId" {...register('usedDroneId')} className="input">
          <option value="">選択してください</option>
          {drones?.map((drone) => (
            <option key={drone.id} value={drone.id}>
              {drone.name}
            </option>
          ))}
        </select>
        {(!drones || drones.length === 0) && (
          <p className="text-xs text-gray-500 mt-1">
            機体が登録されていません。先に機体を登録してください。
          </p>
        )}
      </div>

      {/* Impressions */}
      <div>
        <label htmlFor="impressions" className="label">
          感想・振り返り
        </label>
        <textarea
          id="impressions"
          {...register('impressions')}
          className="input min-h-[120px]"
          placeholder="レースの感想や反省点など"
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
          このレース記録を公開する
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : race ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}
