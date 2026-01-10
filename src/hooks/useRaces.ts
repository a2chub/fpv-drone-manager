import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { raceService } from '@/services/raceService'
import { useAuth } from '@/contexts/AuthContext'
import type { RaceFormData } from '@/types'

const RACES_QUERY_KEY = 'races'

export function useRaces() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [RACES_QUERY_KEY, user?.id],
    queryFn: () => raceService.getAll(user!.id),
    enabled: !!user,
  })
}

export function useRace(raceId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [RACES_QUERY_KEY, user?.id, raceId],
    queryFn: () => raceService.getById(user!.id, raceId!),
    enabled: !!user && !!raceId,
  })
}

export function useRacesByDrone(droneId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [RACES_QUERY_KEY, user?.id, 'byDrone', droneId],
    queryFn: () => raceService.getByDroneId(user!.id, droneId!),
    enabled: !!user && !!droneId,
  })
}

export function useCreateRace() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, usedDroneName }: { data: RaceFormData; usedDroneName: string }) =>
      raceService.create(user!.id, data, usedDroneName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RACES_QUERY_KEY, user?.id] })
    },
  })
}

export function useUpdateRace() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      raceId,
      data,
      usedDroneName,
    }: {
      raceId: string
      data: Partial<RaceFormData>
      usedDroneName?: string
    }) => raceService.update(user!.id, raceId, data, usedDroneName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [RACES_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({
        queryKey: [RACES_QUERY_KEY, user?.id, variables.raceId],
      })
    },
  })
}

export function useDeleteRace() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (raceId: string) => raceService.delete(user!.id, raceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RACES_QUERY_KEY, user?.id] })
    },
  })
}

export function useToggleRacePublic() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ raceId, isPublic }: { raceId: string; isPublic: boolean }) =>
      raceService.togglePublic(user!.id, raceId, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [RACES_QUERY_KEY, user?.id] })
      queryClient.invalidateQueries({
        queryKey: [RACES_QUERY_KEY, user?.id, variables.raceId],
      })
    },
  })
}
