import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ContentGateProps {
  children: React.ReactNode
  previewHeight?: number
  title?: string
  description?: string
  benefits?: string[]
}

export function ContentGate({
  children,
  previewHeight = 200,
  title = 'ログインして詳細を見る',
  description = 'アカウントを作成して、すべての情報をチェックしましょう。',
  benefits = [],
}: ContentGateProps) {
  const { isAuthenticated } = useAuth()

  // 認証済みならそのまま表示
  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* プレビューコンテンツ（上部だけ見せる） */}
      <div
        className="overflow-hidden"
        style={{ maxHeight: `${previewHeight}px` }}
      >
        {children}
      </div>

      {/* グラデーションオーバーレイ */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: `${Math.min(previewHeight, 150)}px`,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none dark:block hidden"
        style={{
          height: `${Math.min(previewHeight, 150)}px`,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(17,24,39,0.8) 50%, rgba(17,24,39,1) 100%)',
        }}
      />

      {/* CTA セクション */}
      <div className="bg-white dark:bg-gray-900 pt-8 pb-6">
        <div className="max-w-md mx-auto text-center px-4">
          {/* ロックアイコン + タイトル */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg
              className="w-6 h-6 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          {/* 説明文 */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>

          {/* メリット一覧 */}
          {benefits.length > 0 && (
            <ul className="text-left space-y-2 mb-6">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTAボタン */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              無料でアカウント作成
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              すでにアカウントをお持ちですか？{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                ログイン
              </Link>
            </p>
          </div>

          {/* 補足情報 */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Google アカウントまたはメールアドレスで30秒で登録完了
          </p>
        </div>
      </div>
    </div>
  )
}
