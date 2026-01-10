import { useState } from 'react'
import { PartCard } from './PartCard'
import { PartForm } from './PartForm'
import { useParts, useCreatePart, useUpdatePart, useDeletePart, useTogglePartPublic } from '@/hooks/useParts'
import type { Part, PartFormData } from '@/types'

interface PartListProps {
  droneId: string
}

export function PartList({ droneId }: PartListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)

  const { data: parts, isLoading } = useParts(droneId)
  const createMutation = useCreatePart(droneId)
  const updateMutation = useUpdatePart(droneId)
  const deleteMutation = useDeletePart(droneId)
  const togglePublicMutation = useTogglePartPublic(droneId)

  const handleCreate = async (data: PartFormData) => {
    await createMutation.mutateAsync(data)
    setIsFormOpen(false)
  }

  const handleUpdate = async (data: PartFormData) => {
    if (!editingPart) return
    await updateMutation.mutateAsync({
      partId: editingPart.id,
      data,
    })
    setEditingPart(null)
  }

  const handleDelete = async (partId: string) => {
    if (confirm('このパーツを削除しますか？')) {
      await deleteMutation.mutateAsync(partId)
    }
  }

  const handleTogglePublic = (part: Part) => {
    togglePublicMutation.mutate({ partId: part.id, isPublic: !part.isPublic })
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">パーツ構成</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="text-primary-500 text-sm font-medium hover:underline"
        >
          パーツを追加
        </button>
      </div>

      {/* Form Modal */}
      {(isFormOpen || editingPart) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingPart ? 'パーツを編集' : '新しいパーツを追加'}
            </h3>
            <PartForm
              part={editingPart}
              onSubmit={editingPart ? handleUpdate : handleCreate}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingPart(null)
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* List */}
      {parts && parts.length > 0 ? (
        <div className="space-y-3">
          {parts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              droneId={droneId}
              onEdit={() => setEditingPart(part)}
              onDelete={() => handleDelete(part.id)}
              onTogglePublic={() => handleTogglePublic(part)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
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
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">パーツが登録されていません</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-primary-500 text-sm font-medium hover:underline mt-2"
          >
            最初のパーツを追加
          </button>
        </div>
      )}
    </div>
  )
}
