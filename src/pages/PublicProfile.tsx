import { useParams, Link } from 'react-router-dom'
import { usePublicUser, usePublicDrones, usePublicRaces } from '@/hooks/usePublicData'
import type { Drone, Race } from '@/types'
import { RACE_CATEGORIES } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  racing: 'レーシング',
  freestyle: 'フリースタイル',
  long_range: 'ロングレンジ',
  micro: 'マイクロ',
  other: 'その他',
}

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface PublicDroneCardProps {
  drone: Drone
  userId: string
}

function PublicDroneCard({ drone, userId }: PublicDroneCardProps) {
  return (
    <Link to={`/u/${userId}/drones/${drone.id}`} className="block">
      <div className="card overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800">
        <div className="aspect-video bg-gray-100 dark:bg-gray-700">
          {drone.mainImageUrl ? (
            <img
              src={drone.mainImageUrl}
              alt={drone.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {CATEGORY_LABELS[drone.category]}
          </span>
          <h3 className="font-medium text-gray-900 dark:text-white mt-2 truncate">
            {drone.name}
          </h3>
          {drone.specifications.frameSize && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {drone.specifications.frameSize}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

interface PublicRaceCardProps {
  race: Race
  userId: string
}

function PublicRaceCard({ race, userId }: PublicRaceCardProps) {
  const categoryLabel =
    RACE_CATEGORIES.find((c) => c.value === race.category)?.label || race.category

  const rankDisplay =
    race.result.rank !== null
      ? race.result.totalParticipants !== null
        ? `${race.result.rank}位 / ${race.result.totalParticipants}人中`
        : `${race.result.rank}位`
      : null

  return (
    <Link to={`/u/${userId}/races/${race.id}`} className="block">
      <div className="card p-4 hover:shadow-lg transition-shadow dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
            {race.images && race.images.length > 0 ? (
              <img
                src={race.images[0]}
                alt={race.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {categoryLabel}
            </span>
            <h4 className="font-medium text-gray-900 dark:text-white truncate mt-1">
              {race.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(race.date)}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{race.location}</p>
              {rankDisplay && (
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {rankDisplay}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ShareButtons({ url, userName }: { url: string; userName: string }) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${userName}さんのドローンプロフィールをチェック！`
  )}&url=${encodeURIComponent(url)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert('リンクをコピーしました')
    } catch {
      alert('リンクのコピーに失敗しました')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        シェア
      </a>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        リンクをコピー
      </button>
    </div>
  )
}

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isLoading: userLoading, error: userError } = usePublicUser(userId)
  const { data: drones, isLoading: dronesLoading } = usePublicDrones(userId)
  const { data: races, isLoading: racesLoading } = usePublicRaces(userId)

  const isLoading = userLoading || dronesLoading || racesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">ユーザーが見つかりませんでした</p>
        <Link to="/" className="text-primary-500 hover:underline mt-4 inline-block">
          トップページに戻る
        </Link>
      </div>
    )
  }

  const currentUrl = window.location.href

  return (
    <div>
      {/* Profile Header */}
      <div className="card p-6 mb-8 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.displayName}
            </h1>
            {user.profile.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{user.profile.bio}</p>
            )}
            {user.profile.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {user.profile.location}
              </p>
            )}

            {/* Social Links */}
            {(user.profile.socialLinks.twitter ||
              user.profile.socialLinks.instagram ||
              user.profile.socialLinks.youtube) && (
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                {user.profile.socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${user.profile.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {user.profile.socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${user.profile.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E4405F] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {user.profile.socialLinks.youtube && (
                  <a
                    href={`https://youtube.com/@${user.profile.socialLinks.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#FF0000] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex-shrink-0">
            <ShareButtons url={currentUrl} userName={user.displayName} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {drones?.length || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">公開機体</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {races?.length || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">公開レース</p>
          </div>
        </div>
      </div>

      {/* Public Drones */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          公開機体
        </h2>
        {drones && drones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drones.map((drone) => (
              <PublicDroneCard key={drone.id} drone={drone} userId={userId!} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center dark:bg-gray-800">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">公開されている機体はありません</p>
          </div>
        )}
      </section>

      {/* Public Races */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          公開レース
        </h2>
        {races && races.length > 0 ? (
          <div className="space-y-3">
            {races.map((race) => (
              <PublicRaceCard key={race.id} race={race} userId={userId!} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center dark:bg-gray-800">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">公開されているレースはありません</p>
          </div>
        )}
      </section>
    </div>
  )
}
