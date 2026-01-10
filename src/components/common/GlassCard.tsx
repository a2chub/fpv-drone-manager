import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

/**
 * GlassCard - グラスモーフィズムスタイルのカードコンポーネント
 * backdrop-blurを使用した透明感のあるデザイン
 */
export function GlassCard({
  children,
  className = '',
  hover = true,
}: GlassCardProps) {
  const baseClasses =
    'backdrop-blur-md bg-white/70 dark:bg-gray-900/50 border border-white/30 dark:border-gray-700/40 rounded-2xl'
  const hoverClasses = hover
    ? 'transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30 dark:hover:border-primary-400/30 hover:-translate-y-1'
    : ''

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
