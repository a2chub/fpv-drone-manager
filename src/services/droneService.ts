import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from '@/lib/firebase'
import type { Drone, DroneFormData } from '@/types'

const getDronesPath = (userId: string) => `users/${userId}/drones`

export const droneService = {
  async getAll(userId: string): Promise<Drone[]> {
    return getDocuments<Drone>(getDronesPath(userId), [
      orderBy('createdAt', 'desc'),
    ])
  },

  async getById(userId: string, droneId: string): Promise<Drone | null> {
    return getDocument<Drone>(getDronesPath(userId), droneId)
  },

  async getPublic(userId: string): Promise<Drone[]> {
    return getDocuments<Drone>(getDronesPath(userId), [
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ])
  },

  async create(userId: string, data: DroneFormData): Promise<string> {
    const docRef = await createDocument(getDronesPath(userId), {
      ...data,
      userId,
    })
    return docRef.id
  },

  async update(
    userId: string,
    droneId: string,
    data: Partial<DroneFormData>
  ): Promise<void> {
    await updateDocument(getDronesPath(userId), droneId, data)
  },

  async delete(userId: string, droneId: string): Promise<void> {
    await deleteDocument(getDronesPath(userId), droneId)
  },

  async togglePublic(
    userId: string,
    droneId: string,
    isPublic: boolean
  ): Promise<void> {
    await updateDocument(getDronesPath(userId), droneId, { isPublic })
  },
}
