# Firestore 設定ガイド

このドキュメントでは、FPV Drone ManagerアプリのためのCloud Firestoreの設定手順を説明します。

## 前提条件

- [01_Firebaseプロジェクト作成ガイド](./01_Firebaseプロジェクト作成ガイド.md) の手順が完了していること

## Firestoreデータベースの作成

### 1. Firestoreの有効化

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを開く
2. 左メニューから「Firestore Database」を選択
3. 「データベースを作成」をクリック

### 2. セキュリティモードの選択

| モード | 説明 | 推奨 |
|--------|------|------|
| 本番環境モード | 厳格なセキュリティルール | 本番環境向け |
| テストモード | 30日間全アクセス許可 | 開発初期のみ |

**推奨**: 本番環境モードを選択し、後でセキュリティルールをデプロイ

### 3. ロケーションの選択

| リージョン | 説明 |
|-----------|------|
| `asia-northeast1` | 東京（日本ユーザー向け推奨） |
| `asia-northeast2` | 大阪 |
| `us-central1` | アイオワ（グローバル向け） |

> **重要**: ロケーションは後から変更できません。慎重に選択してください。

### 4. 作成完了

「有効にする」をクリックしてデータベースを作成します。

## データ構造

本アプリでは以下のコレクション構造を使用します：

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL: string | null
│       ├── role: "user" | "admin"
│       ├── profile: { bio, location, socialLinks }
│       ├── settings: { defaultVisibility, emailNotifications }
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       │
│       ├── drones/                    # サブコレクション
│       │   └── {droneId}/
│       │       ├── name: string
│       │       ├── category: string
│       │       ├── status: string
│       │       ├── isPublic: boolean
│       │       └── parts/             # サブコレクション
│       │           └── {partId}/
│       │
│       └── races/                     # サブコレクション
│           └── {raceId}/
│
└── publicProfiles/
    └── {userId}/                      # 公開プロフィール（キャッシュ）
```

## セキュリティルールの設定

### 1. ルールファイルの確認

プロジェクトルートの `firestore.rules` ファイルに以下のルールが定義されています：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみアクセス可能
    function isAuthenticated() {
      return request.auth != null;
    }

    // 本人確認
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 管理者確認
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // 公開データ確認
    function isPublicData() {
      return resource.data.isPublic == true;
    }

    // ユーザーコレクション
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAdmin();

      // 機体サブコレクション
      match /drones/{droneId} {
        allow read: if isOwner(userId) ||
                       (isAuthenticated() && isPublicData()) ||
                       isAdmin();
        allow write: if isOwner(userId);

        // パーツサブコレクション
        match /parts/{partId} {
          allow read: if isOwner(userId) ||
                         (isAuthenticated() && isPublicData()) ||
                         isAdmin();
          allow write: if isOwner(userId);
        }
      }

      // レースサブコレクション
      match /races/{raceId} {
        allow read: if isOwner(userId) ||
                       (isAuthenticated() && isPublicData()) ||
                       isAdmin();
        allow write: if isOwner(userId);
      }
    }

    // 公開プロフィール（誰でも読み取り可能）
    match /publicProfiles/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin();
    }
  }
}
```

### 2. ルールのデプロイ

Firebase CLIを使用してルールをデプロイします：

```bash
# Firebase CLIのインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化（初回のみ）
firebase init firestore

# ルールのデプロイ
firebase deploy --only firestore:rules
```

## インデックスの設定

複合クエリを使用する場合、インデックスが必要です。

### 自動作成

クエリ実行時にインデックスエラーが発生した場合：
1. エラーメッセージ内のリンクをクリック
2. Firebase Consoleでインデックスを作成

### 手動設定

`firestore.indexes.json` ファイルでインデックスを定義：

```json
{
  "indexes": [
    {
      "collectionGroup": "drones",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

デプロイ：

```bash
firebase deploy --only firestore:indexes
```

## ローカル開発（Emulator）

開発時はFirebase Emulatorを使用することを推奨します。

### Emulatorの起動

```bash
# Emulatorの起動
firebase emulators:start

# Firestore Emulator: http://localhost:8080
# Emulator UI: http://localhost:4000
```

### アプリでEmulatorに接続

開発環境でのみEmulatorに接続する設定（オプション）：

```typescript
// src/lib/firebase/config.ts に追加
import { connectFirestoreEmulator } from 'firebase/firestore'

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

## トラブルシューティング

### 「Missing or insufficient permissions」エラー

**原因**: セキュリティルールによるアクセス拒否

**対処法**:
1. Firebase Console でルールを確認
2. 認証状態を確認（ログイン済みか）
3. ドキュメントのパスとルールが一致しているか確認

### 「The query requires an index」エラー

**原因**: 複合クエリに必要なインデックスがない

**対処法**:
1. エラーメッセージ内のリンクをクリック
2. インデックスを作成（数分かかる場合あり）

### データが反映されない

**原因**: キャッシュの問題

**対処法**:
- ブラウザをハードリロード（Ctrl+Shift+R）
- Emulator使用時は再起動

## 次のステップ

- [04_Firebase_Storage設定ガイド](./04_Firebase_Storage設定ガイド.md) - ファイルストレージの設定
