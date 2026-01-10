import type { Timestamp } from 'firebase/firestore'

export type DroneCategory = 'racing' | 'freestyle' | 'long_range' | 'micro' | 'other'
export type DroneStatus = 'active' | 'retired' | 'under_repair'

export interface DroneSpecifications {
  frameSize: string
  weight: number
  batteryType: string
}

export interface Drone {
  id: string
  userId: string
  name: string
  description: string
  mainImageUrl: string
  images: string[]
  category: DroneCategory
  specifications: DroneSpecifications
  status: DroneStatus
  isPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DroneFormData {
  name: string
  description: string
  mainImageUrl: string
  images: string[]
  category: DroneCategory
  specifications: DroneSpecifications
  status: DroneStatus
  isPublic: boolean
}

export interface DroneRaceLink {
  id: string
  raceId: string
  raceName: string
  raceDate: Timestamp
  rank: number | null
  createdAt: Timestamp
}
