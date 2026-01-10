import type { RaceCategory, PartCategory, HistoryType, DroneCategory } from '@/types'

// イベント種別
export type CalendarEventType =
  | 'race'           // レース参加
  | 'partPurchase'   // パーツ購入
  | 'partHistory'    // パーツ履歴（修理、交換など）
  | 'droneCreated'   // 機体作成

// イベント色定義
export const EVENT_COLORS = {
  race: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    border: 'border-blue-500',
  },
  partPurchase: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    dot: 'bg-green-500',
    border: 'border-green-500',
  },
  partHistory: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    border: 'border-orange-500',
  },
  droneCreated: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
    border: 'border-purple-500',
  },
} as const

// イベントラベル
export const EVENT_LABELS: Record<CalendarEventType, string> = {
  race: 'レース',
  partPurchase: 'パーツ購入',
  partHistory: 'パーツ履歴',
  droneCreated: '機体作成',
}

// レースイベントメタデータ
export interface RaceEventMeta {
  type: 'race'
  raceId: string
  raceName: string
  location: string
  category: RaceCategory
  rank: number | null
  usedDroneName: string
}

// パーツ購入イベントメタデータ
export interface PartPurchaseEventMeta {
  type: 'partPurchase'
  partId: string
  droneId: string
  partName: string
  droneName: string
  category: PartCategory
  purchasePrice: number
  purchaseStore: string
}

// パーツ履歴イベントメタデータ
export interface PartHistoryEventMeta {
  type: 'partHistory'
  historyId: string
  partId: string
  droneId: string
  partName: string
  droneName: string
  historyType: HistoryType
  title: string
  description: string
}

// 機体作成イベントメタデータ
export interface DroneCreatedEventMeta {
  type: 'droneCreated'
  droneId: string
  droneName: string
  category: DroneCategory
}

// メタデータ統合型
export type CalendarEventMeta =
  | RaceEventMeta
  | PartPurchaseEventMeta
  | PartHistoryEventMeta
  | DroneCreatedEventMeta

// 統一イベント型
export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  date: Date
  metadata: CalendarEventMeta
}

// 日付キー生成（YYYY-MM-DD形式）
export type DateKey = string

// 日付ごとのイベントマップ
export type EventsByDate = Map<DateKey, CalendarEvent[]>
