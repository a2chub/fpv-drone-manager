import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
} from '@/lib/firebase'
import type { PartHistory, PartHistoryFormData } from '@/types'

const getHistoriesPath = (userId: string, droneId: string, partId: string) =>
  `users/${userId}/drones/${droneId}/parts/${partId}/histories`

export const partHistoryService = {
  async getAll(
    userId: string,
    droneId: string,
    partId: string
  ): Promise<PartHistory[]> {
    return getDocuments<PartHistory>(getHistoriesPath(userId, droneId, partId), [
      orderBy('date', 'desc'),
    ])
  },

  async getById(
    userId: string,
    droneId: string,
    partId: string,
    historyId: string
  ): Promise<PartHistory | null> {
    return getDocument<PartHistory>(
      getHistoriesPath(userId, droneId, partId),
      historyId
    )
  },

  async create(
    userId: string,
    droneId: string,
    partId: string,
    data: PartHistoryFormData
  ): Promise<string> {
    const docRef = await createDocument(
      getHistoriesPath(userId, droneId, partId),
      {
        ...data,
        partId,
        images: [],
      }
    )
    return docRef.id
  },

  async update(
    userId: string,
    droneId: string,
    partId: string,
    historyId: string,
    data: Partial<PartHistoryFormData>
  ): Promise<void> {
    await updateDocument(
      getHistoriesPath(userId, droneId, partId),
      historyId,
      data
    )
  },

  async delete(
    userId: string,
    droneId: string,
    partId: string,
    historyId: string
  ): Promise<void> {
    await deleteDocument(getHistoriesPath(userId, droneId, partId), historyId)
  },
}
