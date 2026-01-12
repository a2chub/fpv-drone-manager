import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signUpWithEmailAndPassword as firebaseSignUpWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getUserDocument,
  ensureUserDocument,
} from '@/lib/firebase'
import { trackEvent, setUserId, setUserProperties, AnalyticsEvents } from '@/lib/analytics'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: Error | null
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // First try to get existing user document
          let user = await getUserDocument(firebaseUser.uid)

          // If user document doesn't exist, create it
          if (!user) {
            user = await ensureUserDocument(firebaseUser)
          }

          setState({
            user,
            firebaseUser,
            loading: false,
            error: null,
          })
        } catch (error) {
          console.error('Auth state change error:', error)
          setState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          })
        }
      } else {
        setState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const firebaseUser = await firebaseSignInWithGoogle()
      const user = await getUserDocument(firebaseUser.uid)
      setState({
        user,
        firebaseUser,
        loading: false,
        error: null,
      })

      // GA4: ログインイベントとユーザープロパティを設定
      if (user) {
        trackEvent(AnalyticsEvents.LOGIN, { method: 'google' })
        setUserId(user.id)
        setUserProperties({
          user_role: user.role,
        })
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Login failed'),
      }))
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const firebaseUser = await firebaseSignInWithEmailAndPassword(email, password)
      const user = await getUserDocument(firebaseUser.uid)
      setState({
        user,
        firebaseUser,
        loading: false,
        error: null,
      })

      // GA4: ログインイベントとユーザープロパティを設定
      if (user) {
        trackEvent(AnalyticsEvents.LOGIN, { method: 'email' })
        setUserId(user.id)
        setUserProperties({
          user_role: user.role,
        })
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Login failed'),
      }))
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const firebaseUser = await firebaseSignUpWithEmailAndPassword(email, password)
      const user = await getUserDocument(firebaseUser.uid)
      setState({
        user,
        firebaseUser,
        loading: false,
        error: null,
      })

      // GA4: 新規登録イベントとユーザープロパティを設定
      if (user) {
        trackEvent(AnalyticsEvents.SIGNUP, { method: 'email' })
        setUserId(user.id)
        setUserProperties({
          user_role: user.role,
        })
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Sign up failed'),
      }))
      throw error
    }
  }

  const signOut = async () => {
    try {
      // GA4: ログアウトイベントを送信
      trackEvent(AnalyticsEvents.LOGOUT)

      await firebaseSignOut()
      setState({
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
      })

      // GA4: ユーザーIDをクリア
      setUserId(null)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Sign out failed'),
      }))
      throw error
    }
  }

  const value: AuthContextValue = {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAdmin: state.user?.role === 'admin',
    isAuthenticated: !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
