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
  isProfilePublic: boolean // プロフィール全体の公開設定
  showEventHistory: boolean // 参加イベント履歴の公開設定
  commentApprovalRequired?: boolean // コメント承認設定（デフォルトfalse）
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
  followingCount?: number // フォロー中の数
  followersCount?: number // フォロワー数
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
  followingCount?: number
  followersCount?: number
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

export interface FollowRelation {
  followedAt: Timestamp
}
