import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyEvents, useDeleteEvent } from '@/hooks/useEvents'
import { usePublicEvents } from '@/hooks/usePublicEvents'
import { EventList } from '@/components/event'
import type { RaceEvent, EventCategory } from '@/types'
import { EVENT_CATEGORIES } from '@/types'

type TabType = 'public' | 'my'

export function EventListPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('public')
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all')

  const { data: publicEvents, isLoading: publicLoading } = usePublicEvents()
  const { data: myEvents, isLoading: myLoading } = useMyEvents()
  const deleteEventMutation = useDeleteEvent()

  const isLoading = activeTab === 'public' ? publicLoading : myLoading
  const events = activeTab === 'public' ? publicEvents : myEvents

  const filteredEvents = events?.filter((event) =>
    categoryFilter === 'all' || event.category === categoryFilter
  ) || []

  const handleEdit = (event: RaceEvent) => {
    navigate(`/events/${event.id}/edit`)
  }

  const handleDelete = async (event: RaceEvent) => {
    if (window.confirm(`「${event.title}」を削除しますか？`)) {
      await deleteEventMutation.mutateAsync(event.id)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          レースイベント
        </h1>
        <button
          onClick={() => navigate('/events/new')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          イベントを作成
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('public')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'public'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          公開イベント
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'my'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          マイイベント
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-gray-600 dark:text-gray-400">カテゴリー:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as EventCategory | 'all')}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">すべて</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <EventList
          events={filteredEvents}
          onEdit={activeTab === 'my' ? handleEdit : undefined}
          onDelete={activeTab === 'my' ? handleDelete : undefined}
          emptyMessage={
            activeTab === 'public'
              ? '公開されているイベントはありません'
              : '主催しているイベントはありません'
          }
        />
      )}
    </div>
  )
}
