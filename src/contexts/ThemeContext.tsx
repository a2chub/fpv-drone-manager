import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { updateUserSettings } from '@/lib/firebase'
import type { ThemeMode } from '@/types'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'drone-spec-theme-mode'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

function applyThemeToDocument(theme: 'light' | 'dark'): void {
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Initialize from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    }
    return 'system'
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme(themeMode))

  // Sync with user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.settings?.themeMode) {
      setThemeModeState(user.settings.themeMode)
    }
  }, [isAuthenticated, user?.settings?.themeMode])

  // Update resolved theme when themeMode changes
  useEffect(() => {
    const newTheme = resolveTheme(themeMode)
    setTheme(newTheme)
    applyThemeToDocument(newTheme)
  }, [themeMode])

  // Listen for system theme changes when mode is 'system'
  useEffect(() => {
    if (themeMode !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event: MediaQueryListEvent) => {
      const newTheme = event.matches ? 'dark' : 'light'
      setTheme(newTheme)
      applyThemeToDocument(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  // Apply theme on initial mount
  useEffect(() => {
    applyThemeToDocument(theme)
  }, [])

  const setThemeMode = async (mode: ThemeMode): Promise<void> => {
    setThemeModeState(mode)

    // Always save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode)

    // If authenticated, also save to Firestore
    if (isAuthenticated && user) {
      try {
        await updateUserSettings(user.id, { themeMode: mode })
      } catch (error) {
        console.error('Failed to save theme to Firestore:', error)
        // Don't throw - localStorage save was successful
      }
    }
  }

  const value: ThemeContextValue = {
    theme,
    themeMode,
    setThemeMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
