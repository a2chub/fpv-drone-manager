import { describe, it, expect, vi, beforeEach } from 'vitest'

// Firebase Storage モジュールをモック
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  getBytes: vi.fn(),
}))

vi.mock('./config', () => ({
  storage: {},
}))

import { ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage'
import { copyImage, copyMultipleImages } from './storage'

describe('storage utilities', () => {
  const userId = 'test-user-id'
  const destPath = 'drones'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('copyImage', () => {
    it('should copy image to new location', async () => {
      const sourceUrl = 'https://storage.example.com/original.jpg'
      const mockBytes = new Uint8Array([1, 2, 3, 4])
      const mockRef = { name: 'ref' }
      const expectedUrl = 'https://storage.example.com/copied.jpg'

      vi.mocked(ref).mockReturnValue(mockRef as never)
      vi.mocked(getBytes).mockResolvedValue(mockBytes)
      vi.mocked(uploadBytes).mockResolvedValue({} as never)
      vi.mocked(getDownloadURL).mockResolvedValue(expectedUrl)

      const result = await copyImage(sourceUrl, userId, destPath)

      expect(result).toBe(expectedUrl)

      // ソースからバイトを取得
      expect(getBytes).toHaveBeenCalledWith(mockRef)

      // 新しい場所にアップロード
      expect(uploadBytes).toHaveBeenCalledWith(mockRef, mockBytes)

      // ダウンロードURLを取得
      expect(getDownloadURL).toHaveBeenCalledWith(mockRef)
    })

    it('should generate unique filename with timestamp', async () => {
      const sourceUrl = 'https://storage.example.com/users%2Ftest%2Foriginal.jpg?token=abc'
      const mockBytes = new Uint8Array([1, 2, 3])
      const mockRef = { name: 'ref' }

      vi.mocked(ref).mockReturnValue(mockRef as never)
      vi.mocked(getBytes).mockResolvedValue(mockBytes)
      vi.mocked(uploadBytes).mockResolvedValue({} as never)
      vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/new.jpg')

      await copyImage(sourceUrl, userId, destPath)

      // ref が新しいパスで呼ばれていることを確認
      expect(ref).toHaveBeenCalledTimes(2) // ソース用とデスト用

      // 2回目の呼び出し（デスト用）でパスにタイムスタンプとcopyが含まれる
      const secondCallArgs = vi.mocked(ref).mock.calls[1]
      expect(secondCallArgs[1]).toMatch(/users\/test-user-id\/drones\/\d+_copy_/)
    })
  })

  describe('copyMultipleImages', () => {
    it('should copy multiple images in parallel', async () => {
      const sourceUrls = [
        'https://storage.example.com/img1.jpg',
        'https://storage.example.com/img2.jpg',
        'https://storage.example.com/img3.jpg',
      ]
      const mockBytes = new Uint8Array([1, 2, 3])
      const mockRef = { name: 'ref' }

      vi.mocked(ref).mockReturnValue(mockRef as never)
      vi.mocked(getBytes).mockResolvedValue(mockBytes)
      vi.mocked(uploadBytes).mockResolvedValue({} as never)
      vi.mocked(getDownloadURL)
        .mockResolvedValueOnce('https://storage.example.com/new1.jpg')
        .mockResolvedValueOnce('https://storage.example.com/new2.jpg')
        .mockResolvedValueOnce('https://storage.example.com/new3.jpg')

      const results = await copyMultipleImages(sourceUrls, userId, destPath)

      expect(results).toHaveLength(3)
      expect(results).toEqual([
        'https://storage.example.com/new1.jpg',
        'https://storage.example.com/new2.jpg',
        'https://storage.example.com/new3.jpg',
      ])
    })

    it('should return empty array when no images provided', async () => {
      const results = await copyMultipleImages([], userId, destPath)

      expect(results).toEqual([])
      expect(getBytes).not.toHaveBeenCalled()
    })
  })
})
