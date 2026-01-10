import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  Timestamp,
  collectionGroup,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/types'

interface AdminStats {
  totalUsers: number
  totalDrones: number
  totalRaces: number
  todayRegistrations: number
}

interface AdminUserWithStats extends User {
  droneCount: number
}

/**
 * Check if current user is admin
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { isAdmin, loading } = useAuth()
  return { isAdmin, loading }
}

/**
 * Get admin statistics
 */
export function useAdminStats() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDrones: 0,
    totalRaces: 0,
    todayRegistrations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const totalUsers = usersSnapshot.size

      // Get today's start timestamp
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = Timestamp.fromDate(today)

      // Count today's registrations
      const todayQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', todayTimestamp)
      )
      const todaySnapshot = await getDocs(todayQuery)
      const todayRegistrations = todaySnapshot.size

      // Get total drones using collection group
      const dronesSnapshot = await getDocs(collectionGroup(db, 'drones'))
      const totalDrones = dronesSnapshot.size

      // Get total races using collection group
      const racesSnapshot = await getDocs(collectionGroup(db, 'races'))
      const totalRaces = racesSnapshot.size

      setStats({
        totalUsers,
        totalDrones,
        totalRaces,
        todayRegistrations,
      })
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

/**
 * Get admin users list with drone counts
 */
export function useAdminUsers(limitCount: number = 10) {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<AdminUserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get recent users
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const usersSnapshot = await getDocs(usersQuery)

      const usersWithStats: AdminUserWithStats[] = []

      for (const userDoc of usersSnapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User

        // Get drone count for this user
        const dronesSnapshot = await getDocs(
          collection(db, 'users', userDoc.id, 'drones')
        )

        usersWithStats.push({
          ...userData,
          droneCount: dronesSnapshot.size,
        })
      }

      setUsers(usersWithStats)
    } catch (err) {
      console.error('Failed to fetch admin users:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch users'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin, limitCount])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}
