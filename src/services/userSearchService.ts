import { getDocuments, orderBy, limit, where } from '@/lib/firebase'
import type { User } from '@/types'

export const userSearchService = {
  /**
   * 公開プロフィールを持つユーザー一覧を取得（更新日時順）
   */
  async getPublicUsers(maxResults: number = 20): Promise<User[]> {
    return getDocuments<User>('users', [
      where('settings.isProfilePublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(maxResults),
    ])
  },

  /**
   * 人気ユーザーを取得（更新日時順）
   */
  async getPopularUsers(maxResults: number = 10): Promise<User[]> {
    return getDocuments<User>('users', [
      where('settings.isProfilePublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(maxResults),
    ])
  },

  /**
   * ユーザー名で検索（クライアントサイドフィルタリング）
   * Firestoreは部分一致検索をサポートしていないため、
   * 一度取得してからフィルタリング
   */
  async searchUsersByName(
    searchTerm: string,
    maxResults: number = 20
  ): Promise<User[]> {
    if (!searchTerm.trim()) {
      return this.getPublicUsers(maxResults)
    }

    const normalizedTerm = searchTerm.toLowerCase().trim()

    // 公開ユーザーを取得してフィルタリング
    const users = await getDocuments<User>('users', [
      where('settings.isProfilePublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(100), // 検索対象を最大100件に制限
    ])

    return users
      .filter((user) =>
        user.displayName.toLowerCase().includes(normalizedTerm)
      )
      .slice(0, maxResults)
  },
}
