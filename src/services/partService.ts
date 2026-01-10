import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
} from '@/lib/firebase'
import type { Part, PartFormData } from '@/types'

const getPartsPath = (userId: string, droneId: string) =>
  `users/${userId}/drones/${droneId}/parts`

export const partService = {
  async getAll(userId: string, droneId: string): Promise<Part[]> {
    return getDocuments<Part>(getPartsPath(userId, droneId), [
      orderBy('createdAt', 'desc'),
    ])
  },

  async getById(
    userId: string,
    droneId: string,
    partId: string
  ): Promise<Part | null> {
    return getDocument<Part>(getPartsPath(userId, droneId), partId)
  },

  async create(
    userId: string,
    droneId: string,
    data: PartFormData
  ): Promise<string> {
    const docRef = await createDocument(getPartsPath(userId, droneId), {
      ...data,
      droneId,
      purchaseDate: data.purchaseDate ? data.purchaseDate : null,
    })
    return docRef.id
  },

  async update(
    userId: string,
    droneId: string,
    partId: string,
    data: Partial<PartFormData>
  ): Promise<void> {
    await updateDocument(getPartsPath(userId, droneId), partId, {
      ...data,
      purchaseDate: data.purchaseDate ? data.purchaseDate : null,
    })
  },

  async delete(
    userId: string,
    droneId: string,
    partId: string
  ): Promise<void> {
    await deleteDocument(getPartsPath(userId, droneId), partId)
  },

  async togglePublic(
    userId: string,
    droneId: string,
    partId: string,
    isPublic: boolean
  ): Promise<void> {
    await updateDocument(getPartsPath(userId, droneId), partId, { isPublic })
  },
}
