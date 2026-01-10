import { useState } from 'react'
import { PartHistoryCard } from './PartHistoryCard'
import { PartHistoryForm } from './PartHistoryForm'
import {
  usePartHistories,
  useCreatePartHistory,
  useUpdatePartHistory,
  useDeletePartHistory,
} from '@/hooks/usePartHistories'
import type { PartHistory, PartHistoryFormData } from '@/types'

interface PartHistoryListProps {
  droneId: string
  partId: string
}

export function PartHistoryList({ droneId, partId }: PartHistoryListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingHistory, setEditingHistory] = useState<PartHistory | null>(null)

  const { data: histories, isLoading } = usePartHistories(droneId, partId)
  const createMutation = useCreatePartHistory(droneId, partId)
  const updateMutation = useUpdatePartHistory(droneId, partId)
  const deleteMutation = useDeletePartHistory(droneId, partId)

  const handleCreate = async (data: PartHistoryFormData) => {
    await createMutation.mutateAsync(data)
    setIsFormOpen(false)
  }

  const handleUpdate = async (data: PartHistoryFormData) => {
    if (!editingHistory) return
    await updateMutation.mutateAsync({
      historyId: editingHistory.id,
      data,
    })
    setEditingHistory(null)
  }

  const handleDelete = async (historyId: string) => {
    if (confirm('この履歴を削除しますか？')) {
      await deleteMutation.mutateAsync(historyId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">履歴</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="text-primary-500 text-sm font-medium hover:underline"
        >
          履歴を追加
        </button>
      </div>

      {/* Form Modal */}
      {(isFormOpen || editingHistory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingHistory ? '履歴を編集' : '新しい履歴を追加'}
            </h3>
            <PartHistoryForm
              history={editingHistory}
              onSubmit={editingHistory ? handleUpdate : handleCreate}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingHistory(null)
              }}
              isSubmitting={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </div>
        </div>
      )}

      {/* List */}
      {histories && histories.length > 0 ? (
        <div className="space-y-3">
          {histories.map((history) => (
            <PartHistoryCard
              key={history.id}
              history={history}
              onEdit={() => setEditingHistory(history)}
              onDelete={() => handleDelete(history.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">履歴がありません</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-primary-500 text-sm font-medium hover:underline mt-2"
          >
            最初の履歴を追加
          </button>
        </div>
      )}
    </div>
  )
}
