import { Link } from 'react-router-dom'
import { useUpcomingEvents } from '@/hooks/usePublicEvents'
import { usePopularUsers } from '@/hooks/useUserSearch'
import { GlassCard } from '@/components/common/GlassCard'
import { GradientText } from '@/components/common/GradientText'
import type { RaceEvent, User } from '@/types'

// モックデータ - 実ユーザーがいない場合に表示
const MOCK_USERS: Partial<User>[] = [
  { id: 'mock1', displayName: 'TinyWhoop Master', photoURL: null, profile: { bio: '', location: '東京都', socialLinks: {} } },
  { id: 'mock2', displayName: 'FPV_Racer_JP', photoURL: null, profile: { bio: '', location: '千葉県', socialLinks: {} } },
  { id: 'mock3', displayName: 'DroneBuilder', photoURL: null, profile: { bio: '', location: '大阪府', socialLinks: {} } },
]

const MOCK_EVENTS = [
  { id: 'mock1', title: '関東FPVレース大会', location: '千葉県', date: null },
  { id: 'mock2', title: 'TinyWhoop練習会', location: '東京都', date: null },
  { id: 'mock3', title: '初心者向けFPV体験会', location: '大阪府', date: null },
]

function formatDate(timestamp: { toDate: () => Date } | null): string {
  if (!timestamp) return '近日開催'
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })
}

interface PublicContentSectionProps {
  compact?: boolean
}

export function PublicContentSection({ compact = false }: PublicContentSectionProps) {
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents()
  const { data: users, isLoading: usersLoading } = usePopularUsers(3)

  // 最新3件のイベントのみ表示
  const recentEvents = events?.slice(0, 3) || []

  // 実データがなければモックを使用
  const displayUsers = users && users.length > 0 ? users : MOCK_USERS
  const displayEvents = recentEvents.length > 0 ? recentEvents : MOCK_EVENTS
  const useMockUsers = !users || users.length === 0
  const useMockEvents = recentEvents.length === 0

  // compactモード: Hero内で使用、タイトルなし
  if (compact) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 人気パイロット */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                アクティブなパイロット
              </h3>
              <Link
                to="/users"
                className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            {usersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {displayUsers.map((user) => (
                  <Link
                    key={user.id}
                    to={useMockUsers ? '/users' : `/u/${user.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                        {user.displayName}
                      </span>
                      {user.profile?.location && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {user.profile.location}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>

          {/* 公開イベント */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                開催予定イベント
              </h3>
              <Link
                to="/events"
                className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {displayEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={useMockEvents ? '/events' : `/e/${event.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors block">
                        {event.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {'date' in event && event.date ? formatDate(event.date as { toDate: () => Date }) : '近日開催'} · {event.location}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    )
  }

  // 通常モード（フルサイズ）
  return (
    <div className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* セクションタイトル */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <GradientText>コミュニティ</GradientText>を探索
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            他のパイロットやイベントを見つけて、FPVコミュニティとつながりましょう
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 公開イベント */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                今後のイベント
              </h3>
              <Link
                to="/events"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={useMockEvents ? '/events' : `/e/${event.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded flex items-center justify-center flex-shrink-0">
                      {'coverImageUrl' in event && (event as RaceEvent).coverImageUrl ? (
                        <img
                          src={(event as RaceEvent).coverImageUrl!}
                          alt={event.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {'date' in event && event.date ? formatDate(event.date as { toDate: () => Date }) : '近日開催'} · {event.location}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>

          {/* 人気パイロット */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                人気パイロット
              </h3>
              <Link
                to="/users"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayUsers.map((user) => (
                  <Link
                    key={user.id}
                    to={useMockUsers ? '/users' : `/u/${user.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-purple-600 dark:text-purple-400">
                          {user.displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                        {user.displayName}
                      </h4>
                      {user.profile?.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.profile.location}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
