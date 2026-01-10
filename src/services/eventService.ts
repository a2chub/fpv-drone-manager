import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
  where,
} from '@/lib/firebase'
import { Timestamp, increment } from 'firebase/firestore'
import type { RaceEvent, RaceEventFormData, EventStatus } from '@/types/event'

const COLLECTION_PATH = 'raceEvents'

interface OrganizerInfo {
  id: string
  displayName: string
  photoURL: string | null
}

export const eventService = {
  /**
   * 全公開イベントを取得（status=published, visibility=public）
   */
  async getAll(): Promise<RaceEvent[]> {
    return getDocuments<RaceEvent>(COLLECTION_PATH, [
      where('status', '==', 'published'),
      where('visibility', '==', 'public'),
      orderBy('date', 'desc'),
    ])
  },

  /**
   * 主催者のイベント一覧を取得
   */
  async getByOrganizer(organizerId: string): Promise<RaceEvent[]> {
    return getDocuments<RaceEvent>(COLLECTION_PATH, [
      where('organizerId', '==', organizerId),
      orderBy('date', 'desc'),
    ])
  },

  /**
   * 単一イベントを取得
   */
  async getById(eventId: string): Promise<RaceEvent | null> {
    return getDocument<RaceEvent>(COLLECTION_PATH, eventId)
  },

  /**
   * イベントを作成
   */
  async create(data: RaceEventFormData, organizer: OrganizerInfo): Promise<string> {
    const docRef = await createDocument(COLLECTION_PATH, {
      title: data.title,
      description: data.description,
      organizerId: organizer.id,
      organizerName: organizer.displayName,
      organizerPhotoURL: organizer.photoURL,
      date: Timestamp.fromDate(data.date),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
      location: data.location,
      locationDetails: data.locationDetails || null,
      officialUrl: data.officialUrl || null,
      category: data.category,
      capacity: data.capacity,
      registrationType: data.registrationType,
      visibility: data.visibility,
      status: data.status,
      coverImageUrl: data.coverImageUrl || null,
      images: data.images,
      participantCount: 0,
      postCount: 0,
    })
    return docRef.id
  },

  /**
   * イベントを更新
   */
  async update(eventId: string, data: Partial<RaceEventFormData>): Promise<void> {
    const updateData: Record<string, unknown> = { ...data }

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? Timestamp.fromDate(data.endDate) : null
    }
    if (data.locationDetails !== undefined) {
      updateData.locationDetails = data.locationDetails || null
    }
    if (data.officialUrl !== undefined) {
      updateData.officialUrl = data.officialUrl || null
    }
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl || null
    }

    await updateDocument(COLLECTION_PATH, eventId, updateData)
  },

  /**
   * イベントを削除
   */
  async delete(eventId: string): Promise<void> {
    await deleteDocument(COLLECTION_PATH, eventId)
  },

  /**
   * ステータスを更新
   */
  async updateStatus(eventId: string, status: EventStatus): Promise<void> {
    await updateDocument(COLLECTION_PATH, eventId, { status })
  },

  /**
   * 参加者数を更新
   */
  async incrementParticipantCount(eventId: string, delta: number): Promise<void> {
    await updateDocument(COLLECTION_PATH, eventId, {
      participantCount: increment(delta),
    })
  },

  /**
   * 投稿数を更新
   */
  async incrementPostCount(eventId: string, delta: number): Promise<void> {
    await updateDocument(COLLECTION_PATH, eventId, {
      postCount: increment(delta),
    })
  },
}
