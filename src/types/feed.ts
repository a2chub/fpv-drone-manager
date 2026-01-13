import { Timestamp } from 'firebase/firestore'
import { Drone } from './drone'
import { MaintenancePost } from './maintenancePost'
import { EventPost } from './event'

/**
 * フィードアイテムタイプ
 */
export type FeedItemType = 'drone_update' | 'maintenance_post' | 'event_post'

/**
 * フィードアイテム基本情報
 */
export interface FeedItemBase {
  id: string
  type: FeedItemType
  userId: string
  userName: string
  userPhotoURL: string | null
  timestamp: Timestamp
}

/**
 * ドローン更新フィードアイテム
 */
export interface DroneFeedItem extends FeedItemBase {
  type: 'drone_update'
  data: Drone
}

/**
 * 整備投稿フィードアイテム
 */
export interface MaintenancePostFeedItem extends FeedItemBase {
  type: 'maintenance_post'
  data: MaintenancePost
}

/**
 * イベント投稿フィードアイテム
 */
export interface EventPostFeedItem extends FeedItemBase {
  type: 'event_post'
  data: EventPost
}

/**
 * 統合フィードアイテム
 */
export type FeedItem = DroneFeedItem | MaintenancePostFeedItem | EventPostFeedItem

/**
 * フィードフィルター
 */
export type FeedFilter = 'all' | 'drones' | 'maintenance' | 'events'

/**
 * フィードフィルターのラベル
 */
export const FEED_FILTER_LABELS: Record<FeedFilter, string> = {
  all: 'すべて',
  drones: 'ドローン',
  maintenance: '整備記録',
  events: 'イベント',
}
