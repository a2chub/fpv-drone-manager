# E2Eテスト アンチパターン集

このドキュメントでは、E2Eテストで**やってはいけないこと**と**推奨される方法**を解説します。

---

## 1. セレクター関連

### やってはいけないこと

#### 1.1 CSSクラス名に依存したセレクター

```bash
# 悪い例
ab click '.btn-primary'
ab click '.event-card'
```

**問題点**: CSSリファクタリングやデザイン変更でクラス名が変わると、テストが壊れる。

#### 1.2 HTML構造に依存したセレクター

```bash
# 悪い例
ab click 'div > div > ul > li:first-child > a'
ab click 'article a'
```

**問題点**: HTMLの構造変更（ラッパー要素の追加など）でテストが壊れる。

#### 1.3 テキストのみに依存したセレクター（多言語対応時）

```bash
# 悪い例（多言語対応予定がある場合）
ab click 'text=Create Event'
```

**問題点**: i18n対応時にテキストが変わるとテストが壊れる。

#### 1.4 インデックスに依存したセレクター

```bash
# 悪い例
ab click '.card:nth-child(3)'
```

**問題点**: 要素の順序が変わるとテストが壊れる。

### 推奨される方法

```bash
# 良い例: data-testid を使用
ab click '[data-testid="event-card-abc123"]'
ab click '[data-testid^="event-card-"]'  # 前方一致

# 良い例: aria-label を使用（アクセシビリティも向上）
ab click '[aria-label="ユーザーメニュー"]'

# 良い例: フォールバック付きセレクター
EVENT_CARD_PRIMARY='[data-testid^="event-card-"]'
EVENT_CARD_FALLBACK='a[href*="/events/"]'
if ! ab is visible "$EVENT_CARD_PRIMARY" >/dev/null 2>&1; then
    ab click "$EVENT_CARD_FALLBACK"
else
    ab click "$EVENT_CARD_PRIMARY"
fi
```

---

## 2. テストデータ関連

### やってはいけないこと

#### 2.1 ハードコードされた固定値

```bash
# 悪い例
EVENT_TITLE="テストイベント"
ab fill 'input[id="title"]' "テストイベント"
```

**問題点**:
- 同じ名前のデータが重複作成される
- テストの再実行で予期しない結果になる
- 他のテストと干渉する可能性

#### 2.2 他のテストへの依存

```bash
# 悪い例: 他のテストが作成したデータを前提とする
EVENT_ID="fixed-event-id-12345"
ab open "/events/$EVENT_ID"
```

**問題点**: テストの実行順序に依存し、単体で実行できない。

#### 2.3 本番データの使用

```bash
# 悪い例
ab open "/events/production-event-id"
```

**問題点**: 本番データに影響を与える可能性、データが削除されるとテストが壊れる。

### 推奨される方法

```bash
# 良い例: fixtures を使用
source "$E2E_ROOT/fixtures/event.fixture.sh"
generate_event_test_data "E2E-Test"
# $EVENT_TITLE, $EVENT_DATE, $EVENT_LOCATION が設定される

# 良い例: タイムスタンプでユニーク化
TIMESTAMP=$(date +%s)
EVENT_TITLE="E2E-Test-Event-${TIMESTAMP}"

# 良い例: テスト内でデータを作成し、そのIDを使用
ab open "${E2E_BASE_URL}/events/new"
fill_event_form_minimal
ab click 'button[type="submit"]'
# 作成されたイベントのIDを取得して使用
EVENT_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$')
```

---

## 3. 待機処理関連

### やってはいけないこと

#### 3.1 固定sleepのみに依存

```bash
# 悪い例
ab click 'button[type="submit"]'
sleep 5  # 5秒待つ
ab open "/next-page"
```

**問題点**:
- 遅い環境では足りない
- 速い環境では無駄な待機時間
- テストが不安定になる

#### 3.2 タイムアウトなしの無限ループ

```bash
# 悪い例
while ! ab is visible '.success-message'; do
    sleep 0.5
done
```

**問題点**: 要素が表示されなければ永遠に待ち続ける。

#### 3.3 ローディング状態の無視

```bash
# 悪い例
ab open "/events"
ab click '.event-card'  # ローディング中にクリックしようとする
```

**問題点**: ローディング中に操作しようとして失敗する。

### 推奨される方法

```bash
# 良い例: wait_for_element で要素の出現を待機
ab click 'button[type="submit"]'
wait_for_element '.success-message' 10000  # 最大10秒待機

# 良い例: wait_for_page_load でローディング完了を確認
ab open "/events"
wait_for_page_load 10000
ab click '[data-testid^="event-card-"]'

# 良い例: URL変更を待機
ab click 'button[type="submit"]'
wait_for_url "/events/" 10000  # /events/ を含むURLになるまで待機

# 良い例: 条件付き待機 + 固定sleep のハイブリッド
wait_for_page_load 10000
sleep 0.5  # 描画安定化のための短いsleep
```

---

## 4. 認証関連

### やってはいけないこと

#### 4.1 クレデンシャルのハードコード

```bash
# 悪い例
EMAIL="test@example.com"
PASSWORD="password123"
```

**問題点**: セキュリティリスク、コードレビューやログに露出する。

#### 4.2 Cookie/セッションの共有

```bash
# 悪い例: 同じセッション名を複数テストで使用
E2E_SESSION="shared-session"
```

**問題点**: テスト間で状態が干渉し、不安定になる。

#### 4.3 Google OAuth（ポップアップ）の使用

```bash
# 悪い例
ab click 'text=Googleでログイン'
# ポップアップウィンドウを操作しようとする
```

**問題点**: ポップアップはheadlessブラウザで制御困難。

#### 4.4 .env.test.local のコミット

```bash
# 悪い例: クレデンシャルファイルをコミット
git add .env.test.local
git commit -m "Add test credentials"
```

**問題点**: セキュリティリスク、クレデンシャルの漏洩。

### 推奨される方法

```bash
# 良い例: 環境変数から読み込み
source "$PROJECT_ROOT/.env.test.local"
ab fill '#email' "$E2E_TEST_EMAIL"
ab fill '#password' "$E2E_TEST_PASSWORD"

# 良い例: セッション分離
SESSION_NAME="e2e-test-${TIMESTAMP}-$$"
export E2E_SESSION="$SESSION_NAME"

# 良い例: Email/Password認証を使用
ab open "${E2E_BASE_URL}/login"
ab fill '#email' "$E2E_TEST_EMAIL"
ab fill '#password' "$E2E_TEST_PASSWORD"
ab click 'button[type="submit"]'
```

---

## 5. テスト設計関連

### やってはいけないこと

#### 5.1 1つのテストに多くの検証を詰め込む

```bash
# 悪い例: 1つのテストで全機能をテスト
# create -> detail -> edit -> delete -> list 全部を1つのスクリプトで
```

**問題点**:
- どこで失敗したか特定しにくい
- 途中で失敗すると後続の検証がスキップされる
- メンテナンスが困難

#### 5.2 テスト間の暗黙的な依存

```bash
# 悪い例: create.sh が実行されていることを前提とする detail.sh
# detail.sh
EVENT_ID=$(cat "$STATE_DIR/last_created_event.txt")  # create.sh が作成したファイルに依存
```

**問題点**: テストを単独で実行できない。

#### 5.3 エラーハンドリングの欠如

```bash
# 悪い例
ab click 'button[type="submit"]'
# 失敗時の処理なし
```

**問題点**: 失敗原因の特定が困難、デバッグしにくい。

### 推奨される方法

```bash
# 良い例: 適切な粒度でテストを分割
# tests/feature/events/create.sh  - 作成のみ
# tests/feature/events/detail.sh  - 詳細表示のみ
# tests/feature/events/list.sh    - 一覧表示のみ

# 良い例: テスト内で必要なデータを自己完結で準備
if [[ -z "$EVENT_ID" ]]; then
    log_info "No stored event ID, creating new event..."
    # イベントを作成
fi

# 良い例: エラーハンドリング付き
if ab click 'button[type="submit"]' 2>/dev/null; then
    log_success "Form submitted"
else
    log_error "Failed to submit form"
    take_failure_screenshot "form-submit-failed"
    exit 1
fi
```

---

## 6. 出力・ログ関連

### やってはいけないこと

#### 6.1 テスト結果の無視

```bash
# 悪い例: エラーを握りつぶす
ab click 'button' 2>/dev/null || true
# 何が起きたかわからない
```

#### 6.2 過剰なログ出力

```bash
# 悪い例
ab is visible '.element'  # 標準出力に "true" が出力される
```

**問題点**: テスト結果が読みにくくなる。

### 推奨される方法

```bash
# 良い例: 適切な出力抑制
if ab is visible '.element' >/dev/null 2>&1; then
    log_success "Element visible"
else
    log_warn "Element not visible"
fi

# 良い例: 構造化されたログ
log_info "Starting test: $TEST_NAME"
log_success "Step completed"
log_warn "Non-critical issue"
log_error "Test failed"
```

---

## まとめ: チェックリスト

新しいテストを作成する前に、以下を確認してください：

- [ ] セレクターは `data-testid` または `aria-label` を使用しているか
- [ ] テストデータは `fixtures` から生成しているか
- [ ] 待機処理は `wait_for_*` 関数を使用しているか
- [ ] クレデンシャルは環境変数から読み込んでいるか
- [ ] テストは単独で実行可能か
- [ ] エラーハンドリングは適切か
- [ ] ログ出力は適切に抑制されているか

---

## 関連ドキュメント

- [E2E README](../README.md) - 全体概要と実行方法
- [メンテナンスガイド](./MAINTENANCE.md) - UI変更時の更新手順
