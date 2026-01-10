import type { Timestamp } from 'firebase/firestore'

export type RaceCategory = 'official' | 'local' | 'practice' | 'other'

export interface RaceResult {
  rank: number | null
  totalParticipants: number | null
  lapTime: string | null
}

export interface Race {
  id: string
  userId: string
  name: string
  date: Timestamp
  location: string
  officialUrl: string | null
  category: RaceCategory
  result: RaceResult
  usedDroneId: string | null
  usedDroneName: string
  impressions: string
  images: string[]
  isPublic: boolean
  eventId?: string | null // レースイベントとの紐付け
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface RaceFormData {
  name: string
  date: Date
  location: string
  officialUrl: string
  category: RaceCategory
  result: RaceResult
  usedDroneId: string
  impressions: string
  images: string[]
  isPublic: boolean
}

export const RACE_CATEGORIES: { value: RaceCategory; label: string }[] = [
  { value: 'official', label: '公式レース' },
  { value: 'local', label: 'ローカルレース' },
  { value: 'practice', label: '練習' },
  { value: 'other', label: 'その他' },
]
