import { useState } from 'react'
import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { useAuth } from '@/contexts/AuthContext'

interface BlurredContentProps {
  children: React.ReactNode
  isBlurred: boolean
  promptMessage?: string
}

export function BlurredContent({
  children,
  isBlurred,
  promptMessage = 'ログインしてすべてを見る',
}: BlurredContentProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const { isAuthenticated } = useAuth()

  // 認証済みの場合はぼかしを解除
  const shouldBlur = isBlurred && !isAuthenticated

  const handleBlurredClick = () => {
    if (shouldBlur) {
      setShowPrompt(true)
    }
  }

  const handleClosePrompt = () => {
    setShowPrompt(false)
  }

  if (!shouldBlur) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* ぼかしコンテンツ */}
      <div
        className="cursor-pointer select-none transition-all duration-300"
        style={{ filter: 'blur(8px)' }}
        onClick={handleBlurredClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBlurredClick()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="ログインしてコンテンツを表示"
      >
        {children}
      </div>

      {/* オーバーレイ */}
      <div
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-gray-900/80 dark:via-gray-900/40"
        onClick={handleBlurredClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBlurredClick()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="ログインしてコンテンツを表示"
      >
        <div className="rounded-lg bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 dark:bg-gray-800/90">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="font-medium">{promptMessage}</span>
          </div>
        </div>
      </div>

      {/* ログインプロンプトモーダル */}
      {showPrompt && (
        <LoginPrompt message={promptMessage} onClose={handleClosePrompt} />
      )}
    </div>
  )
}
