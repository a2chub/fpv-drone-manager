import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './config'

export const uploadImage = async (
  userId: string,
  file: File,
  path: string
): Promise<string> => {
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export const deleteImage = async (imageUrl: string): Promise<void> => {
  const storageRef = ref(storage, imageUrl)
  await deleteObject(storageRef)
}

export const uploadMultipleImages = async (
  userId: string,
  files: File[],
  path: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(userId, file, path))
  return Promise.all(uploadPromises)
}
