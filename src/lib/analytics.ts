/**
 * Google Analytics 4 (GA4) ユーティリティ
 *
 * 環境変数 VITE_GA4_MEASUREMENT_ID から測定IDを取得し、
 * gtagスクリプトを動的に読み込む
 */

// グローバル型定義
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// GA4が初期化済みかどうか
let isInitialized = false

/**
 * GA4を初期化
 * gtagスクリプトを動的に読み込み、設定を行う
 */
export function initGA4(): void {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID

  if (!measurementId) {
    console.warn('[Analytics] GA4 measurement ID is not configured')
    return
  }

  if (isInitialized) {
    return
  }

  // dataLayer初期化
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }

  // gtagスクリプトを動的に読み込み
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // GA4設定
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false, // ページビューは手動で送信
  })

  isInitialized = true
  console.log('[Analytics] GA4 initialized with ID:', measurementId)
}

/**
 * ページビューを送信
 */
export function trackPageView(path: string, title?: string): void {
  if (!isInitialized) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  })
}

/**
 * カスタムイベントを送信
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!isInitialized) return

  window.gtag('event', eventName, params)
}

/**
 * ユーザープロパティを設定
 */
export function setUserProperties(
  properties: Record<string, string | number | boolean | null>
): void {
  if (!isInitialized) return

  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
  if (!measurementId) return

  window.gtag('config', measurementId, {
    user_properties: properties,
  })
}

/**
 * ユーザーIDを設定
 */
export function setUserId(userId: string | null): void {
  if (!isInitialized) return

  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
  if (!measurementId) return

  window.gtag('config', measurementId, {
    user_id: userId,
  })
}

// 定義済みイベント名（型安全のため）
export const AnalyticsEvents = {
  // 認証
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'sign_up',

  // ドローン
  CREATE_DRONE: 'create_drone',
  DELETE_DRONE: 'delete_drone',
  TOGGLE_DRONE_VISIBILITY: 'toggle_drone_visibility',

  // レース
  CREATE_RACE: 'create_race',
  DELETE_RACE: 'delete_race',

  // イベント
  CREATE_EVENT: 'create_event',
  DELETE_EVENT: 'delete_event',
  JOIN_EVENT: 'join_event',
  LEAVE_EVENT: 'leave_event',
  APPROVE_PARTICIPANT: 'approve_participant',
  REJECT_PARTICIPANT: 'reject_participant',

  // 投稿
  CREATE_POST: 'create_post',
  DELETE_POST: 'delete_post',

  // UI操作
  FILTER_CHANGE: 'filter_change',
  TAB_CHANGE: 'tab_change',
} as const
