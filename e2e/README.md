# E2E テスト (agent-browser)

FPV Drone Managerのエンドツーエンドテスト。agent-browserを使用したヘッドレスブラウザ自動化テストです。

---

## クイックスタート

**30秒で最初のテストを実行する手順：**

```bash
# 1. セットアップ（初回のみ）
cp .env.test.local.example .env.test.local
# .env.test.local を編集してクレデンシャルを設定

# 2. 開発サーバー起動（別ターミナル）
npm run dev

# 3. テスト実行
npm run e2e:smoke
```

成功すると以下のような出力が表示されます：

```
==========================================
E2E Test Results: PASSED
==========================================
Smoke Tests: 2/2 passed
Total Duration: 28s
==========================================
```

---

## セットアップ

### 1. agent-browser のインストール

```bash
npm install -g agent-browser
agent-browser install
```

### 2. クレデンシャル設定

```bash
# テンプレートをコピー
cp .env.test.local.example .env.test.local

# クレデンシャルを編集
# E2E_TEST_EMAIL と E2E_TEST_PASSWORD を設定
```

**重要**: `.env.test.local` はgitignoreされています。絶対にコミットしないでください。

### 3. 開発サーバー起動

```bash
npm run dev
```

## テスト実行

### 基本コマンド

```bash
# スモークテスト（推奨：最初に実行）
npm run e2e:smoke

# 全機能テスト
npm run e2e:feature

# フルワークフローテスト
npm run e2e:full

# 全テスト実行
npm run e2e all
```

### 機能別テスト

```bash
# ドローン機能のみ
npm run e2e:drones

# レース機能のみ
npm run e2e:races

# イベント機能のみ
npm run e2e:events
```

### デバッグモード

```bash
# ブラウザを表示してテスト（headedモード）
npm run e2e:headed

# 認証のみ実行
npm run e2e:auth
```

### 並列実行

```bash
# drones, races, events を同時に実行
npm run e2e:parallel
```

## テストレベル

| レベル | コマンド | 内容 | 実行時間目安 |
|--------|---------|------|-------------|
| smoke | `npm run e2e:smoke` | 公開ページ、認証フロー | ~30秒 |
| feature | `npm run e2e:feature` | 全機能CRUD | ~4分 |
| full | `npm run e2e:full` | ワークフロー全体 | ~5分 |

## ディレクトリ構造

```
e2e/
├── config/
│   ├── base.sh          # 共通設定
│   └── selectors.sh     # CSSセレクター
├── auth/
│   ├── login.sh         # ログイン
│   ├── logout.sh        # ログアウト
│   └── verify-auth.sh   # 認証確認
├── tests/
│   ├── smoke/           # スモークテスト
│   ├── feature/         # 機能テスト
│   │   ├── drones/
│   │   ├── races/
│   │   ├── events/
│   │   └── settings/
│   └── full/            # フルワークフロー
├── helpers/
│   ├── assertions.sh    # アサーション
│   ├── wait-for.sh      # 待機関数
│   └── screenshot.sh    # スクリーンショット
├── results/             # テスト結果（gitignore）
├── state/               # 認証状態（gitignore）
├── run-tests.sh         # メインランナー
├── run-parallel.sh      # 並列実行
└── README.md
```

## 認証フロー

1. **初回実行時**
   - `/login` にアクセス
   - Email/Password でログイン
   - Cookie を `e2e/state/` に保存

2. **2回目以降**
   - 保存済み Cookie を復元
   - 認証状態を確認
   - 期限切れの場合は再ログイン

## 環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `E2E_TEST_EMAIL` | テストユーザーメール | (必須) |
| `E2E_TEST_PASSWORD` | テストユーザーパスワード | (必須) |
| `E2E_BASE_URL` | テスト対象URL | `http://localhost:5173` |
| `E2E_HEADLESS` | ヘッドレスモード | `true` |
| `E2E_SCREENSHOT_ON_FAILURE` | 失敗時スクリーンショット | `true` |
| `E2E_ENABLE_DELETE` | 削除テスト有効化 | `false` |

## テスト作成ガイド

### 新しいテストの追加

```bash
#!/bin/bash
# e2e/tests/feature/myfeature/test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"

SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/myfeature/test"
setup_test "$TEST_NAME"

# テストロジック
ab open "${E2E_BASE_URL}/mypage"
wait_for_page_load

assert_url_contains "/mypage"
assert_text_visible "期待するテキスト"

teardown_test "$TEST_NAME" "pass"
```

### アサーション関数

- `assert_text_visible "テキスト"` - テキストが表示されているか
- `assert_url_contains "/path"` - URLに文字列が含まれるか
- `assert_element_exists "selector"` - 要素が存在するか
- `assert_element_visible "selector"` - 要素が表示されているか
- `assert_element_count "selector" 3` - 要素の数を確認

### 待機関数

- `wait_for_element "selector"` - 要素の出現を待機
- `wait_for_text "テキスト"` - テキストの出現を待機
- `wait_for_url "/path"` - URL変更を待機
- `wait_for_page_load` - ページ読み込み完了を待機

## トラブルシューティング

### 認証エラー

```bash
# Cookie をクリアして再認証
rm -rf e2e/state/*
npm run e2e:auth
```

### テストが不安定

```bash
# headed モードで実行して動作確認
npm run e2e:headed
```

### スクリーンショット確認

失敗時のスクリーンショットは `e2e/results/` に保存されます。

```bash
ls -la e2e/results/
open e2e/results/failure_*.png
```

## Claude Code サブエージェント連携

E2Eテストは Claude Code のサブエージェントから呼び出し可能です。

```bash
# サブエージェントから実行する例
bash e2e/run-tests.sh smoke
bash e2e/run-tests.sh feature/drones
bash e2e/run-parallel.sh
```

## 注意事項

1. **テストユーザー**: 本番環境で実行する場合は、専用のテストユーザーを使用してください
2. **テストデータ**: 作成されるデータには `E2E-` プレフィックスが付きます
3. **認証有効期限**: Firebase Auth トークンは約1時間で期限切れになります
4. **Google認証**: ポップアップ方式のため E2E テストでは使用不可。Email/Password 認証を使用してください

---

## FAQ（よくある質問）

### Q: テストが不安定（Flaky）です

**A:** 以下の手順で原因を特定してください：

1. headedモードで実行して動作を目視確認
   ```bash
   npm run e2e:headed
   ```
2. スクリーンショットを確認
   ```bash
   open e2e/results/failure_*.png
   ```
3. 待機処理が不足している場合は `wait_for_element` や `wait_for_page_load` を追加

### Q: 認証が失敗します

**A:** Cookie をクリアして再認証してください：

```bash
rm -rf e2e/state/*
npm run e2e:auth
```

それでも失敗する場合は `.env.test.local` のクレデンシャルを確認してください。

### Q: 新しいテストを追加したい

**A:** 以下の手順で追加できます：

1. `e2e/fixtures/` にテストデータ生成関数を追加
2. `e2e/config/selectors.sh` に必要なセレクターを追加
3. `e2e/tests/feature/{category}/` にテストスクリプトを作成
4. 詳細は [メンテナンスガイド](./docs/MAINTENANCE.md) を参照

### Q: UIが変更されてテストが壊れました

**A:** 変更内容に応じて以下のファイルを更新してください：

| 変更内容 | 更新対象ファイル |
|---------|-----------------|
| セレクター変更 | `e2e/config/selectors.sh` |
| フォームフィールド変更 | `e2e/config/forms.sh` |
| テストデータ変更 | `e2e/fixtures/*.fixture.sh` |

詳細は [メンテナンスガイド](./docs/MAINTENANCE.md) を参照してください。

### Q: テスト実行が遅い

**A:** 並列実行を試してください：

```bash
npm run e2e:parallel
```

これにより drones, races, events のテストが同時に実行されます。

### Q: 特定のテストだけ実行したい

**A:** 機能別に実行できます：

```bash
npm run e2e:drones   # ドローン機能のみ
npm run e2e:races    # レース機能のみ
npm run e2e:events   # イベント機能のみ
```

---

## 関連ドキュメント

- [メンテナンスガイド](./docs/MAINTENANCE.md) - UI変更時の更新手順、チェックリスト、失敗パターン
- [アンチパターン集](./docs/ANTI-PATTERNS.md) - やってはいけないこと、推奨される方法
- [agent-browser](https://github.com/vercel-labs/agent-browser) - 使用しているE2Eツール
