import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'user' | 'admin'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UserProfile {
  bio: string
  location: string
  socialLinks: {
    twitter?: string
    instagram?: string
    youtube?: string
  }
}

export interface UserSettings {
  defaultVisibility: 'private' | 'public'
  emailNotifications: boolean
  themeMode: ThemeMode
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  isLocalAccount: boolean
  profile: UserProfile
  settings: UserSettings
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PublicProfile {
  userId: string
  displayName: string
  photoURL: string | null
  bio: string
  droneCount: number
  raceCount: number
  featuredDrones: {
    id: string
    name: string
    mainImageUrl: string
  }[]
  recentRaces: {
    id: string
    name: string
    date: Timestamp
    rank: number | null
  }[]
  updatedAt: Timestamp
}
