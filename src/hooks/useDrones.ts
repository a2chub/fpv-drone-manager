import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { droneService } from '@/services/droneService'
import { useAuth } from '@/contexts/AuthContext'
import type { DroneFormData } from '@/types'

const DRONES_QUERY_KEY = 'drones'

export function useDrones() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [DRONES_QUERY_KEY, user?.id],
    queryFn: () => droneService.getAll(user!.id),
    enabled: !!user,
  })
}

export function useDrone(droneId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [DRONES_QUERY_KEY, user?.id, droneId],
    queryFn: () => droneService.getById(user!.id, droneId!),
    enabled: !!user && !!droneId,
  })
}

export function useCreateDrone() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DroneFormData) => droneService.create(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRONES_QUERY_KEY, user?.id] })
    },
  })
}

export function useUpdateDrone() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ droneId, data }: { droneId: string; data: Partial<DroneFormData> }) =>
      droneService.update(user!.id, droneId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DRONES_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({
        queryKey: [DRONES_QUERY_KEY, user?.id, variables.droneId],
      })
    },
  })
}

export function useDeleteDrone() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (droneId: string) => droneService.delete(user!.id, droneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRONES_QUERY_KEY, user?.id] })
    },
  })
}

export function useToggleDronePublic() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ droneId, isPublic }: { droneId: string; isPublic: boolean }) =>
      droneService.togglePublic(user!.id, droneId, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DRONES_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({
        queryKey: [DRONES_QUERY_KEY, user?.id, variables.droneId],
      })
    },
  })
}
