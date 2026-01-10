import type { Timestamp } from 'firebase/firestore'

export type PartCategory =
  | 'motor'
  | 'fc'
  | 'esc'
  | 'frame'
  | 'propeller'
  | 'camera'
  | 'vtx'
  | 'receiver'
  | 'battery'
  | 'other'

export type HistoryType = 'usage' | 'repair' | 'negotiation' | 'replacement' | 'note'

export interface Part {
  id: string
  droneId: string
  category: PartCategory
  name: string
  manufacturer: string
  model: string
  purchasePrice: number
  purchaseStore: string
  purchaseDate: Timestamp | null
  purchaseUrl: string | null
  images: string[]
  notes: string
  isPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PartHistory {
  id: string
  partId: string
  type: HistoryType
  title: string
  description: string
  date: Timestamp
  images: string[]
  isPublic: boolean
  createdAt: Timestamp
}

export interface PartFormData {
  category: PartCategory
  name: string
  manufacturer: string
  model: string
  purchasePrice: number
  purchaseStore: string
  purchaseDate: Date | null
  purchaseUrl: string
  images: string[]
  notes: string
  isPublic: boolean
}

export interface PartHistoryFormData {
  type: HistoryType
  title: string
  description: string
  date: Date
  isPublic: boolean
}

export const PART_CATEGORIES: { value: PartCategory; label: string }[] = [
  { value: 'motor', label: 'モーター' },
  { value: 'fc', label: 'フライトコントローラー' },
  { value: 'esc', label: 'ESC' },
  { value: 'frame', label: 'フレーム' },
  { value: 'propeller', label: 'プロペラ' },
  { value: 'camera', label: 'カメラ' },
  { value: 'vtx', label: 'VTX' },
  { value: 'receiver', label: 'レシーバー' },
  { value: 'battery', label: 'バッテリー' },
  { value: 'other', label: 'その他' },
]

export const HISTORY_TYPES: { value: HistoryType; label: string }[] = [
  { value: 'usage', label: '使用' },
  { value: 'repair', label: '修理' },
  { value: 'negotiation', label: '調整' },
  { value: 'replacement', label: '交換' },
  { value: 'note', label: 'メモ' },
]
