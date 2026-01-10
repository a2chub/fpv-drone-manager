import { Timestamp } from 'firebase/firestore'
import {
  getDocuments,
  getDocument,
  orderBy,
  where,
} from '@/lib/firebase'
import type { RaceEvent, EventParticipant, EventPost } from '@/types'

export const publicEventService = {
  /**
   * 公開イベント一覧を取得
   * visibility='public', status='published', date降順
   */
  async getPublicEvents(): Promise<RaceEvent[]> {
    return getDocuments<RaceEvent>('raceEvents', [
      where('visibility', '==', 'public'),
      where('status', '==', 'published'),
      orderBy('date', 'desc'),
    ])
  },

  /**
   * 今後のイベント一覧を取得
   * date >= 今日, status='published', visibility='public', date昇順
   */
  async getUpcomingEvents(): Promise<RaceEvent[]> {
    const today = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))

    return getDocuments<RaceEvent>('raceEvents', [
      where('visibility', '==', 'public'),
      where('status', '==', 'published'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
    ])
  },

  /**
   * 過去のイベント一覧を取得
   * date < 今日, status in ['published', 'completed'], visibility='public', date降順
   */
  async getPastEvents(): Promise<RaceEvent[]> {
    const today = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))

    // Firestoreでは複合クエリでinとの組み合わせが制限されるため、
    // statusでフィルタリングした後にクライアント側でフィルタリング
    const events = await getDocuments<RaceEvent>('raceEvents', [
      where('visibility', '==', 'public'),
      where('date', '<', today),
      orderBy('date', 'desc'),
    ])

    // status が 'published' または 'completed' のみを返す
    return events.filter(
      (event) => event.status === 'published' || event.status === 'completed'
    )
  },

  /**
   * 公開イベント詳細を取得
   * visibilityがpublicでない場合はnullを返す
   */
  async getPublicEventById(eventId: string): Promise<RaceEvent | null> {
    const event = await getDocument<RaceEvent>('raceEvents', eventId)

    if (!event) {
      return null
    }

    // 公開イベントのみ返却
    if (event.visibility !== 'public') {
      return null
    }

    return event
  },

  /**
   * 承認済み参加者一覧を取得
   * status='approved'
   */
  async getApprovedParticipants(eventId: string): Promise<EventParticipant[]> {
    return getDocuments<EventParticipant>(
      `raceEvents/${eventId}/participants`,
      [where('status', '==', 'approved')]
    )
  },

  /**
   * 公開投稿一覧を取得
   */
  async getPublicPosts(eventId: string): Promise<EventPost[]> {
    return getDocuments<EventPost>(`raceEvents/${eventId}/posts`, [
      orderBy('createdAt', 'desc'),
    ])
  },
}
