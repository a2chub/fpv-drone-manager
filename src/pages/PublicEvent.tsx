import { useParams, Link } from 'react-router-dom'
import { usePublicEvent, usePublicEventParticipants, usePublicEventPosts } from '@/hooks/usePublicEvents'
import { PostCard, AlbumGallery } from '@/components/event'
import { useAuth } from '@/contexts/AuthContext'
import { ContentGate } from '@/components/common'
import { EVENT_CATEGORIES } from '@/types'

// 名前を部分的に隠すヘルパー関数
function maskName(name: string): string {
  if (name.length <= 3) return name[0] + '***'
  return name.slice(0, 3) + '***'
}

function formatDate(timestamp: { toDate: () => Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PublicEvent() {
  const { eventId } = useParams<{ eventId: string }>()
  const { isAuthenticated } = useAuth()

  const { data: event, isLoading: eventLoading } = usePublicEvent(eventId)
  const { data: participants } = usePublicEventParticipants(eventId)
  const { data: posts } = usePublicEventPosts(eventId)

  if (eventLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          イベントが見つかりません
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          このイベントは非公開か、削除された可能性があります。
        </p>
        <Link
          to="/"
          className="text-primary-500 hover:text-primary-600"
        >
          ホームに戻る
        </Link>
      </div>
    )
  }

  const categoryLabel = EVENT_CATEGORIES.find((c) => c.value === event.category)?.label || event.category

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Event Header - 基本情報は常に表示 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Cover Image */}
        {event.coverImageUrl && (
          <div className="h-48 md:h-64 overflow-hidden">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {event.title}
          </h1>

          {/* Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.participantCount}人参加</span>
            </div>
          </div>

          {/* Organizer - 非認証時はぼかし */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {event.organizerPhotoURL ? (
                <img
                  src={event.organizerPhotoURL}
                  alt={isAuthenticated ? event.organizerName : '主催者'}
                  className={`w-full h-full object-cover ${!isAuthenticated ? 'blur-md' : ''}`}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-gray-400 ${!isAuthenticated ? 'blur-sm' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* 非認証時のオーバーレイ */}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">主催者</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {isAuthenticated ? event.organizerName : maskName(event.organizerName)}
              </p>
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">共有:</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('リンクをコピーしました')
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              title="リンクをコピー"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ部分をContentGateでラップ */}
      <ContentGate
        previewHeight={400}
        title="ログインしてイベント詳細を見る"
        description="アカウントを作成して、参加者情報やイベントの写真・動画をチェックしましょう。"
        benefits={[
          '参加者一覧を見る',
          '写真・動画アルバムを見る',
          'イベントに参加申し込み',
        ]}
      >
        {/* Description */}
        {event.description && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              イベント詳細
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Participants Preview */}
        {participants && participants.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              参加者 ({participants.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {participants.slice(0, 10).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    {participant.photoURL ? (
                      <img
                        src={participant.photoURL}
                        alt={participant.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        {participant.displayName[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {participant.displayName}
                  </span>
                </div>
              ))}
              {participants.length > 10 && (
                <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  +{participants.length - 10}人
                </span>
              )}
            </div>
          </div>
        )}

        {/* Album Preview */}
        {posts && posts.some((p) => (p.media?.length || p.images?.length || 0) > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              アルバム
            </h2>
            <AlbumGallery posts={posts} />
          </div>
        )}

        {/* Posts */}
        {posts && posts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              投稿 ({posts.length})
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </ContentGate>
    </div>
  )
}
