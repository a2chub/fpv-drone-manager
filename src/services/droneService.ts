import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from '@/lib/firebase'
import { copyImage, copyMultipleImages } from '@/lib/firebase/storage'
import { partService } from './partService'
import type { Drone, DroneFormData, PartFormData } from '@/types'

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

  async copyDrone(
    userId: string,
    droneId: string
  ): Promise<{ droneId: string; copiedPartsCount: number }> {
    // 1. 元のドローンを取得
    const sourceDrone = await this.getById(userId, droneId)
    if (!sourceDrone) {
      throw new Error('コピー元の機体が見つかりません')
    }

    // 2. 元のパーツをすべて取得
    const sourceParts = await partService.getAll(userId, droneId)

    // 3. ドローンの画像をコピー
    let newMainImageUrl = ''
    let newImages: string[] = []

    if (sourceDrone.mainImageUrl) {
      newMainImageUrl = await copyImage(
        sourceDrone.mainImageUrl,
        userId,
        'drones'
      )
    }

    if (sourceDrone.images && sourceDrone.images.length > 0) {
      newImages = await copyMultipleImages(sourceDrone.images, userId, 'drones')
    }

    // 4. 新しいドローンを作成（コピー元と同じデータ + 新しい画像URL）
    const newDroneData: DroneFormData = {
      name: `${sourceDrone.name} (コピー)`,
      description: sourceDrone.description,
      mainImageUrl: newMainImageUrl,
      images: newImages,
      category: sourceDrone.category,
      specifications: { ...sourceDrone.specifications },
      status: sourceDrone.status,
      isPublic: false, // コピー時は非公開で開始
    }

    const newDroneId = await this.create(userId, newDroneData)

    // 5. パーツを新しいドローンにコピー
    let copiedPartsCount = 0
    for (const part of sourceParts) {
      // パーツの画像をコピー
      let newPartImages: string[] = []
      if (part.images && part.images.length > 0) {
        newPartImages = await copyMultipleImages(
          part.images,
          userId,
          `drones/${newDroneId}/parts`
        )
      }

      // パーツを作成
      const newPartData: PartFormData = {
        category: part.category,
        name: part.name,
        manufacturer: part.manufacturer,
        model: part.model,
        purchasePrice: part.purchasePrice,
        purchaseStore: part.purchaseStore,
        purchaseDate: part.purchaseDate ? part.purchaseDate.toDate() : null,
        purchaseUrl: part.purchaseUrl || '',
        images: newPartImages,
        notes: part.notes,
        isPublic: false, // コピー時は非公開で開始
      }

      await partService.create(userId, newDroneId, newPartData)
      copiedPartsCount++
    }

    return { droneId: newDroneId, copiedPartsCount }
  },
}
