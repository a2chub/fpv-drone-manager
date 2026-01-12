import { useState, useCallback } from 'react'
import { UserList, UserSearchBar } from '@/components/user'
import { useUserSearch } from '@/hooks/useUserSearch'

export function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: users, isLoading, isError } = useUserSearch(searchTerm)

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          パイロット一覧
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          公開プロフィールを持つFPVパイロットを見つけましょう
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <UserSearchBar onSearch={handleSearch} />
      </div>

      {/* Error State */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">
              ユーザー一覧の取得に失敗しました。しばらく経ってからもう一度お試しください。
            </p>
          </div>
        </div>
      )}

      {/* Results info */}
      {!isLoading && !isError && users && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {searchTerm ? (
            <span>
              「{searchTerm}」の検索結果: {users.length}件
            </span>
          ) : (
            <span>{users.length}人のパイロット</span>
          )}
        </div>
      )}

      {/* User List */}
      {!isError && (
        <UserList
          users={users || []}
          isLoading={isLoading}
          emptyMessage={
            searchTerm
              ? `「${searchTerm}」に一致するユーザーが見つかりませんでした`
              : '公開プロフィールを持つユーザーがまだいません'
          }
        />
      )}
    </div>
  )
}
