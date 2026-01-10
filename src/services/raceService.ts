import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
  where,
} from '@/lib/firebase'
import { Timestamp } from 'firebase/firestore'
import type { Race, RaceFormData } from '@/types'

const getRacesPath = (userId: string) => `users/${userId}/races`

export const raceService = {
  async getAll(userId: string): Promise<Race[]> {
    return getDocuments<Race>(getRacesPath(userId), [
      orderBy('date', 'desc'),
    ])
  },

  async getByDroneId(userId: string, droneId: string): Promise<Race[]> {
    return getDocuments<Race>(getRacesPath(userId), [
      where('usedDroneId', '==', droneId),
      orderBy('date', 'desc'),
    ])
  },

  async getById(userId: string, raceId: string): Promise<Race | null> {
    return getDocument<Race>(getRacesPath(userId), raceId)
  },

  async create(userId: string, data: RaceFormData, usedDroneName: string): Promise<string> {
    const docRef = await createDocument(getRacesPath(userId), {
      ...data,
      date: Timestamp.fromDate(data.date),
      userId,
      usedDroneName,
    })
    return docRef.id
  },

  async update(
    userId: string,
    raceId: string,
    data: Partial<RaceFormData>,
    usedDroneName?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = { ...data }
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }
    if (usedDroneName !== undefined) {
      updateData.usedDroneName = usedDroneName
    }
    await updateDocument(getRacesPath(userId), raceId, updateData)
  },

  async delete(userId: string, raceId: string): Promise<void> {
    await deleteDocument(getRacesPath(userId), raceId)
  },

  async togglePublic(
    userId: string,
    raceId: string,
    isPublic: boolean
  ): Promise<void> {
    await updateDocument(getRacesPath(userId), raceId, { isPublic })
  },
}
