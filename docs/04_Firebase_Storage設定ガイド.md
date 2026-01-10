# Firebase Storage 設定ガイド

このドキュメントでは、FPV Drone Managerアプリのための Firebase Storage（画像ストレージ）の設定手順を説明します。

## 前提条件

- [01_Firebaseプロジェクト作成ガイド](./01_Firebaseプロジェクト作成ガイド.md) の手順が完了していること

## Firebase Storageの有効化

### 1. Storageの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを開く
2. 左メニューから「Storage」を選択
3. 「始める」ボタンをクリック

### 2. セキュリティモードの選択

| モード | 説明 |
|--------|------|
| 本番環境モード | 厳格なセキュリティルール（推奨） |
| テストモード | 30日間全アクセス許可 |

**推奨**: 本番環境モードを選択

### 3. ロケーションの選択

Firestoreと同じリージョンを選択することを推奨：

| リージョン | 説明 |
|-----------|------|
| `asia-northeast1` | 東京（日本ユーザー向け推奨） |
| `us-central1` | アイオワ（グローバル向け） |

### 4. 作成完了

「完了」をクリックしてStorageバケットを作成します。

## フォルダ構造

本アプリでは以下のフォルダ構造を使用します：

```
storage/
├── users/
│   └── {userId}/
│       ├── drones/
│       │   └── {droneId}/
│       │       ├── main.jpg          # メイン画像
│       │       └── gallery/          # ギャラリー画像
│       │           ├── 1704067200_image1.jpg
│       │           └── 1704067201_image2.jpg
│       ├── parts/
│       │   └── {partId}/
│       │       └── images/
│       └── races/
│           └── {raceId}/
│               └── images/
│
└── public/
    └── {userId}/
        └── profile.jpg               # 公開プロフィール画像
```

## セキュリティルールの設定

### 1. ルールファイルの確認

プロジェクトルートの `storage.rules` ファイル：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 認証確認
    function isAuthenticated() {
      return request.auth != null;
    }

    // 本人確認
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 有効な画像ファイル確認
    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 10 * 1024 * 1024; // 10MB制限
    }

    // ユーザーの非公開画像
    match /users/{userId}/{allPaths=**} {
      // 認証済みユーザーは読み取り可能
      allow read: if isAuthenticated();
      // 本人のみアップロード可能（画像のみ、10MB以下）
      allow write: if isOwner(userId) && isValidImage();
    }

    // 公開画像（誰でも読み取り可能）
    match /public/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isOwner(userId) && isValidImage();
    }
  }
}
```

### 2. ルールのデプロイ

```bash
# Storageルールのデプロイ
firebase deploy --only storage:rules
```

## ファイルアップロードの制限

### サイズ制限

| ファイル種別 | 最大サイズ |
|-------------|-----------|
| 画像 | 10MB |

### 許可されるファイル形式

| MIME Type | 拡張子 |
|-----------|--------|
| `image/jpeg` | .jpg, .jpeg |
| `image/png` | .png |
| `image/gif` | .gif |
| `image/webp` | .webp |

## 画像アップロードの実装例

### 基本的なアップロード

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

async function uploadImage(
  userId: string,
  file: File,
  path: string
): Promise<string> {
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

### 画像のリサイズ（推奨）

アップロード前にクライアント側で画像をリサイズすることを推奨：

```typescript
async function resizeImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        0.85
      )
    }
    img.src = URL.createObjectURL(file)
  })
}
```

## CORS設定（必要な場合）

ブラウザから直接ダウンロードする場合、CORS設定が必要なことがあります。

### 1. cors.jsonファイルの作成

```json
[
  {
    "origin": ["http://localhost:3000", "https://your-domain.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

### 2. CORS設定の適用

```bash
# Google Cloud SDKが必要
gsutil cors set cors.json gs://your-project-id.appspot.com
```

## ローカル開発（Emulator）

### Emulatorの設定

`firebase.json` に Storage Emulator が設定されています：

```json
{
  "emulators": {
    "storage": {
      "port": 9199
    }
  }
}
```

### Emulatorへの接続（オプション）

```typescript
// src/lib/firebase/config.ts に追加
import { connectStorageEmulator } from 'firebase/storage'

if (import.meta.env.DEV) {
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

## トラブルシューティング

### 「User does not have permission」エラー

**原因**: セキュリティルールによるアクセス拒否

**対処法**:
1. ログイン状態を確認
2. ファイルパスが正しいか確認（`users/{userId}/...`）
3. ルールがデプロイされているか確認

### 「File too large」エラー

**原因**: ファイルサイズが10MBを超えている

**対処法**:
1. アップロード前に画像をリサイズ
2. 画像圧縮ライブラリを使用

### 「Invalid content type」エラー

**原因**: 許可されていないファイル形式

**対処法**:
1. 画像ファイル（jpg, png, gif, webp）のみアップロード
2. ファイル選択時にフィルタリング

### CORS エラー

**原因**: オリジンが許可されていない

**対処法**:
1. cors.json でドメインを許可
2. Firebase Console → Storage → Rulesで確認

## 料金について

### 無料枠（Sparkプラン）

| 項目 | 制限 |
|------|------|
| ストレージ | 5GB |
| ダウンロード | 1GB/日 |
| アップロード | 20,000回/日 |

### 有料プラン（Blazeプラン）

従量課金制：
- ストレージ: $0.026/GB/月
- ダウンロード: $0.12/GB
- アップロード・削除: 無料

## 次のステップ

- [05_デプロイガイド](./05_デプロイガイド.md) - 本番環境へのデプロイ
