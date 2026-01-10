import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/analytics'

/**
 * ページ遷移を追跡するフック
 * React Routerのlocation変更を監視してGA4にページビューを送信
 */
export function usePageTracking(): void {
  const location = useLocation()

  useEffect(() => {
    // ページ遷移時にページビューを送信
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])
}
