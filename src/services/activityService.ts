import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Drone, RaceEvent } from '@/types'

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
    // collectionGroupを使って全ユーザーのドローンを横断検索
    const { collectionGroup } = await import('firebase/firestore')
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

    const { collectionGroup } = await import('firebase/firestore')
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
}
