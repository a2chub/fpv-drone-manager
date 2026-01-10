import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
  where,
} from '@/lib/firebase'
import { serverTimestamp } from 'firebase/firestore'
import type {
  EventParticipant,
  ParticipantFormData,
  RegistrationType,
} from '@/types/event'

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
   */
  async create(
    eventId: string,
    user: CreateParticipantUser,
    data: ParticipantFormData,
    registrationType: RegistrationType
  ): Promise<string> {
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
}
