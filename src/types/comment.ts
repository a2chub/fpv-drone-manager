import type { Timestamp } from 'firebase/firestore'

// プロフィールコメント
export interface ProfileComment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  // 論理削除
  isDeleted: boolean
  deletedAt?: Timestamp
  deletedBy?: string // 削除したユーザーのID（投稿者 or プロフィールオーナー）
}

// コメント作成用の入力型
export interface CreateProfileCommentInput {
  content: string
}

// コメント削除理由
export type CommentDeleteReason = 'author' | 'profile_owner'
