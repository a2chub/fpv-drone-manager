import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { updateUserProfile } from '@/lib/firebase/auth'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { ThemeMode } from '@/types'

export function SettingsPage() {
  const { user } = useAuth()
  const { themeMode, setThemeMode } = useTheme()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [location, setLocation] = useState(user?.profile?.location || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { uploadMultiple, isUploading } = useImageUpload({
    path: 'profile',
    maxFiles: 1,
  })

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setBio(user.profile?.bio || '')
      setLocation(user.profile?.location || '')
      setPhotoURL(user.photoURL || '')
    }
  }, [user])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const urls = await uploadMultiple(Array.from(files))
      if (urls.length > 0) {
        setPhotoURL(urls[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました')
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      await updateUserProfile(user.id, {
        displayName,
        photoURL: photoURL || null,
        profile: {
          bio,
          location,
          socialLinks: user.profile?.socialLinks || {},
        },
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode)
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">ログインが必要です</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">設定</h1>

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300">設定を保存しました</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Profile section */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          プロフィール
        </h2>

        {/* Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            プロフィール画像
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-gray-500 dark:text-gray-400">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer">
                {isUploading ? 'アップロード中...' : '画像を変更'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Display name */}
        <div className="mb-4">
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            表示名
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="表示名を入力"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            投稿やコメントで表示される名前です
          </p>
        </div>

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            自己紹介
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="input"
            placeholder="自己紹介を入力"
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            所在地
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
            placeholder="所在地を入力"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? '保存中...' : 'プロフィールを保存'}
        </button>
      </section>

      {/* Theme section */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          外観
        </h2>

        <div className="space-y-2">
          {[
            { value: 'light' as ThemeMode, label: 'ライトモード', icon: 'sun' },
            { value: 'dark' as ThemeMode, label: 'ダークモード', icon: 'moon' },
            { value: 'system' as ThemeMode, label: 'システム設定に従う', icon: 'computer' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                themeMode === option.value
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={themeMode === option.value}
                onChange={() => handleThemeChange(option.value)}
                className="sr-only"
              />
              <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Account section */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          アカウント
        </h2>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>アカウントID: {user.id}</p>
          <p>ログイン方法: {user.isLocalAccount ? 'メール/パスワード' : 'Google'}</p>
          <p>役割: {user.role === 'admin' ? '管理者' : '一般ユーザー'}</p>
        </div>
      </section>
    </div>
  )
}
