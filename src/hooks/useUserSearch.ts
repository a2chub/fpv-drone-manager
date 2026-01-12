import { useQuery } from '@tanstack/react-query'
import { userSearchService } from '@/services/userSearchService'

const PUBLIC_USERS_QUERY_KEY = 'publicUsers'
const POPULAR_USERS_QUERY_KEY = 'popularUsers'
const USER_SEARCH_QUERY_KEY = 'userSearch'

/**
 * 公開ユーザー一覧を取得するフック
 */
export function usePublicUsers(maxResults: number = 20) {
  return useQuery({
    queryKey: [PUBLIC_USERS_QUERY_KEY, maxResults],
    queryFn: () => userSearchService.getPublicUsers(maxResults),
  })
}

/**
 * 人気ユーザー一覧を取得するフック
 */
export function usePopularUsers(maxResults: number = 10) {
  return useQuery({
    queryKey: [POPULAR_USERS_QUERY_KEY, maxResults],
    queryFn: () => userSearchService.getPopularUsers(maxResults),
  })
}

/**
 * ユーザー名検索フック
 */
export function useUserSearch(searchTerm: string, maxResults: number = 20) {
  return useQuery({
    queryKey: [USER_SEARCH_QUERY_KEY, searchTerm, maxResults],
    queryFn: () => userSearchService.searchUsersByName(searchTerm, maxResults),
    // 検索語が空の場合は通常の一覧を返す
    // デバウンス処理はコンポーネント側で行う
  })
}
