import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partHistoryService } from '@/services/partHistoryService'
import { useAuth } from '@/contexts/AuthContext'
import type { PartHistoryFormData } from '@/types'

const PART_HISTORIES_QUERY_KEY = 'partHistories'

export function usePartHistories(
  droneId: string | undefined,
  partId: string | undefined
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [PART_HISTORIES_QUERY_KEY, user?.id, droneId, partId],
    queryFn: () => partHistoryService.getAll(user!.id, droneId!, partId!),
    enabled: !!user && !!droneId && !!partId,
  })
}

export function usePartHistory(
  droneId: string | undefined,
  partId: string | undefined,
  historyId: string | undefined
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [PART_HISTORIES_QUERY_KEY, user?.id, droneId, partId, historyId],
    queryFn: () =>
      partHistoryService.getById(user!.id, droneId!, partId!, historyId!),
    enabled: !!user && !!droneId && !!partId && !!historyId,
  })
}

export function useCreatePartHistory(droneId: string, partId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PartHistoryFormData) =>
      partHistoryService.create(user!.id, droneId, partId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PART_HISTORIES_QUERY_KEY, user?.id, droneId, partId],
      })
    },
  })
}

export function useUpdatePartHistory(droneId: string, partId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      historyId,
      data,
    }: {
      historyId: string
      data: Partial<PartHistoryFormData>
    }) => partHistoryService.update(user!.id, droneId, partId, historyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PART_HISTORIES_QUERY_KEY, user?.id, droneId, partId],
      })
      queryClient.invalidateQueries({
        queryKey: [
          PART_HISTORIES_QUERY_KEY,
          user?.id,
          droneId,
          partId,
          variables.historyId,
        ],
      })
    },
  })
}

export function useDeletePartHistory(droneId: string, partId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (historyId: string) =>
      partHistoryService.delete(user!.id, droneId, partId, historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PART_HISTORIES_QUERY_KEY, user?.id, droneId, partId],
      })
    },
  })
}
