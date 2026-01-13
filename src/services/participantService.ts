import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
  where,
  db,
} from '@/lib/firebase'
import { serverTimestamp, collectionGroup, query, getDocs, doc, getDoc } from 'firebase/firestore'
import type {
  EventParticipant,
  ParticipantFormData,
  RegistrationType,
  RaceEvent,
} from '@/types/event'

// 参加イベント詳細情報の型
export interface UserEventParticipation {
  participant: EventParticipant
  event: RaceEvent
}

const getParticipantsPath = (eventId: string) =>
  `raceEvents/${eventId}/participants`

interface CreateParticipantUser {
  id: string
  displayName: string
  photoURL: string | null
}

export const participantService = {
  /**
   * イベントの全参加者を取得
   */
  async getByEvent(eventId: string): Promise<EventParticipant[]> {
    return getDocuments<EventParticipant>(getParticipantsPath(eventId), [
      orderBy('createdAt', 'desc'),
    ])
  },

  /**
   * ユーザーの参加情報を取得
   */
  async getByUser(
    eventId: string,
    userId: string
  ): Promise<EventParticipant | null> {
    const participants = await getDocuments<EventParticipant>(
      getParticipantsPath(eventId),
      [where('userId', '==', userId)]
    )
    return participants.length > 0 ? participants[0] : null
  },

  /**
   * ユーザーが参加中の全イベントIDを取得
   * コレクショングループクエリは使用せず、publicEventServiceと連携して使用することを想定
   * 渡されたイベントIDリストに対して参加情報をチェック
   */
  async getAllByUser(
    userId: string,
    eventIds: string[]
  ): Promise<EventParticipant[]> {
    const results: EventParticipant[] = []
    for (const eventId of eventIds) {
      const participant = await this.getByUser(eventId, userId)
      if (participant) {
        results.push(participant)
      }
    }
    return results
  },

  /**
   * 参加登録
   * 既存の参加ドキュメントがある場合は更新（rejoin）を行う
   */
  async create(
    eventId: string,
    user: CreateParticipantUser,
    data: ParticipantFormData,
    registrationType: RegistrationType
  ): Promise<string> {
    // 既存の参加ドキュメントを確認
    const existing = await this.getByUser(eventId, user.id)

    if (existing) {
      // 既存ドキュメントがある場合は更新（rejoin）
      await this.rejoin(eventId, existing.id, registrationType)
      return existing.id
    }

    // 新規作成
    const status = registrationType === 'open' ? 'approved' : 'pending'
    const approvedAt = registrationType === 'open' ? serverTimestamp() : null

    const docRef = await createDocument(getParticipantsPath(eventId), {
      eventId,
      userId: user.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
      status,
      message: data.message || null,
      approvedAt,
      linkedRaceId: null,
      isPublic: false, // デフォルトは非公開
    })
    return docRef.id
  },

  /**
   * 承認
   */
  async approve(eventId: string, participantId: string): Promise<void> {
    await updateDocument(getParticipantsPath(eventId), participantId, {
      status: 'approved',
      approvedAt: serverTimestamp(),
    })
  },

  /**
   * 拒否
   */
  async reject(eventId: string, participantId: string): Promise<void> {
    await updateDocument(getParticipantsPath(eventId), participantId, {
      status: 'rejected',
    })
  },

  /**
   * キャンセル
   */
  async cancel(eventId: string, participantId: string): Promise<void> {
    await updateDocument(getParticipantsPath(eventId), participantId, {
      status: 'cancelled',
    })
  },

  /**
   * 再参加（キャンセル・拒否後の復帰）
   */
  async rejoin(
    eventId: string,
    participantId: string,
    registrationType: RegistrationType
  ): Promise<void> {
    const status = registrationType === 'open' ? 'approved' : 'pending'
    const approvedAt = registrationType === 'open' ? serverTimestamp() : null

    await updateDocument(getParticipantsPath(eventId), participantId, {
      status,
      approvedAt,
    })
  },

  /**
   * Race記録と紐付け
   */
  async linkRace(
    eventId: string,
    participantId: string,
    raceId: string
  ): Promise<void> {
    await updateDocument(getParticipantsPath(eventId), participantId, {
      linkedRaceId: raceId,
    })
  },

  /**
   * 参加削除
   */
  async delete(eventId: string, participantId: string): Promise<void> {
    await deleteDocument(getParticipantsPath(eventId), participantId)
  },

  /**
   * 公開設定を更新
   */
  async updateVisibility(
    eventId: string,
    participantId: string,
    isPublic: boolean
  ): Promise<void> {
    await updateDocument(getParticipantsPath(eventId), participantId, {
      isPublic,
    })
  },

  /**
   * ユーザーの全参加履歴を取得（イベント情報含む）
   */
  async getUserParticipations(userId: string): Promise<UserEventParticipation[]> {
    // コレクショングループクエリで全イベントの参加者を検索
    const participantsQuery = query(
      collectionGroup(db, 'participants'),
      where('userId', '==', userId),
      where('status', '==', 'approved')
    )

    const participantsSnap = await getDocs(participantsQuery)
    const results: UserEventParticipation[] = []

    for (const participantDoc of participantsSnap.docs) {
      const participant = { id: participantDoc.id, ...participantDoc.data() } as EventParticipant
      const eventId = participant.eventId

      // イベント情報を取得
      const eventRef = doc(db, 'raceEvents', eventId)
      const eventSnap = await getDoc(eventRef)

      if (eventSnap.exists()) {
        const event = { id: eventSnap.id, ...eventSnap.data() } as RaceEvent
        results.push({ participant, event })
      }
    }

    // 日付順にソート（新しい順）
    results.sort((a, b) => {
      const dateA = a.event.date?.toMillis?.() || 0
      const dateB = b.event.date?.toMillis?.() || 0
      return dateB - dateA
    })

    return results
  },
}
