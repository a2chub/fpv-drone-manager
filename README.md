# FPV Drone Manager

FPVドローンの管理・共有プラットフォーム

## 概要

FPV Drone Managerは、FPVドローン愛好家のための機体管理Webアプリケーションです。みんカラのように、自分のドローンのスペックやパーツ情報を記録し、他のユーザーと共有できます。

## 主な機能

- **ドローン管理**: 機体の登録、スペック情報、画像の管理
- **パーツ管理**: モーター、FC、ESC等のパーツ情報と履歴記録
- **レース記録**: レース出場履歴、順位、感想の記録
- **イベント機能**: イベント作成、参加申し込み、参加者管理
- **ソーシャル機能**: フォロー/フォロワー、アクティビティフィード、コメント
- **公開機能**: 機体情報を公開プロフィールで共有
- **管理者機能**: ユーザー管理、ロール設定

## 技術スタック

- **フロントエンド**: React 19, TypeScript, TailwindCSS
- **ビルドツール**: Vite 7
- **バックエンド**: Firebase (Authentication, Firestore, Storage, Hosting)
- **状態管理**: TanStack Query, React Hook Form
- **アニメーション**: Framer Motion

## クイックスタート

### 前提条件

- Node.js 18以上
- npm または yarn
- Firebaseプロジェクト

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd drone_spec

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.localを編集してFirebase設定を入力
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### ビルド

```bash
npm run build
```

### デプロイ

```bash
firebase deploy
```

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルド |
| `npm run preview` | ビルド結果をプレビュー |
| `npm run lint` | ESLintでコードチェック |
| `npm run test` | テストを実行 |
| `npm run e2e:smoke` | E2Eスモークテスト |
| `npm run e2e:feature` | E2E機能テスト |
| `npm run e2e:full` | E2Eフルワークフローテスト |
| `npm run e2e:parallel` | E2E並列実行 |

## プロジェクト構造

```
src/
├── components/       # UIコンポーネント
├── contexts/         # Reactコンテキスト
├── hooks/            # カスタムフック
├── lib/firebase/     # Firebase設定
├── pages/            # ページコンポーネント
├── services/         # データサービス
├── types/            # 型定義
└── App.tsx           # ルーティング定義

e2e/
├── config/           # テスト設定
├── auth/             # 認証処理
├── tests/            # テストスイート
│   ├── smoke/        # スモークテスト
│   ├── feature/      # 機能テスト
│   └── full/         # フルワークフロー
├── helpers/          # ヘルパー関数
├── fixtures/         # テストデータ
└── README.md         # E2Eテストガイド
```

## ドキュメント

詳細なドキュメントは `docs/` フォルダを参照してください。

- [要件概要](docs/00_要件概要.md)
- [Firebaseプロジェクト作成ガイド](docs/01_Firebaseプロジェクト作成ガイド.md)
- [Firebase Authentication設定ガイド](docs/02_Firebase_Authentication設定ガイド.md)
- [Firestore設定ガイド](docs/03_Firestore設定ガイド.md)
- [Firebase Storage設定ガイド](docs/04_Firebase_Storage設定ガイド.md)
- [デプロイガイド](docs/05_デプロイガイド.md)
- [ローカル開発クイックスタート](docs/06_ローカル開発クイックスタート.md)
- [実装ステータス](docs/07_実装ステータス.md)
- [E2Eテストガイド](e2e/README.md)

## 環境変数

`.env.local` ファイルに以下の環境変数を設定してください：

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## ライセンス

ISC
