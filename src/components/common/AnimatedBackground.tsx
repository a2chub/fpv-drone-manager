/**
 * AnimatedBackground - 21st.dev風のアニメーション背景コンポーネント
 * CSS-onlyアニメーションでパフォーマンス重視
 * グラデーションメッシュ + 浮遊するオーブ
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* ベースグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />

      {/* アニメーションオーブ */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20 blur-3xl animate-float-slow"
        style={{
          background:
            'radial-gradient(circle, rgba(65, 201, 180, 0.4) 0%, transparent 70%)',
          top: '10%',
          left: '15%',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-15 blur-3xl animate-float-medium"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          top: '50%',
          right: '10%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-3xl animate-float-fast"
        style={{
          background:
            'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
          bottom: '20%',
          left: '40%',
        }}
      />

      {/* グリッドオーバーレイ（微細） */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* ノイズテクスチャ */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] mix-blend-overlay noise-texture" />
    </div>
  )
}
