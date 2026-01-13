# FPV Drone Manager - プロジェクトガイドライン

## プロジェクト概要

FPVドローンの管理Webアプリ（みんカラ風SNS機能付き）

- **技術スタック**: React 19, TypeScript, Vite 7, TailwindCSS, Firebase
- **リポジトリ**: https://github.com/a2chub/fpv-drone-manager
- **デプロイ先**: Firebase Hosting

## ドキュメント

重要なドキュメントは必ず参照すること：
- `docs/00_要件概要.md` - プロジェクト要件
- `docs/07_実装ステータス.md` - 実装状況とIssue一覧

---

## Issue駆動開発ワークフロー

### 必須ルール

1. **実装開始時**
   - 対応するGitHub Issueを確認
   - Issueに着手コメントを追加

2. **実装中**
   - コミットメッセージにIssue番号を含める
   - 例: `feat: add unit tests #1`
   - 例: `fix: resolve error boundary issue #2`

3. **実装完了時**
   - テストが通過することを確認
   - `npm run build` が成功することを確認

4. **デプロイ完了時**
   - Issueに完了コメントを追加
   - Issueをクローズ

### Issueコメントテンプレート

**着手時:**
```
🚀 実装を開始します
- 担当: Claude Code
- 予定作業: [作業内容を記載]
```

**完了時:**
```
✅ 実装完了
- 実装内容: [概要を記載]
- テスト: 通過
- デプロイ: 完了
- コミット: [コミットハッシュ]
```

### 現在のIssue一覧

| # | タイトル | 優先度 |
|---|---------|--------|
| [#1](https://github.com/a2chub/fpv-drone-manager/issues/1) | 単体テスト・統合テストの追加 | 高 |
| [#2](https://github.com/a2chub/fpv-drone-manager/issues/2) | エラーバウンダリの改善 | 高 |
| [#3](https://github.com/a2chub/fpv-drone-manager/issues/3) | オフライン対応（Service Worker） | 高 |
| [#4](https://github.com/a2chub/fpv-drone-manager/issues/4) | ソート機能の強化 | 中 |
| [#5](https://github.com/a2chub/fpv-drone-manager/issues/5) | 画像の自動圧縮・最適化 | 中 |
| [#6](https://github.com/a2chub/fpv-drone-manager/issues/6) | PWA対応 | 中 |
| [#7](https://github.com/a2chub/fpv-drone-manager/issues/7) | いいね機能 | 中 |
| [#8](https://github.com/a2chub/fpv-drone-manager/issues/8) | 通知機能（リアルタイム） | 中 |
| [#9](https://github.com/a2chub/fpv-drone-manager/issues/9) | エクスポート機能（CSV/PDF） | 低 |
| [#10](https://github.com/a2chub/fpv-drone-manager/issues/10) | チャット/DM機能 | 低 |
| [#11](https://github.com/a2chub/fpv-drone-manager/issues/11) | 多言語対応（i18n） | 低 |
| [#12](https://github.com/a2chub/fpv-drone-manager/issues/12) | アクセシビリティ強化 | 中 |
| [#13](https://github.com/a2chub/fpv-drone-manager/issues/13) | パフォーマンス最適化 | 低 |
| [#14](https://github.com/a2chub/fpv-drone-manager/issues/14) | コード分割 | 低 |

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# E2Eテスト
npm run e2e:smoke      # スモークテスト
npm run e2e:feature    # 機能テスト
npm run e2e:full       # フルワークフロー

# Firebase デプロイ
firebase deploy --only hosting
```

---

## コーディング規約

### コミットメッセージ
コンベンショナルコミット形式を使用：
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `test:` テスト
- `refactor:` リファクタリング
- `chore:` その他

### ファイル構成
```
src/
├── components/   # UIコンポーネント
├── contexts/     # Reactコンテキスト
├── hooks/        # カスタムフック
├── lib/          # ライブラリ設定
├── pages/        # ページコンポーネント
├── services/     # データサービス
├── types/        # 型定義
└── utils/        # ユーティリティ
```
