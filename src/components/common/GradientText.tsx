import type { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * GradientText - グラデーションテキストコンポーネント
 * 美しいマルチカラーグラデーションを適用
 */
export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-primary-400 via-purple-500 to-pink-500 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}
