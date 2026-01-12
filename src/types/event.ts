import type { Timestamp } from 'firebase/firestore'
import type { MediaItem } from './media'

// イベントカテゴリー
export type EventCategory = 'official' | 'local' | 'practice' | 'meetup' | 'other'

// イベントステータス
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

// 参加登録タイプ
export type RegistrationType = 'open' | 'approval'

// 公開設定
export type EventVisibility = 'public' | 'private'

// 参加者ステータス
export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// レースイベント
export interface RaceEvent {
  id: string
  title: string
  description: string
  organizerId: string
  organizerName: string
  organizerPhotoURL: string | null
  date: Timestamp
  endDate: Timestamp | null
  location: string
  locationDetails: string | null
  officialUrl: string | null
  category: EventCategory
  capacity: number | null
  registrationType: RegistrationType
  visibility: EventVisibility
  status: EventStatus
  coverImageUrl: string | null
  images: string[]
  participantCount: number
  postCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// イベント作成/更新フォームデータ
export interface RaceEventFormData {
  title: string
  description: string
  date: Date
  endDate: Date | null
  location: string
  locationDetails: string
  officialUrl: string
  category: EventCategory
  capacity: number | null
  registrationType: RegistrationType
  visibility: EventVisibility
  status: EventStatus
  coverImageUrl: string
  images: string[]
}

// 参加者
export interface EventParticipant {
  id: string
  eventId: string
  userId: string
  displayName: string
  photoURL: string | null
  status: ParticipantStatus
  message: string | null
  approvedAt: Timestamp | null
  linkedRaceId: string | null
  isPublic: boolean // この参加履歴を公開プロフィールに表示するか
  createdAt: Timestamp
  updatedAt: Timestamp
}

// 参加申請フォームデータ
export interface ParticipantFormData {
  message: string
}

// 事後投稿
export interface EventPost {
  id: string
  eventId: string
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  media: MediaItem[]
  images?: string[] // 後方互換性のため残す
  isOrganizer: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// 事後投稿フォームデータ
export interface EventPostFormData {
  content: string
  media: MediaItem[]
}

// カテゴリーラベル
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'official', label: '公式レース' },
  { value: 'local', label: 'ローカルレース' },
  { value: 'practice', label: '練習会' },
  { value: 'meetup', label: 'ミートアップ' },
  { value: 'other', label: 'その他' },
]

// ステータスラベル
export const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: '下書き' },
  { value: 'published', label: '公開中' },
  { value: 'cancelled', label: '中止' },
  { value: 'completed', label: '終了' },
]

// 参加者ステータスラベル
export const PARTICIPANT_STATUSES: { value: ParticipantStatus; label: string }[] = [
  { value: 'pending', label: '承認待ち' },
  { value: 'approved', label: '承認済み' },
  { value: 'rejected', label: '拒否' },
  { value: 'cancelled', label: 'キャンセル' },
]

// 参加登録タイプラベル
export const REGISTRATION_TYPES: { value: RegistrationType; label: string }[] = [
  { value: 'open', label: '自由参加' },
  { value: 'approval', label: '承認制' },
]

// 公開設定ラベル
export const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: 'public', label: '公開' },
  { value: 'private', label: '限定公開' },
]
