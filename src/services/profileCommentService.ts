import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ProfileComment, CreateProfileCommentInput, CommentDeleteReason } from '@/types'

// Firestoreパス
const getCommentsPath = (profileUserId: string) => `users/${profileUserId}/profileComments`

export const profileCommentService = {
  // コメント一覧を取得（論理削除されていないもののみ、または承認要のフィルタ）
  async getComments(profileUserId: string, includeDeleted = false): Promise<ProfileComment[]> {
    const commentsRef = collection(db, getCommentsPath(profileUserId))

    let q
    if (includeDeleted) {
      q = query(commentsRef, orderBy('createdAt', 'desc'))
    } else {
      q = query(
        commentsRef,
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProfileComment[]
  },

  // コメントを投稿
  async createComment(
    profileUserId: string,
    authorId: string,
    authorName: string,
    authorPhotoURL: string | null,
    input: CreateProfileCommentInput
  ): Promise<string> {
    const commentsRef = collection(db, getCommentsPath(profileUserId))
    const newDocRef = doc(commentsRef)

    await setDoc(newDocRef, {
      authorId,
      authorName,
      authorPhotoURL,
      content: input.content,
      createdAt: serverTimestamp(),
      isDeleted: false,
    })

    return newDocRef.id
  },

  // コメントを論理削除
  async deleteComment(
    profileUserId: string,
    commentId: string,
    deletedBy: string,
    reason: CommentDeleteReason
  ): Promise<void> {
    const commentRef = doc(db, getCommentsPath(profileUserId), commentId)
    const commentSnap = await getDoc(commentRef)

    if (!commentSnap.exists()) {
      throw new Error('Comment not found')
    }

    const commentData = commentSnap.data()

    // 削除権限チェック: 投稿者またはプロフィールオーナーのみ
    if (reason === 'author' && commentData.authorId !== deletedBy) {
      throw new Error('Only the author can delete this comment')
    }
    if (reason === 'profile_owner' && profileUserId !== deletedBy) {
      throw new Error('Only the profile owner can delete this comment')
    }

    await updateDoc(commentRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy,
    })
  },

  // コメントが削除可能かチェック
  canDelete(
    comment: ProfileComment,
    currentUserId: string,
    profileUserId: string
  ): { canDelete: boolean; reason?: CommentDeleteReason } {
    if (comment.authorId === currentUserId) {
      return { canDelete: true, reason: 'author' }
    }
    if (profileUserId === currentUserId) {
      return { canDelete: true, reason: 'profile_owner' }
    }
    return { canDelete: false }
  },
}
