import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStats } from '@/hooks/useStats'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { BackgroundPaths } from '@/components/ui/background-paths'
import { GlassCard } from '@/components/common/GlassCard'
import { GradientText } from '@/components/common/GradientText'
import { QuickStatBar } from '@/components/ui/stat-card'
import {
  PublicContentSection,
  ActivityFeed,
  UpcomingEvents,
  CommunityHighlights,
  SuggestedPilots,
} from '@/components/home'
import { motion } from 'framer-motion'
import { Plus, Zap, LayoutDashboard, Plane, Flag, Users, Calendar } from 'lucide-react'

export function Home() {
  const { isAuthenticated, user } = useAuth()
  const { data: stats } = useStats()

  // ログインユーザー向けレイアウト
  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <BackgroundPaths />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* ウェルカムヘッダー + クイックアクション */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                おかえりなさい、<GradientText>{user?.displayName || 'パイロット'}</GradientText>さん
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                コミュニティの最新情報をチェックしましょう
              </p>
            </div>

            {/* クイックアクション (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/drones/new"
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                <span>機体登録</span>
              </Link>
              <Link
                to="/races/new"
                className="btn-secondary flex items-center gap-2"
              >
                <Zap size={18} />
                <span>フライト記録</span>
              </Link>
              <Link
                to="/dashboard"
                className="btn-outline flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                <span>整備記録</span>
              </Link>
            </div>
          </motion.div>

          {/* クイックスタッツバー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuickStatBar
              items={[
                {
                  label: '機体',
                  value: stats?.droneCount ?? 0,
                  icon: Plane,
                  onClick: () => window.location.href = '/drones',
                },
                {
                  label: 'フライト',
                  value: stats?.raceCount ?? 0,
                  icon: Flag,
                  onClick: () => window.location.href = '/races',
                },
                {
                  label: 'フォロー',
                  value: stats?.followingCount ?? 0,
                  icon: Users,
                  onClick: () => window.location.href = '/users',
                },
                {
                  label: 'イベント',
                  value: stats?.upcomingEventCount ?? 0,
                  icon: Calendar,
                  onClick: () => window.location.href = '/events',
                },
              ]}
            />
          </motion.div>

          {/* クイックアクション (Mobile) */}
          <div className="md:hidden flex gap-3">
            <Link to="/drones/new" className="btn-primary flex-1 justify-center">
              <Plus size={18} className="mr-2" />
              機体登録
            </Link>
            <Link to="/races/new" className="btn-secondary flex-1 justify-center">
              <Zap size={18} className="mr-2" />
              記録
            </Link>
          </div>

          {/* コミュニティハイライト カルーセル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CommunityHighlights />
          </motion.div>

          {/* メインコンテンツ: 3カラムレイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左: アクティビティフィード (2/3) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6">
                <ActivityFeed />
              </GlassCard>
            </motion.div>

            {/* 右: サイドバー (1/3) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* 参加予定イベント */}
              <GlassCard className="p-6">
                <UpcomingEvents maxItems={3} />
              </GlassCard>

              {/* おすすめパイロット */}
              <GlassCard className="p-6">
                <SuggestedPilots maxItems={5} />
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // 非ログインユーザー向けレイアウト
  return (
    <div className="relative min-h-screen">
      {/* アニメーション背景 */}
      <AnimatedBackground />
      <BackgroundPaths />

      {/* Hero Section */}
      <div className="relative min-h-[85vh] flex items-center justify-center px-4">
        <div className="text-center z-10 max-w-4xl mx-auto">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-float">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              FPVパイロットのための管理プラットフォーム
            </span>
          </div>

          {/* メインタイトル */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-gray-900 dark:text-white">
              FPVドローンを
              <br />
            </span>
            <GradientText className="leading-tight">記録・共有</GradientText>
            <span className="text-gray-900 dark:text-white">しよう</span>
          </h1>

          {/* サブタイトル */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            機体のスペック、パーツ情報、レースの記録を管理し、
            <br className="hidden sm:block" />
            FPVパイロット同士で情報を共有できるプラットフォームです。
          </p>

          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-10 py-4 rounded-xl hover-glow animate-pulse-glow"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-primary text-lg px-10 py-4 rounded-xl hover-glow animate-pulse-glow"
                >
                  無料で始める
                </Link>
                <Link
                  to="/login"
                  className="btn-outline text-lg px-10 py-4 rounded-xl glass hover:bg-white/20 dark:hover:bg-gray-800/30"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>

          {/* コミュニティプレビュー */}
          <div className="mt-12">
            <PublicContentSection compact />
          </div>

          {/* スクロールインジケーター */}
          <div className="mt-8 animate-bounce">
            <svg
              className="w-6 h-6 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* セクションタイトル */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              すべてを<GradientText>一元管理</GradientText>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              機体情報からレース記録まで、FPVライフに必要なすべてを管理できます
            </p>
          </div>

          {/* Feature カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 機体管理 */}
            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                機体管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                機体の写真やスペック、使用パーツを一元管理。複数機体の情報も整理できます。
              </p>
            </GlassCard>

            {/* レース記録 */}
            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                レース記録
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                参加レースの結果や感想を記録。パフォーマンスの振り返りに活用できます。
              </p>
            </GlassCard>

            {/* 情報共有 */}
            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                情報共有
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                公開設定で他のパイロットと情報を共有。コミュニティで知識を深められます。
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 sm:p-12" hover={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  100+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  登録ユーザー
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  登録機体
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  1,000+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  パーツ情報
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  200+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  レース記録
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            今すぐ<GradientText>始めよう</GradientText>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            無料で登録して、あなたのFPVドローンライフをより豊かにしましょう。
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="btn-primary text-lg px-12 py-4 rounded-xl hover-glow inline-block"
            >
              無料で登録する
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
