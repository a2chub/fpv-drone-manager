import { useNavigate, useLocation } from 'react-router-dom'
import { LoginButton } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export function Login() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-600">
            アカウントにログインして、機体やレースの管理を始めましょう
          </p>
        </div>

        <LoginButton
          onSuccess={() => navigate(from, { replace: true })}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ログインすることで、
            <a href="#" className="text-primary-500 hover:underline">
              利用規約
            </a>
            および
            <a href="#" className="text-primary-500 hover:underline">
              プライバシーポリシー
            </a>
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  )
}
