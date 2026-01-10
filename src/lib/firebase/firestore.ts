import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentReference,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './config'

export { db }

export const getDocument = async <T>(
  collectionPath: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionPath, docId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T
  }

  return null
}

export const getDocuments = async <T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const collectionRef = collection(db, collectionPath)
  const q = query(collectionRef, ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

export const createDocument = async <T extends object>(
  collectionPath: string,
  data: T
): Promise<DocumentReference> => {
  const collectionRef = collection(db, collectionPath)
  return addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateDocument = async <T extends object>(
  collectionPath: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionPath, docId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteDocument = async (
  collectionPath: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionPath, docId)
  await deleteDoc(docRef)
}

export { where, orderBy, limit }
