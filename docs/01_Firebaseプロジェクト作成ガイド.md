# Firebaseプロジェクト作成ガイド

このドキュメントでは、FPV Drone ManagerアプリのためのFirebaseプロジェクトの作成手順を説明します。

## 前提条件

- Googleアカウントを持っていること
- [Firebase Console](https://console.firebase.google.com/) にアクセスできること

## 手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `fpv-drone-manager`）
4. Google Analyticsの設定（任意、本アプリでは無効で可）
5. 「プロジェクトを作成」をクリック

### 2. Webアプリの登録

1. プロジェクトのダッシュボードで「ウェブ」アイコン（`</>`）をクリック
2. アプリのニックネームを入力（例: `FPV Drone Manager Web`）
3. 「Firebase Hosting も設定する」にチェック（任意）
4. 「アプリを登録」をクリック

### 3. Firebase設定情報の取得

アプリ登録後、以下のような設定情報が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 4. 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下の形式で設定情報を記述：

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

> **重要**: `.env.local` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

### 5. 設定の確認

環境変数を設定後、開発サーバーを再起動して設定が反映されているか確認します：

```bash
# 開発サーバーを停止（Ctrl+C）後、再起動
npm run dev
```

## 次のステップ

- [02_Firebase Authentication設定ガイド](./02_Firebase_Authentication設定ガイド.md) - 認証の設定
- [03_Firestore設定ガイド](./03_Firestore設定ガイド.md) - データベースの設定
- [04_Firebase_Storage設定ガイド](./04_Firebase_Storage設定ガイド.md) - ファイルストレージの設定

## トラブルシューティング

### 設定情報を忘れた場合

1. Firebase Console → プロジェクト設定（歯車アイコン）
2. 「全般」タブ → 「マイアプリ」セクション
3. 該当のWebアプリを選択 → 設定情報を確認

### プロジェクトを削除したい場合

1. Firebase Console → プロジェクト設定
2. ページ下部の「プロジェクトを削除」
3. 確認事項に同意して削除

> **注意**: プロジェクト削除は取り消せません。
