import {
  doc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Firestoreパス
const getFollowingPath = (userId: string) => `users/${userId}/following`
const getFollowersPath = (userId: string) => `users/${userId}/followers`

export const followService = {
  // フォロー中かどうかチェック
  async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    const docRef = doc(db, getFollowingPath(currentUserId), targetUserId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  },

  // フォローする
  async follow(currentUserId: string, targetUserId: string): Promise<void> {
    // 自分をフォローできない
    if (currentUserId === targetUserId) {
      throw new Error('Cannot follow yourself')
    }

    const batch = writeBatch(db)

    // フォロー関係を両方向に作成
    const followingRef = doc(db, getFollowingPath(currentUserId), targetUserId)
    const followerRef = doc(db, getFollowersPath(targetUserId), currentUserId)

    batch.set(followingRef, { followedAt: serverTimestamp() })
    batch.set(followerRef, { followedAt: serverTimestamp() })

    // カウンターを更新
    const currentUserRef = doc(db, 'users', currentUserId)
    const targetUserRef = doc(db, 'users', targetUserId)

    batch.update(currentUserRef, { followingCount: increment(1) })
    batch.update(targetUserRef, { followersCount: increment(1) })

    await batch.commit()
  },

  // フォロー解除
  async unfollow(currentUserId: string, targetUserId: string): Promise<void> {
    const batch = writeBatch(db)

    const followingRef = doc(db, getFollowingPath(currentUserId), targetUserId)
    const followerRef = doc(db, getFollowersPath(targetUserId), currentUserId)

    batch.delete(followingRef)
    batch.delete(followerRef)

    // カウンターを更新
    const currentUserRef = doc(db, 'users', currentUserId)
    const targetUserRef = doc(db, 'users', targetUserId)

    batch.update(currentUserRef, { followingCount: increment(-1) })
    batch.update(targetUserRef, { followersCount: increment(-1) })

    await batch.commit()
  },

  // フォロー中のユーザーIDリストを取得
  async getFollowingIds(userId: string): Promise<string[]> {
    const followingRef = collection(db, getFollowingPath(userId))
    const snapshot = await getDocs(followingRef)
    return snapshot.docs.map(doc => doc.id)
  },

  // フォロワーのユーザーIDリストを取得
  async getFollowerIds(userId: string): Promise<string[]> {
    const followersRef = collection(db, getFollowersPath(userId))
    const snapshot = await getDocs(followersRef)
    return snapshot.docs.map(doc => doc.id)
  },
}
