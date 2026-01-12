import { doc, getDoc, query, getDocs, collectionGroup } from 'firebase/firestore'
import { getDocuments, where, orderBy, db } from '@/lib/firebase'
import type { User, Drone, Race, RaceEvent, EventParticipant } from '@/types'

// 公開イベント参加履歴の型
export interface PublicEventParticipation {
  eventId: string
  eventTitle: string
  eventDate: RaceEvent['date']
  eventLocation: string
  eventCoverImage: string | null
  participantStatus: EventParticipant['status']
  joinedAt: EventParticipant['createdAt']
}

export const publicService = {
  /**
   * 公開用のユーザー情報を取得
   */
  async getPublicUser(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User
    }

    return null
  },

  /**
   * 公開機体一覧を取得（isPublic: true のみ）
   */
  async getPublicDrones(userId: string): Promise<Drone[]> {
    return getDocuments<Drone>(`users/${userId}/drones`, [
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ])
  },

  /**
   * 公開レース一覧を取得（isPublic: true のみ）
   */
  async getPublicRaces(userId: string): Promise<Race[]> {
    return getDocuments<Race>(`users/${userId}/races`, [
      where('isPublic', '==', true),
      orderBy('date', 'desc'),
    ])
  },

  /**
   * 公開機体詳細を取得（isPublic: true の場合のみ返す）
   */
  async getPublicDrone(userId: string, droneId: string): Promise<Drone | null> {
    const droneRef = doc(db, `users/${userId}/drones`, droneId)
    const droneSnap = await getDoc(droneRef)

    if (droneSnap.exists()) {
      const drone = { id: droneSnap.id, ...droneSnap.data() } as Drone
      // 公開されている場合のみ返す
      if (drone.isPublic) {
        return drone
      }
    }

    return null
  },

  /**
   * 公開レース詳細を取得（isPublic: true の場合のみ返す）
   */
  async getPublicRace(userId: string, raceId: string): Promise<Race | null> {
    const raceRef = doc(db, `users/${userId}/races`, raceId)
    const raceSnap = await getDoc(raceRef)

    if (raceSnap.exists()) {
      const race = { id: raceSnap.id, ...raceSnap.data() } as Race
      // 公開されている場合のみ返す
      if (race.isPublic) {
        return race
      }
    }

    return null
  },

  /**
   * ユーザーのプロフィールが公開されているかチェック
   */
  async isProfilePublic(userId: string): Promise<boolean> {
    const user = await this.getPublicUser(userId)
    if (!user) return false
    return user.settings?.isProfilePublic ?? true
  },

  /**
   * ユーザーがイベント履歴を公開しているかチェック
   */
  async isEventHistoryPublic(userId: string): Promise<boolean> {
    const user = await this.getPublicUser(userId)
    if (!user) return false
    // プロフィールが非公開なら履歴も非公開
    if (!(user.settings?.isProfilePublic ?? true)) return false
    return user.settings?.showEventHistory ?? false
  },

  /**
   * 公開イベント参加履歴を取得（isPublic: true のみ）
   */
  async getPublicEventHistory(userId: string): Promise<PublicEventParticipation[]> {
    // コレクショングループクエリで全イベントの参加者を検索
    const participantsQuery = query(
      collectionGroup(db, 'participants'),
      where('userId', '==', userId),
      where('status', '==', 'approved'),
      where('isPublic', '==', true)
    )

    const participantsSnap = await getDocs(participantsQuery)
    const results: PublicEventParticipation[] = []

    for (const participantDoc of participantsSnap.docs) {
      const participant = participantDoc.data() as EventParticipant
      const eventId = participant.eventId

      // イベント情報を取得
      const eventRef = doc(db, 'raceEvents', eventId)
      const eventSnap = await getDoc(eventRef)

      if (eventSnap.exists()) {
        const event = eventSnap.data() as RaceEvent
        // 公開イベントのみ含める
        if (event.visibility === 'public' && event.status !== 'draft') {
          results.push({
            eventId,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            eventCoverImage: event.coverImageUrl,
            participantStatus: participant.status,
            joinedAt: participant.createdAt,
          })
        }
      }
    }

    // 日付順にソート（新しい順）
    results.sort((a, b) => {
      const dateA = a.eventDate?.toMillis?.() || 0
      const dateB = b.eventDate?.toMillis?.() || 0
      return dateB - dateA
    })

    return results
  },
}
