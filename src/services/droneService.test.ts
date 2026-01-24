import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Drone, DroneFormData, Part } from '@/types'
import type { Timestamp } from 'firebase/firestore'

// モック用の型
const createMockTimestamp = (): Timestamp => ({
  toDate: () => new Date('2024-01-01'),
  toMillis: () => 1704067200000,
  seconds: 1704067200,
  nanoseconds: 0,
  isEqual: () => true,
  valueOf: () => '1704067200000',
})

// Firebaseモジュールをモック
vi.mock('@/lib/firebase', () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}))

vi.mock('@/lib/firebase/storage', () => ({
  copyImage: vi.fn(),
  copyMultipleImages: vi.fn(),
}))

vi.mock('./partService', () => ({
  partService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}))

// モックをインポート後に取得
import { getDocument, createDocument } from '@/lib/firebase'
import { copyImage, copyMultipleImages } from '@/lib/firebase/storage'
import { partService } from './partService'
import { droneService } from './droneService'

describe('droneService.copyDrone', () => {
  const userId = 'test-user-id'
  const droneId = 'test-drone-id'
  const newDroneId = 'new-drone-id'

  const mockDrone: Drone = {
    id: droneId,
    userId: userId,
    name: 'Test Drone',
    description: 'Test description',
    mainImageUrl: 'https://storage.example.com/main.jpg',
    images: ['https://storage.example.com/img1.jpg', 'https://storage.example.com/img2.jpg'],
    category: 'racing',
    specifications: {
      frameSize: '5inch',
      weight: 250,
      batteryType: '4S',
    },
    status: 'active',
    isPublic: true,
    createdAt: createMockTimestamp(),
    updatedAt: createMockTimestamp(),
  }

  const mockParts: Part[] = [
    {
      id: 'part-1',
      droneId: droneId,
      category: 'motor',
      name: 'Test Motor',
      manufacturer: 'Test Maker',
      model: 'Model X',
      purchasePrice: 5000,
      purchaseStore: 'Test Store',
      purchaseDate: createMockTimestamp(),
      purchaseUrl: 'https://example.com/motor',
      images: ['https://storage.example.com/motor.jpg'],
      notes: 'Test notes',
      isPublic: true,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    },
    {
      id: 'part-2',
      droneId: droneId,
      category: 'fc',
      name: 'Test FC',
      manufacturer: 'Test Maker',
      model: 'FC Pro',
      purchasePrice: 8000,
      purchaseStore: 'Test Store',
      purchaseDate: null,
      purchaseUrl: null,
      images: [],
      notes: '',
      isPublic: false,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should copy drone with all parts and images', async () => {
    // モックの設定
    vi.mocked(getDocument).mockResolvedValue(mockDrone)
    vi.mocked(partService.getAll).mockResolvedValue(mockParts)
    vi.mocked(copyImage).mockResolvedValue('https://storage.example.com/copied-main.jpg')
    vi.mocked(copyMultipleImages)
      .mockResolvedValueOnce(['https://storage.example.com/copied-img1.jpg', 'https://storage.example.com/copied-img2.jpg'])
      .mockResolvedValueOnce(['https://storage.example.com/copied-motor.jpg'])
      .mockResolvedValueOnce([])
    vi.mocked(createDocument).mockResolvedValue({ id: newDroneId } as never)
    vi.mocked(partService.create).mockResolvedValue('new-part-id')

    // 実行
    const result = await droneService.copyDrone(userId, droneId)

    // 検証
    expect(result.droneId).toBe(newDroneId)
    expect(result.copiedPartsCount).toBe(2)

    // ドローンが取得されたことを確認
    expect(getDocument).toHaveBeenCalledWith(`users/${userId}/drones`, droneId)

    // パーツが取得されたことを確認
    expect(partService.getAll).toHaveBeenCalledWith(userId, droneId)

    // 画像がコピーされたことを確認
    expect(copyImage).toHaveBeenCalledWith(mockDrone.mainImageUrl, userId, 'drones')
    expect(copyMultipleImages).toHaveBeenCalledWith(mockDrone.images, userId, 'drones')

    // ドローンが作成されたことを確認（名前に(コピー)が付く、isPublicがfalse）
    expect(createDocument).toHaveBeenCalledWith(
      `users/${userId}/drones`,
      expect.objectContaining({
        name: 'Test Drone (コピー)',
        isPublic: false,
        mainImageUrl: 'https://storage.example.com/copied-main.jpg',
        images: ['https://storage.example.com/copied-img1.jpg', 'https://storage.example.com/copied-img2.jpg'],
      })
    )

    // パーツが作成されたことを確認
    expect(partService.create).toHaveBeenCalledTimes(2)
  })

  it('should throw error when source drone not found', async () => {
    vi.mocked(getDocument).mockResolvedValue(null)

    await expect(droneService.copyDrone(userId, droneId)).rejects.toThrow('コピー元の機体が見つかりません')
  })

  it('should handle drone without images', async () => {
    const droneWithoutImages: Drone = {
      ...mockDrone,
      mainImageUrl: '',
      images: [],
    }

    vi.mocked(getDocument).mockResolvedValue(droneWithoutImages)
    vi.mocked(partService.getAll).mockResolvedValue([])
    vi.mocked(createDocument).mockResolvedValue({ id: newDroneId } as never)

    const result = await droneService.copyDrone(userId, droneId)

    expect(result.droneId).toBe(newDroneId)
    expect(result.copiedPartsCount).toBe(0)

    // 画像コピーが呼ばれないことを確認
    expect(copyImage).not.toHaveBeenCalled()
    expect(copyMultipleImages).not.toHaveBeenCalled()
  })

  it('should preserve all specifications when copying', async () => {
    vi.mocked(getDocument).mockResolvedValue(mockDrone)
    vi.mocked(partService.getAll).mockResolvedValue([])
    vi.mocked(copyImage).mockResolvedValue('https://storage.example.com/copied.jpg')
    vi.mocked(copyMultipleImages).mockResolvedValue([])
    vi.mocked(createDocument).mockResolvedValue({ id: newDroneId } as never)

    await droneService.copyDrone(userId, droneId)

    expect(createDocument).toHaveBeenCalledWith(
      `users/${userId}/drones`,
      expect.objectContaining({
        category: 'racing',
        status: 'active',
        specifications: {
          frameSize: '5inch',
          weight: 250,
          batteryType: '4S',
        },
      })
    )
  })
})
