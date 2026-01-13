import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

/**
 * ソーシャルシェアボタンコンポーネント
 * Twitter/X、Facebook、リンクコピー機能を提供
 */
export function ShareButtons({
  url,
  title,
  description,
  className,
}: ShareButtonsProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  // メニュー表示時にボタン位置を計算
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [showMenu])

  // フルURLを構築（相対パスの場合）
  const fullUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}${url}`

  // Twitter/Xでシェア
  const shareToTwitter = useCallback(() => {
    const text = description ? `${title}\n\n${description}` : title
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
    setShowMenu(false)
  }, [fullUrl, title, description])

  // Facebookでシェア
  const shareToFacebook = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
    setShowMenu(false)
  }, [fullUrl])

  // リンクをコピー
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch {
      // フォールバック: テキストエリアを使用
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    }
  }, [fullUrl])

  return (
    <div className={cn('relative', className)}>
      {/* シェアボタン */}
      <motion.button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="シェア"
        aria-expanded={showMenu}
      >
        <Share2 size={18} />
      </motion.button>

      {/* シェアメニュー（Portalでbody直下にレンダリング） */}
      {showMenu && createPortal(
        <>
          {/* バックドロップ */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMenu(false)}
          />

          {/* メニューパネル */}
          <motion.div
            key="share-menu"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              top: menuPosition.top,
              right: menuPosition.right,
            }}
            className="z-[9999] min-w-[180px] glass rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden"
          >
            <div className="p-2">
              {/* Twitter/X */}
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <Twitter size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium">Twitter / X</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <Facebook size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </button>

              {/* 区切り線 */}
              <div className="my-2 border-t border-gray-200/50 dark:border-gray-700/50" />

              {/* リンクコピー */}
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  copied
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}>
                  {copied ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Link2 size={16} className="text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {copied ? 'コピーしました!' : 'リンクをコピー'}
                </span>
              </button>
            </div>
          </motion.div>
        </>,
        document.body
      )}

      {/* トースト通知 */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl glass shadow-lg border border-green-500/30 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              リンクをクリップボードにコピーしました
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * インラインシェアボタン（メニューなしの直接ボタン表示）
 */
export function ShareButtonsInline({
  url,
  title,
  description,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}${url}`

  const shareToTwitter = () => {
    const text = description ? `${title}\n\n${description}` : title
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.button
        onClick={shareToTwitter}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full bg-black hover:bg-gray-800 transition-colors"
        aria-label="Twitter / X でシェア"
      >
        <Twitter size={16} className="text-white" />
      </motion.button>

      <motion.button
        onClick={shareToFacebook}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full bg-[#1877F2] hover:bg-[#1565D8] transition-colors"
        aria-label="Facebook でシェア"
      >
        <Facebook size={16} className="text-white" />
      </motion.button>

      <motion.button
        onClick={copyLink}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'p-2 rounded-full transition-colors',
          copied
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        )}
        aria-label="リンクをコピー"
      >
        {copied ? (
          <Check size={16} className="text-white" />
        ) : (
          <Link2 size={16} className="text-gray-600 dark:text-gray-300" />
        )}
      </motion.button>
    </div>
  )
}
