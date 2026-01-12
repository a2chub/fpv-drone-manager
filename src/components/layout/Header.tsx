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
  const { themeMode, setThemeMode } = useTheme()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode)
  }

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
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

          {/* User menu */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="ユーザーメニュー"
                >
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
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                    {/* Profile link */}
                    <Link
                      to={`/u/${user?.id}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      プロフィールを見る
                    </Link>

                    {/* Settings link */}
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      設定
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                    {/* Theme section */}
                    <div className="px-4 py-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">テーマ</div>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleThemeChange('light')}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${themeMode === 'light' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {themeMode === 'light' && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </span>
                          <SunIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">ライト</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${themeMode === 'dark' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {themeMode === 'dark' && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </span>
                          <MoonIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">ダーク</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange('system')}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${themeMode === 'system' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {themeMode === 'system' && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </span>
                          <ComputerIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">システム</span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                    {/* Logout */}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
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
