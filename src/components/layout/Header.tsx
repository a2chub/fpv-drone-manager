import type { ReactNode } from 'react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { NavBar, defaultNavItems } from '@/components/ui/tubelight-navbar'
import type { ThemeMode } from '@/types'

// Theme icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

function ComputerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { theme, themeMode, setThemeMode } = useTheme()
  const navigate = useNavigate()
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode)
    setIsThemeMenuOpen(false)
  }

  function getCurrentIcon(): ReactNode {
    if (themeMode === 'system') {
      return <ComputerIcon className="w-5 h-5" />
    }
    if (theme === 'dark') {
      return <MoonIcon className="w-5 h-5" />
    }
    return <SunIcon className="w-5 h-5" />
  }

  function getThemeButtonClass(mode: ThemeMode): string {
    const baseClass = 'w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
    const activeClass = themeMode === mode ? 'text-primary-500' : 'text-gray-700 dark:text-gray-300'
    return `${baseClass} ${activeClass}`
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">FPV Drone Manager</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <NavBar items={defaultNavItems} />
          )}

          {/* Theme toggle and Auth section */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="テーマを切り替え"
              >
                {getCurrentIcon()}
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={getThemeButtonClass('light')}
                  >
                    <SunIcon className="w-4 h-4" />
                    <span>ライト</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={getThemeButtonClass('dark')}
                  >
                    <MoonIcon className="w-4 h-4" />
                    <span>ダーク</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={getThemeButtonClass('system')}
                  >
                    <ComputerIcon className="w-4 h-4" />
                    <span>システム</span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user?.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                    {user?.displayName}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
