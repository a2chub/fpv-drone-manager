import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'
import type { User, UserRole, UserSettings } from '@/types'

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider)
  await ensureUserDocument(result.user)
  return result.user
}

export const signInWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const result = await firebaseSignInWithEmailAndPassword(auth, email, password)
  return result.user
}

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth)
}

export const onAuthStateChanged = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return firebaseOnAuthStateChanged(auth, callback)
}

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser
}

export const getUserDocument = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User
  }

  return null
}

export const ensureUserDocument = async (
  firebaseUser: FirebaseUser,
  role: UserRole = 'user'
): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User
  }

  const newUser: Omit<User, 'id'> = {
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'Unknown User',
    photoURL: firebaseUser.photoURL,
    role,
    isLocalAccount: firebaseUser.providerData[0]?.providerId === 'password',
    profile: {
      bio: '',
      location: '',
      socialLinks: {},
    },
    settings: {
      defaultVisibility: 'private',
      emailNotifications: true,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as Omit<User, 'id'>

  await setDoc(userRef, newUser)

  return { id: firebaseUser.uid, ...newUser } as unknown as User
}

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'settings': settings,
    updatedAt: serverTimestamp(),
  })
}

export const updateUserProfile = async (
  userId: string,
  data: {
    displayName?: string
    photoURL?: string | null
    profile?: {
      bio?: string
      location?: string
      socialLinks?: { twitter?: string; instagram?: string; youtube?: string }
    }
  }
): Promise<void> => {
  const userRef = doc(db, 'users', userId)
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName
  }
  if (data.photoURL !== undefined) {
    updateData.photoURL = data.photoURL
  }
  if (data.profile !== undefined) {
    if (data.profile.bio !== undefined) {
      updateData['profile.bio'] = data.profile.bio
    }
    if (data.profile.location !== undefined) {
      updateData['profile.location'] = data.profile.location
    }
    if (data.profile.socialLinks !== undefined) {
      updateData['profile.socialLinks'] = data.profile.socialLinks
    }
  }

  await updateDoc(userRef, updateData)
}
