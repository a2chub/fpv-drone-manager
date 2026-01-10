import type { Timestamp } from 'firebase/firestore'
import type { CalendarEvent, EventsByDate, DateKey } from '@/types'

// 曜日ラベル
export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

// 月ラベル
export const MONTH_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
] as const

/**
 * 日付キーを生成（YYYY-MM-DD形式）
 */
export function getDateKey(date: Date): DateKey {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Firebase Timestampを Date に変換
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate()
}

/**
 * 日付が指定月に含まれるかチェック
 */
export function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month
}

/**
 * 日付が今日かチェック
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 2つの日付が同じ日かチェック
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * 月の最初の日を取得
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * 月の最後の日を取得
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/**
 * 月の日数を取得
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 月の最初の曜日を取得（0: 日曜日, 1: 月曜日, ...）
 */
export function getFirstDayWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * カレンダーグリッド用の日付配列を生成
 * 前月末と翌月初の日付も含む（6週分 = 42日）
 */
export function generateCalendarDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDayWeekday = getFirstDayWeekday(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  // 前月の日付を追加
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i))
  }

  // 当月の日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // 翌月の日付を追加（6週分になるまで）
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

/**
 * イベントを日付ごとにグループ化
 */
export function groupEventsByDate(events: CalendarEvent[]): EventsByDate {
  const map = new Map<DateKey, CalendarEvent[]>()

  for (const event of events) {
    const key = getDateKey(event.date)
    const existing = map.get(key) || []
    existing.push(event)
    map.set(key, existing)
  }

  return map
}

/**
 * 月を進める
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * 日付をフォーマット（YYYY年MM月DD日）
 */
export function formatDateJapanese(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * 日付をフォーマット（MM/DD）
 */
export function formatDateShort(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

/**
 * 曜日を取得（日本語）
 */
export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()]
}
