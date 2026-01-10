import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partService } from '@/services/partService'
import { useAuth } from '@/contexts/AuthContext'
import type { PartFormData } from '@/types'

const PARTS_QUERY_KEY = 'parts'

export function useParts(droneId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [PARTS_QUERY_KEY, user?.id, droneId],
    queryFn: () => partService.getAll(user!.id, droneId!),
    enabled: !!user && !!droneId,
  })
}

export function usePart(droneId: string | undefined, partId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [PARTS_QUERY_KEY, user?.id, droneId, partId],
    queryFn: () => partService.getById(user!.id, droneId!, partId!),
    enabled: !!user && !!droneId && !!partId,
  })
}

export function useCreatePart(droneId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PartFormData) =>
      partService.create(user!.id, droneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId],
      })
    },
  })
}

export function useUpdatePart(droneId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      partId,
      data,
    }: {
      partId: string
      data: Partial<PartFormData>
    }) => partService.update(user!.id, droneId, partId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId, variables.partId],
      })
    },
  })
}

export function useDeletePart(droneId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (partId: string) =>
      partService.delete(user!.id, droneId, partId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId],
      })
    },
  })
}

export function useTogglePartPublic(droneId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ partId, isPublic }: { partId: string; isPublic: boolean }) =>
      partService.togglePublic(user!.id, droneId, partId, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTS_QUERY_KEY, user?.id, droneId, variables.partId],
      })
    },
  })
}
