import { useQuery } from '@tanstack/react-query'
import { droneService } from '@/services/droneService'
import { partService } from '@/services/partService'
import { partHistoryService } from '@/services/partHistoryService'
import { useAuth } from '@/contexts/AuthContext'
import type { Drone, PartHistory } from '@/types'

export interface MaintenanceAlert {
  id: string
  droneId: string
  droneName: string
  type: 'overdue' | 'upcoming' | 'attention'
  message: string
  daysUntil?: number
  priority: 'high' | 'medium' | 'low'
}

export interface DroneMaintenanceStatus {
  drone: Drone
  healthScore: number // 0-100
  lastMaintenanceDate: Date | null
  daysSinceLastMaintenance: number | null
  maintenanceCount: number
  recentHistory: PartHistory[]
  needsAttention: boolean
}

export interface MaintenanceStats {
  fleetHealthScore: number // Average health across all drones
  totalMaintenanceCount: number
  dronesNeedingAttention: number
  alerts: MaintenanceAlert[]
  droneStatuses: DroneMaintenanceStatus[]
}

const MAINTENANCE_QUERY_KEY = 'maintenanceStatus'

// Calculate health score based on time since last maintenance
function calculateHealthScore(
  daysSinceMaintenance: number | null,
  status: string
): number {
  // Retired drones don't need maintenance
  if (status === 'retired') return 100

  // Under repair drones are being maintained
  if (status === 'under_repair') return 50

  // No maintenance history - base score
  if (daysSinceMaintenance === null) return 70

  // Calculate score based on days since last maintenance
  // Optimal: 0-30 days = 100-80%
  // Good: 31-60 days = 80-60%
  // Attention: 61-90 days = 60-40%
  // Needs maintenance: 90+ days = 40-0%

  if (daysSinceMaintenance <= 30) {
    return 100 - (daysSinceMaintenance / 30) * 20
  } else if (daysSinceMaintenance <= 60) {
    return 80 - ((daysSinceMaintenance - 30) / 30) * 20
  } else if (daysSinceMaintenance <= 90) {
    return 60 - ((daysSinceMaintenance - 60) / 30) * 20
  } else {
    return Math.max(0, 40 - ((daysSinceMaintenance - 90) / 60) * 40)
  }
}

function generateAlerts(droneStatuses: DroneMaintenanceStatus[]): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = []

  for (const status of droneStatuses) {
    // Skip retired drones
    if (status.drone.status === 'retired') continue

    // Under repair alert
    if (status.drone.status === 'under_repair') {
      alerts.push({
        id: `repair-${status.drone.id}`,
        droneId: status.drone.id,
        droneName: status.drone.name,
        type: 'attention',
        message: '現在整備中です',
        priority: 'medium',
      })
      continue
    }

    // Check maintenance schedule
    if (status.daysSinceLastMaintenance !== null) {
      if (status.daysSinceLastMaintenance > 90) {
        alerts.push({
          id: `overdue-${status.drone.id}`,
          droneId: status.drone.id,
          droneName: status.drone.name,
          type: 'overdue',
          message: `最後の整備から${status.daysSinceLastMaintenance}日経過しています`,
          daysUntil: -status.daysSinceLastMaintenance + 90,
          priority: 'high',
        })
      } else if (status.daysSinceLastMaintenance > 60) {
        alerts.push({
          id: `upcoming-${status.drone.id}`,
          droneId: status.drone.id,
          droneName: status.drone.name,
          type: 'upcoming',
          message: `整備推奨日が近づいています（${90 - status.daysSinceLastMaintenance}日後）`,
          daysUntil: 90 - status.daysSinceLastMaintenance,
          priority: 'medium',
        })
      }
    } else if (status.maintenanceCount === 0) {
      // No maintenance history
      alerts.push({
        id: `no-history-${status.drone.id}`,
        droneId: status.drone.id,
        droneName: status.drone.name,
        type: 'attention',
        message: '整備記録がありません',
        priority: 'low',
      })
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return alerts
}

export function useMaintenanceStatus() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [MAINTENANCE_QUERY_KEY, user?.id],
    queryFn: async (): Promise<MaintenanceStats> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get all drones
      const drones = await droneService.getAll(user.id)

      // Get maintenance status for each drone
      const droneStatuses: DroneMaintenanceStatus[] = await Promise.all(
        drones.map(async (drone) => {
          // Get all parts for this drone
          const parts = await partService.getAll(user.id, drone.id)

          // Get all history entries for all parts
          const allHistory: PartHistory[] = []

          for (const part of parts) {
            const histories = await partHistoryService.getAll(user.id, drone.id, part.id)
            allHistory.push(...histories)
          }

          // Sort by date descending
          allHistory.sort((a, b) => b.date.toMillis() - a.date.toMillis())

          // Calculate last maintenance date (repair, adjustment, or replacement)
          const maintenanceHistory = allHistory.filter(h =>
            ['repair', 'adjustment', 'replacement'].includes(h.type)
          )

          const lastMaintenanceDate = maintenanceHistory.length > 0
            ? maintenanceHistory[0].date.toDate()
            : null

          const daysSinceLastMaintenance = lastMaintenanceDate
            ? Math.floor((Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
            : null

          const healthScore = calculateHealthScore(daysSinceLastMaintenance, drone.status)

          return {
            drone,
            healthScore,
            lastMaintenanceDate,
            daysSinceLastMaintenance,
            maintenanceCount: maintenanceHistory.length,
            recentHistory: allHistory.slice(0, 5),
            needsAttention: healthScore < 60 || drone.status === 'under_repair',
          }
        })
      )

      // Calculate fleet health score
      const activeDrones = droneStatuses.filter(s => s.drone.status !== 'retired')
      const fleetHealthScore = activeDrones.length > 0
        ? Math.round(
            activeDrones.reduce((sum, s) => sum + s.healthScore, 0) / activeDrones.length
          )
        : 100

      // Count maintenance entries
      const totalMaintenanceCount = droneStatuses.reduce(
        (sum, s) => sum + s.maintenanceCount,
        0
      )

      // Count drones needing attention
      const dronesNeedingAttention = droneStatuses.filter(s => s.needsAttention).length

      // Generate alerts
      const alerts = generateAlerts(droneStatuses)

      return {
        fleetHealthScore,
        totalMaintenanceCount,
        dronesNeedingAttention,
        alerts,
        droneStatuses,
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

// Get recent maintenance history across all drones
export function useRecentMaintenanceHistory(limit = 10) {
  const { data: maintenanceStats } = useMaintenanceStatus()

  if (!maintenanceStats) {
    return { data: [], isLoading: true }
  }

  // Collect all history entries
  const allHistory = maintenanceStats.droneStatuses.flatMap(status =>
    status.recentHistory.map(history => ({
      ...history,
      droneName: status.drone.name,
      droneId: status.drone.id,
    }))
  )

  // Sort by date and limit
  allHistory.sort((a, b) => b.date.toMillis() - a.date.toMillis())

  return {
    data: allHistory.slice(0, limit),
    isLoading: false,
  }
}
