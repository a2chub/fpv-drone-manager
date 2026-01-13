import { Timestamp } from 'firebase/firestore'
import { MediaItem } from './media'

/**
 * 整備タイプ
 */
export type MaintenanceType =
  | 'cleaning'      // 掃除・洗浄
  | 'repair'        // 修理
  | 'replacement'   // パーツ交換
  | 'tuning'        // チューニング・調整
  | 'firmware'      // ファームウェア更新
  | 'inspection'    // 点検
  | 'upgrade'       // 性能向上・アップグレード
  | 'other'         // その他

/**
 * 整備タイプのラベル
 */
export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  cleaning: '掃除・洗浄',
  repair: '修理',
  replacement: 'パーツ交換',
  tuning: 'チューニング・調整',
  firmware: 'ファームウェア更新',
  inspection: '点検',
  upgrade: 'アップグレード',
  other: 'その他',
}

/**
 * 整備タイプのアイコン名（Lucide React用）
 */
export const MAINTENANCE_TYPE_ICONS: Record<MaintenanceType, string> = {
  cleaning: 'Droplets',
  repair: 'Wrench',
  replacement: 'RefreshCw',
  tuning: 'SlidersHorizontal',
  firmware: 'Cpu',
  inspection: 'Search',
  upgrade: 'TrendingUp',
  other: 'MoreHorizontal',
}

/**
 * 関連パーツ情報
 */
export interface RelatedPart {
  partId: string
  partName: string
  category: string
}

/**
 * 整備記録投稿
 */
export interface MaintenancePost {
  id: string
  userId: string           // 投稿者ID
  userName: string         // 投稿者名（非正規化）
  userPhotoURL: string | null

  droneId: string          // 対象ドローンID
  droneName: string        // ドローン名（非正規化）
  droneImageUrl: string | null

  type: MaintenanceType    // 整備タイプ
  title: string            // タイトル（例: "モーター交換完了！"）
  content: string          // 本文（詳細な説明）

  media: MediaItem[]       // 写真・動画（最大10枚）

  // オプション: 関連パーツ情報
  relatedParts?: RelatedPart[]

  // SNS連携
  isPublic: boolean        // 公開フラグ

  // エンゲージメント
  likeCount: number        // いいね数
  commentCount: number     // コメント数

  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 整備投稿作成用フォームデータ
 */
export interface MaintenancePostFormData {
  droneId: string
  type: MaintenanceType
  title: string
  content: string
  media: MediaItem[]
  relatedParts?: RelatedPart[]
  isPublic: boolean
}

/**
 * 整備投稿コメント
 */
export interface MaintenancePostComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  isDeleted: boolean
  deletedAt?: Timestamp
  deletedBy?: string
}

/**
 * 整備投稿コメント作成用フォームデータ
 */
export interface MaintenancePostCommentFormData {
  content: string
}

/**
 * いいね情報
 */
export interface MaintenancePostLike {
  id: string
  userId: string
  createdAt: Timestamp
}
