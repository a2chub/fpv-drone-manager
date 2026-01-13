import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, AlertCircle } from 'lucide-react'
import { EnhancedUserCard, UserFilterBar, AdvancedFilterPanel } from '@/components/user'
import { FeaturedPilotCard } from '@/components/home/SuggestedPilots'
import { useUserSearch, usePopularUsers } from '@/hooks/useUserSearch'
import type { UserFilterType } from '@/components/user'

export function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<UserFilterType>('popular')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<{
    hasAvatar?: boolean
    hasDrones?: boolean
    minFollowers?: number
  }>({})

  const { data: users, isLoading, isError } = useUserSearch(searchTerm)
  const { data: featuredPilot } = usePopularUsers(1)

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  // Filter users based on activeFilter
  const filteredUsers = users?.slice().sort((a, b) => {
    switch (activeFilter) {
      case 'popular':
        return ((b as any).followersCount || 0) - ((a as any).followersCount || 0)
      case 'recent':
        const aCreated = (a as any).createdAt?.toDate?.() || new Date(0)
        const bCreated = (b as any).createdAt?.toDate?.() || new Date(0)
        return bCreated.getTime() - aCreated.getTime()
      case 'active':
        const aActive = (a as any).lastActiveAt?.toDate?.() || new Date(0)
        const bActive = (b as any).lastActiveAt?.toDate?.() || new Date(0)
        return bActive.getTime() - aActive.getTime()
      default:
        return 0
    }
  })

  // Apply advanced filters
  const finalUsers = filteredUsers?.filter((user) => {
    if (advancedFilters.hasAvatar && !user.photoURL) return false
    if (advancedFilters.hasDrones && !((user as any).droneCount > 0)) return false
    if (advancedFilters.minFollowers && ((user as any).followersCount || 0) < advancedFilters.minFollowers) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              パイロットを探す
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {!isLoading && users && (
              <span className="font-mono text-primary-500">{users.length}</span>
            )}
            {' '}人のアクティブパイロットがいます
          </p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <UserFilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Search + Advanced Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="パイロットを検索..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <AdvancedFilterPanel
            isOpen={showAdvancedFilters}
            onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        </div>
      </motion.div>

      {/* Featured Pilot Spotlight */}
      {featuredPilot && featuredPilot.length > 0 && !searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              注目のパイロット
            </span>
            <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full">
              Featured
            </span>
          </div>
          <FeaturedPilotCard user={featuredPilot[0]} />
        </motion.div>
      )}

      {/* Error State */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              ユーザー一覧の取得に失敗しました。しばらく経ってからもう一度お試しください。
            </p>
          </div>
        </motion.div>
      )}

      {/* Results Info */}
      {!isLoading && !isError && finalUsers && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {searchTerm ? (
            <span>
              「<span className="text-gray-900 dark:text-white font-medium">{searchTerm}</span>」の検索結果: {finalUsers.length}件
            </span>
          ) : (
            <span>{finalUsers.length}人のパイロット</span>
          )}
        </div>
      )}

      {/* User Grid */}
      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading skeletons
            [...Array(8)].map((_, i) => (
              <div key={i} className="panel-card p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                </div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : finalUsers && finalUsers.length > 0 ? (
            finalUsers.map((user, index) => (
              <EnhancedUserCard key={user.id} user={user} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? `「${searchTerm}」に一致するユーザーが見つかりませんでした`
                  : '公開プロフィールを持つユーザーがまだいません'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
