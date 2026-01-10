import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  orderBy,
} from '@/lib/firebase'
import type { EventPost, EventPostFormData } from '@/types/event'

const getPostsPath = (eventId: string) => `raceEvents/${eventId}/posts`

interface Author {
  id: string
  displayName: string
  photoURL: string | null
}

export const eventPostService = {
  async getByEvent(eventId: string): Promise<EventPost[]> {
    return getDocuments<EventPost>(getPostsPath(eventId), [
      orderBy('createdAt', 'desc'),
    ])
  },

  async getById(eventId: string, postId: string): Promise<EventPost | null> {
    return getDocument<EventPost>(getPostsPath(eventId), postId)
  },

  async create(
    eventId: string,
    author: Author,
    data: EventPostFormData,
    isOrganizer: boolean
  ): Promise<string> {
    const docRef = await createDocument(getPostsPath(eventId), {
      eventId,
      authorId: author.id,
      authorName: author.displayName,
      authorPhotoURL: author.photoURL,
      content: data.content,
      media: data.media || [],
      isOrganizer,
    })
    return docRef.id
  },

  async update(
    eventId: string,
    postId: string,
    data: Partial<EventPostFormData>
  ): Promise<void> {
    await updateDocument(getPostsPath(eventId), postId, data)
  },

  async delete(eventId: string, postId: string): Promise<void> {
    await deleteDocument(getPostsPath(eventId), postId)
  },
}
