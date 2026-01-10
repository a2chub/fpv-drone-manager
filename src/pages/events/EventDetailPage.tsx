import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEvent, useUpdateEventStatus } from '@/hooks/useEvents'
import { useParticipants, useMyParticipation, useJoinEvent, useApproveParticipant, useRejectParticipant, useCancelParticipation } from '@/hooks/useParticipants'
import { useEventPosts, useCreateEventPost, useDeleteEventPost } from '@/hooks/useEventPosts'
import { ParticipantList, JoinModal, PostCard, PostForm } from '@/components/event'
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/types'
import type { EventStatus, EventPostFormData } from '@/types'

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

export function EventDetailPage() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { user } = useAuth()

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)

  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: participants } = useParticipants(eventId)
  const { data: myParticipation } = useMyParticipation(eventId)
  const { data: posts } = useEventPosts(eventId)

  const joinEventMutation = useJoinEvent()
  const approveParticipantMutation = useApproveParticipant()
  const rejectParticipantMutation = useRejectParticipant()
  const cancelParticipationMutation = useCancelParticipation()
  const updateStatusMutation = useUpdateEventStatus()
  const createPostMutation = useCreateEventPost()
  const deletePostMutation = useDeleteEventPost()

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
        <p className="text-gray-500 dark:text-gray-400">イベントが見つかりませんでした</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 text-primary-500 hover:text-primary-600"
        >
          イベント一覧に戻る
        </button>
      </div>
    )
  }

  const isOrganizer = user?.id === event.organizerId
  const isParticipant = myParticipation?.status === 'approved'
  const isPending = myParticipation?.status === 'pending'
  const canJoin = !myParticipation && event.status === 'published'
  const canPost = isOrganizer || isParticipant

  const categoryLabel = EVENT_CATEGORIES.find((c) => c.value === event.category)?.label || event.category
  const statusLabel = EVENT_STATUSES.find((s) => s.value === event.status)?.label || event.status

  const handleJoin = async (data: { message: string }) => {
    if (!eventId) return
    await joinEventMutation.mutateAsync({
      eventId,
      data,
      registrationType: event.registrationType,
    })
    setShowJoinModal(false)
  }

  const handleApprove = async (participantId: string) => {
    if (!eventId) return
    await approveParticipantMutation.mutateAsync({ eventId, participantId })
  }

  const handleReject = async (participantId: string) => {
    if (!eventId) return
    await rejectParticipantMutation.mutateAsync({ eventId, participantId })
  }

  const handleCancel = async () => {
    if (!eventId || !myParticipation) return
    if (window.confirm('参加をキャンセルしますか？')) {
      await cancelParticipationMutation.mutateAsync({
        eventId,
        participantId: myParticipation.id,
      })
    }
  }

  const handleStatusChange = async (status: EventStatus) => {
    if (!eventId) return
    await updateStatusMutation.mutateAsync({ eventId, status })
  }

  const handleCreatePost = async (data: EventPostFormData) => {
    if (!eventId) return
    await createPostMutation.mutateAsync({
      eventId,
      data,
      isOrganizer,
    })
    setShowPostForm(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!eventId) return
    if (window.confirm('この投稿を削除しますか？')) {
      await deletePostMutation.mutateAsync({ eventId, postId })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        イベント一覧
      </button>

      {/* Event Header */}
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
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {categoryLabel}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {statusLabel}
            </span>
            {event.registrationType === 'approval' && (
              <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                承認制
              </span>
            )}
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
              <span>
                {event.participantCount}人参加
                {event.capacity && ` / 定員${event.capacity}人`}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
              {event.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {isOrganizer && (
              <>
                <button
                  onClick={() => navigate(`/events/${eventId}/edit`)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  編集
                </button>
                <select
                  value={event.status}
                  onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            {canJoin && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                参加する
              </button>
            )}
            {isPending && (
              <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg">
                承認待ち
              </span>
            )}
            {isParticipant && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
              >
                参加をキャンセル
              </button>
            )}
            <Link
              to={`/events/${eventId}/album`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              アルバムを見る
            </Link>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          参加者 ({participants?.filter((p) => p.status === 'approved').length || 0})
        </h2>
        <ParticipantList
          participants={participants || []}
          isOrganizer={isOrganizer}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            投稿 ({posts?.length || 0})
          </h2>
          {canPost && (
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showPostForm ? 'キャンセル' : '投稿する'}
            </button>
          )}
        </div>

        {showPostForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <PostForm
              onSubmit={handleCreatePost}
              isSubmitting={createPostMutation.isPending}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={
                post.authorId === user?.id
                  ? () => handleDeletePost(post.id)
                  : undefined
              }
            />
          ))}
          {(!posts || posts.length === 0) && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              まだ投稿がありません
            </p>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoin}
        isSubmitting={joinEventMutation.isPending}
        registrationType={event.registrationType}
        eventTitle={event.title}
      />
    </div>
  )
}
