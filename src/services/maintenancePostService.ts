import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  MaintenancePost,
  MaintenancePostFormData,
  MaintenancePostComment,
  MaintenancePostLike,
} from '@/types/maintenancePost'

// Firestoreパス
const POSTS_COLLECTION = 'maintenancePosts'
const getCommentsPath = (postId: string) => `${POSTS_COLLECTION}/${postId}/comments`
const getLikesPath = (postId: string) => `${POSTS_COLLECTION}/${postId}/likes`

// ユーザー情報の型
interface UserData {
  displayName: string
  photoURL: string | null
}

// ドローン情報の型
interface DroneData {
  id: string
  name: string
  imageUrl: string | null
}

export const maintenancePostService = {
  // ========================================
  // 投稿CRUD
  // ========================================

  /**
   * 新規投稿作成
   */
  async createPost(
    userId: string,
    userData: UserData,
    droneData: DroneData,
    formData: MaintenancePostFormData
  ): Promise<string> {
    const postsRef = collection(db, POSTS_COLLECTION)
    const newDocRef = doc(postsRef)

    const postData: Omit<MaintenancePost, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      userName: userData.displayName,
      userPhotoURL: userData.photoURL,
      droneId: droneData.id,
      droneName: droneData.name,
      droneImageUrl: droneData.imageUrl,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      media: formData.media || [],
      relatedParts: formData.relatedParts || [],
      isPublic: formData.isPublic,
      likeCount: 0,
      commentCount: 0,
    }

    await setDoc(newDocRef, {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return newDocRef.id
  },

  /**
   * 投稿更新
   */
  async updatePost(
    postId: string,
    formData: Partial<MaintenancePostFormData>
  ): Promise<void> {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    }

    if (formData.type !== undefined) updateData.type = formData.type
    if (formData.title !== undefined) updateData.title = formData.title
    if (formData.content !== undefined) updateData.content = formData.content
    if (formData.media !== undefined) updateData.media = formData.media
    if (formData.relatedParts !== undefined) updateData.relatedParts = formData.relatedParts
    if (formData.isPublic !== undefined) updateData.isPublic = formData.isPublic

    await setDoc(postRef, updateData, { merge: true })
  },

  /**
   * 投稿削除
   */
  async deletePost(postId: string): Promise<void> {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }

    // 注意: サブコレクション（comments, likes）は自動削除されない
    // 実運用ではCloud Functionsで削除するか、
    // ここでバッチ削除を行う必要がある
    await deleteDoc(postRef)
  },

  /**
   * 単一投稿取得
   */
  async getPost(postId: string): Promise<MaintenancePost | null> {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      return null
    }

    return {
      id: postSnap.id,
      ...postSnap.data(),
    } as MaintenancePost
  },

  /**
   * 公開投稿取得（isPublic: true の場合のみ返す）
   */
  async getPublicPost(postId: string): Promise<MaintenancePost | null> {
    const post = await this.getPost(postId)
    if (!post || !post.isPublic) {
      return null
    }
    return post
  },

  /**
   * ユーザーの投稿一覧取得
   */
  async getPostsByUser(userId: string, limitCount = 20): Promise<MaintenancePost[]> {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePost[]
  },

  /**
   * ユーザーの公開投稿一覧取得（プロフィール表示用）
   */
  async getPublicPostsByUser(userId: string, limitCount = 20): Promise<MaintenancePost[]> {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('userId', '==', userId),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePost[]
  },

  /**
   * ドローン別投稿一覧取得
   */
  async getPostsByDrone(droneId: string, limitCount = 20): Promise<MaintenancePost[]> {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('droneId', '==', droneId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePost[]
  },

  /**
   * 公開投稿一覧取得（フィード用）
   */
  async getPublicPosts(limitCount = 20): Promise<MaintenancePost[]> {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePost[]
  },

  /**
   * フォロー中ユーザーの投稿取得
   */
  async getFollowingPosts(followingIds: string[], limitCount = 20): Promise<MaintenancePost[]> {
    if (followingIds.length === 0) {
      return []
    }

    // Firestoreの 'in' クエリは最大30件まで（10件ずつ分割推奨）
    const limitedIds = followingIds.slice(0, 10)

    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('userId', 'in', limitedIds),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePost[]
  },

  // ========================================
  // いいね機能
  // ========================================

  /**
   * いいねトグル
   */
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const likeRef = doc(db, getLikesPath(postId), userId)
    const likeSnap = await getDoc(likeRef)
    const postRef = doc(db, POSTS_COLLECTION, postId)

    const batch = writeBatch(db)

    if (likeSnap.exists()) {
      // いいね解除
      batch.delete(likeRef)
      batch.update(postRef, { likeCount: increment(-1) })
      await batch.commit()
      return false
    } else {
      // いいね追加
      const likeData: Omit<MaintenancePostLike, 'id'> = {
        userId,
        createdAt: Timestamp.now(),
      }
      batch.set(likeRef, likeData)
      batch.update(postRef, { likeCount: increment(1) })
      await batch.commit()
      return true
    }
  },

  /**
   * いいね済みチェック
   */
  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const likeRef = doc(db, getLikesPath(postId), userId)
    const likeSnap = await getDoc(likeRef)
    return likeSnap.exists()
  },

  /**
   * いいね数取得
   */
  async getLikeCount(postId: string): Promise<number> {
    const post = await this.getPost(postId)
    return post?.likeCount ?? 0
  },

  /**
   * 複数投稿のいいね状態を一括チェック
   */
  async checkLikesForPosts(postIds: string[], userId: string): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {}

    // 並列で各投稿のいいね状態をチェック
    const checks = postIds.map(async (postId) => {
      const liked = await this.hasUserLiked(postId, userId)
      result[postId] = liked
    })

    await Promise.all(checks)
    return result
  },

  // ========================================
  // コメント機能
  // ========================================

  /**
   * コメント追加
   */
  async addComment(
    postId: string,
    userId: string,
    userData: UserData,
    content: string
  ): Promise<string> {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }

    const commentsRef = collection(db, getCommentsPath(postId))
    const newCommentRef = doc(commentsRef)

    const commentData: Omit<MaintenancePostComment, 'id' | 'createdAt'> = {
      postId,
      authorId: userId,
      authorName: userData.displayName,
      authorPhotoURL: userData.photoURL,
      content,
      isDeleted: false,
    }

    const batch = writeBatch(db)
    batch.set(newCommentRef, {
      ...commentData,
      createdAt: serverTimestamp(),
    })
    batch.update(postRef, { commentCount: increment(1) })
    await batch.commit()

    return newCommentRef.id
  },

  /**
   * コメント削除（論理削除）
   */
  async deleteComment(
    postId: string,
    commentId: string,
    userId: string
  ): Promise<void> {
    const commentRef = doc(db, getCommentsPath(postId), commentId)
    const commentSnap = await getDoc(commentRef)

    if (!commentSnap.exists()) {
      throw new Error('Comment not found')
    }

    const commentData = commentSnap.data()

    // 投稿者チェック
    if (commentData.authorId !== userId) {
      // 投稿のオーナーかどうかもチェック
      const postRef = doc(db, POSTS_COLLECTION, postId)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists() || postSnap.data().userId !== userId) {
        throw new Error('Permission denied: Only the comment author or post owner can delete this comment')
      }
    }

    const postRef = doc(db, POSTS_COLLECTION, postId)
    const batch = writeBatch(db)

    batch.update(commentRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
    })
    batch.update(postRef, { commentCount: increment(-1) })
    await batch.commit()
  },

  /**
   * コメント一覧取得（論理削除されていないもののみ）
   */
  async getComments(postId: string, limitCount = 50): Promise<MaintenancePostComment[]> {
    const commentsRef = collection(db, getCommentsPath(postId))
    const q = query(
      commentsRef,
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenancePostComment[]
  },

  /**
   * コメントが削除可能かチェック
   */
  canDeleteComment(
    comment: MaintenancePostComment,
    currentUserId: string,
    postOwnerId: string
  ): boolean {
    return comment.authorId === currentUserId || postOwnerId === currentUserId
  },
}
