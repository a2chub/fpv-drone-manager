import { doc, getDoc } from 'firebase/firestore'
import { getDocuments, where, orderBy, db } from '@/lib/firebase'
import type { User, Drone, Race } from '@/types'

export const publicService = {
  /**
   * 公開用のユーザー情報を取得
   */
  async getPublicUser(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User
    }

    return null
  },

  /**
   * 公開機体一覧を取得（isPublic: true のみ）
   */
  async getPublicDrones(userId: string): Promise<Drone[]> {
    return getDocuments<Drone>(`users/${userId}/drones`, [
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ])
  },

  /**
   * 公開レース一覧を取得（isPublic: true のみ）
   */
  async getPublicRaces(userId: string): Promise<Race[]> {
    return getDocuments<Race>(`users/${userId}/races`, [
      where('isPublic', '==', true),
      orderBy('date', 'desc'),
    ])
  },

  /**
   * 公開機体詳細を取得（isPublic: true の場合のみ返す）
   */
  async getPublicDrone(userId: string, droneId: string): Promise<Drone | null> {
    const droneRef = doc(db, `users/${userId}/drones`, droneId)
    const droneSnap = await getDoc(droneRef)

    if (droneSnap.exists()) {
      const drone = { id: droneSnap.id, ...droneSnap.data() } as Drone
      // 公開されている場合のみ返す
      if (drone.isPublic) {
        return drone
      }
    }

    return null
  },

  /**
   * 公開レース詳細を取得（isPublic: true の場合のみ返す）
   */
  async getPublicRace(userId: string, raceId: string): Promise<Race | null> {
    const raceRef = doc(db, `users/${userId}/races`, raceId)
    const raceSnap = await getDoc(raceRef)

    if (raceSnap.exists()) {
      const race = { id: raceSnap.id, ...raceSnap.data() } as Race
      // 公開されている場合のみ返す
      if (race.isPublic) {
        return race
      }
    }

    return null
  },
}
