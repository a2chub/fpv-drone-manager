import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  collectionGroup,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Drone, RaceEvent } from '@/types'
import type { MaintenancePost } from '@/types/maintenancePost'
import type { FeedItem, DroneFeedItem, MaintenancePostFeedItem } from '@/types/feed'

export interface ActivityItem {
  id: string
  type: 'drone_added' | 'drone_updated' | 'event_joined'
  userId: string
  userName: string
  userPhotoURL: string | null
  title: string
  description?: string
  imageUrl?: string
  timestamp: Timestamp
  link: string
}

export const activityService = {
  // 最近更新された公開ドローンを取得
  async getRecentPublicDrones(limitCount = 10): Promise<Drone[]> {
    const dronesQuery = query(
      collectionGroup(db, 'drones'),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(dronesQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Drone[]
  },

  // 今後のイベントを取得
  async getUpcomingEvents(limitCount = 5): Promise<RaceEvent[]> {
    const now = Timestamp.now()
    const eventsRef = collection(db, 'raceEvents')
    const eventsQuery = query(
      eventsRef,
      where('status', '==', 'upcoming'),
      where('visibility', '==', 'public'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(eventsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RaceEvent[]
  },

  // フォロー中のユーザーのアクティビティを取得
  async getFollowingActivity(
    followingIds: string[],
    limitCount = 20
  ): Promise<Drone[]> {
    if (followingIds.length === 0) {
      return []
    }

    // Firestoreの 'in' クエリは最大10件まで
    const limitedIds = followingIds.slice(0, 10)

    const dronesQuery = query(
      collectionGroup(db, 'drones'),
      where('isPublic', '==', true),
      where('userId', 'in', limitedIds),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(dronesQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Drone[]
  },

  // 全体のアクティビティを取得（ドローン更新）
  async getAllActivity(limitCount = 20): Promise<Drone[]> {
    return this.getRecentPublicDrones(limitCount)
  },

  // 最近の公開整備投稿を取得
  async getRecentMaintenancePosts(limitCount = 20): Promise<MaintenancePost[]> {
    const maintenanceQuery = query(
      collectionGroup(db, 'maintenancePosts'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(maintenanceQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenancePost[]
  },

  // フォロー中のユーザーの整備投稿を取得
  async getFollowingMaintenancePosts(
    followingIds: string[],
    limitCount = 20
  ): Promise<MaintenancePost[]> {
    if (followingIds.length === 0) {
      return []
    }

    // Firestoreの 'in' クエリは最大10件まで
    const limitedIds = followingIds.slice(0, 10)

    const maintenanceQuery = query(
      collectionGroup(db, 'maintenancePosts'),
      where('isPublic', '==', true),
      where('userId', 'in', limitedIds),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(maintenanceQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenancePost[]
  },

  // 統合フィードを取得（ドローン更新 + 整備投稿を時系列でマージ）
  async getCombinedFeed(
    followingIds: string[],
    limitCount = 20
  ): Promise<FeedItem[]> {
    // 並列でデータ取得
    const [drones, maintenancePosts] = await Promise.all([
      followingIds.length > 0
        ? this.getFollowingActivity(followingIds, limitCount)
        : this.getRecentPublicDrones(limitCount),
      followingIds.length > 0
        ? this.getFollowingMaintenancePosts(followingIds, limitCount)
        : this.getRecentMaintenancePosts(limitCount),
    ])

    // ドローンをFeedItem形式に変換
    // Note: Drone型にはuserName/userPhotoURLが含まれないため、
    // フィード表示時にはドローン情報から必要なものを直接使用する
    const droneFeedItems: DroneFeedItem[] = drones.map(drone => ({
      id: `drone_${drone.id}`,
      type: 'drone_update' as const,
      userId: drone.userId,
      userName: '', // ドローン表示ではユーザー名は不要
      userPhotoURL: null,
      timestamp: drone.updatedAt,
      data: drone,
    }))

    // 整備投稿をFeedItem形式に変換
    const maintenanceFeedItems: MaintenancePostFeedItem[] = maintenancePosts.map(post => ({
      id: `maintenance_${post.id}`,
      type: 'maintenance_post' as const,
      userId: post.userId,
      userName: post.userName,
      userPhotoURL: post.userPhotoURL,
      timestamp: post.createdAt,
      data: post,
    }))

    // マージしてタイムスタンプでソート
    const combinedItems: FeedItem[] = [...droneFeedItems, ...maintenanceFeedItems]
    combinedItems.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() ?? 0
      const timeB = b.timestamp?.toMillis() ?? 0
      return timeB - timeA
    })

    // limitCount件に制限
    return combinedItems.slice(0, limitCount)
  },

  // 全体の統合フィードを取得（フォローなし）
  async getAllCombinedFeed(limitCount = 20): Promise<FeedItem[]> {
    return this.getCombinedFeed([], limitCount)
  },
}
