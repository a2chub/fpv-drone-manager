import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { updateUserProfile, updateUserSettings } from '@/lib/firebase/auth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useUserParticipations, useUpdateParticipationVisibility } from '@/hooks/useEvents'
import type { ThemeMode } from '@/types'

export function SettingsPage() {
  const { user } = useAuth()
  const { themeMode, setThemeMode } = useTheme()
  const { data: participations, isLoading: participationsLoading } = useUserParticipations()
  const updateVisibility = useUpdateParticipationVisibility()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [location, setLocation] = useState(user?.profile?.location || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [isProfilePublic, setIsProfilePublic] = useState(user?.settings?.isProfilePublic ?? true)
  const [showEventHistory, setShowEventHistory] = useState(user?.settings?.showEventHistory ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [privacySaveSuccess, setPrivacySaveSuccess] = useState(false)
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
      setIsProfilePublic(user.settings?.isProfilePublic ?? true)
      setShowEventHistory(user.settings?.showEventHistory ?? false)
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

  const handlePrivacySave = async () => {
    if (!user) return

    setIsSavingPrivacy(true)
    setError(null)
    setPrivacySaveSuccess(false)

    try {
      await updateUserSettings(user.id, {
        ...user.settings,
        isProfilePublic,
        showEventHistory,
      })

      setPrivacySaveSuccess(true)
      setTimeout(() => setPrivacySaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プライバシー設定の保存に失敗しました')
    } finally {
      setIsSavingPrivacy(false)
    }
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

      {/* Privacy section */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          プライバシー設定
        </h2>

        {privacySaveSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">プライバシー設定を保存しました</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Profile public setting */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isProfilePublic}
              onChange={(e) => setIsProfilePublic(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                プロフィールを公開する
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                オフにすると、他のユーザーはあなたのプロフィール詳細（自己紹介、機体、レース記録など）を見ることができません。名前とアバター画像のみ表示されます。
              </p>
            </div>
          </label>

          {/* Event history public setting */}
          <label className={`flex items-start gap-3 ${isProfilePublic ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
            <input
              type="checkbox"
              checked={showEventHistory}
              onChange={(e) => setShowEventHistory(e.target.checked)}
              disabled={!isProfilePublic}
              className="mt-1 w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
            />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                参加イベント履歴を公開する
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                オンにすると、過去に参加したイベントがプロフィールに表示されます。各イベントの公開/非公開は個別に設定できます。
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handlePrivacySave}
          disabled={isSavingPrivacy}
          className="btn-primary mt-6"
        >
          {isSavingPrivacy ? '保存中...' : 'プライバシー設定を保存'}
        </button>
      </section>

      {/* Event history visibility section */}
      {showEventHistory && (
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            参加イベント履歴の公開設定
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            各イベントの参加履歴を公開プロフィールに表示するかどうかを設定できます。
          </p>

          {participationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          ) : participations && participations.length > 0 ? (
            <div className="space-y-3">
              {participations.map(({ participant, event }) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/events/${event.id}`}
                        className="font-medium text-gray-900 dark:text-white truncate block hover:text-primary-500"
                      >
                        {event.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {event.date?.toDate?.().toLocaleDateString('ja-JP')} - {event.location}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={participant.isPublic ?? false}
                      onChange={(e) => {
                        updateVisibility.mutate({
                          eventId: event.id,
                          participantId: participant.id,
                          isPublic: e.target.checked,
                        })
                      }}
                      disabled={updateVisibility.isPending}
                      className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {participant.isPublic ? '公開' : '非公開'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>参加したイベントはまだありません</p>
            </div>
          )}
        </section>
      )}

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
