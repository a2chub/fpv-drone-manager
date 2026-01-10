import {
  getDocuments,
  createDocument,
  deleteDocument,
  orderBy,
  where,
} from '@/lib/firebase'
import type { MediaComment, MediaCommentFormData } from '@/types'

const getCommentsPath = (eventId: string, postId: string) =>
  `raceEvents/${eventId}/posts/${postId}/mediaComments`

interface Author {
  id: string
  displayName: string
  photoURL: string | null
}

export const mediaCommentService = {
  async getByMedia(
    eventId: string,
    postId: string,
    mediaIndex: number
  ): Promise<MediaComment[]> {
    return getDocuments<MediaComment>(getCommentsPath(eventId, postId), [
      where('mediaIndex', '==', mediaIndex),
      orderBy('createdAt', 'asc'),
    ])
  },

  async getByPost(eventId: string, postId: string): Promise<MediaComment[]> {
    return getDocuments<MediaComment>(getCommentsPath(eventId, postId), [
      orderBy('createdAt', 'asc'),
    ])
  },

  async create(
    eventId: string,
    postId: string,
    mediaIndex: number,
    author: Author,
    data: MediaCommentFormData
  ): Promise<string> {
    const docRef = await createDocument(getCommentsPath(eventId, postId), {
      postId,
      mediaIndex,
      authorId: author.id,
      authorName: author.displayName,
      authorPhotoURL: author.photoURL,
      content: data.content,
    })
    return docRef.id
  },

  async delete(
    eventId: string,
    postId: string,
    commentId: string
  ): Promise<void> {
    await deleteDocument(getCommentsPath(eventId, postId), commentId)
  },
}
