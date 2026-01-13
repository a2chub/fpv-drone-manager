# E2Eテスト メンテナンスガイド

このドキュメントでは、UI変更時にE2Eテストを更新する手順を説明します。

## 設計方針

E2Eテストは以下の原則で設計されています：

1. **設定の一元管理**: UI依存の設定は特定のファイルに集約
2. **フォールバック対応**: セレクターは複数の候補を試行
3. **macOS/Linux互換**: 両環境で動作するシェルスクリプト

## ディレクトリ構造

```
e2e/
├── config/
│   ├── base.sh          # 環境設定・共通変数
│   ├── selectors.sh     # CSSセレクター定義
│   └── forms.sh         # フォームフィールド定義
├── fixtures/
│   ├── event.fixture.sh # イベントテストデータ
│   ├── race.fixture.sh  # レーステストデータ
│   ├── drone.fixture.sh # ドローンテストデータ
│   └── part.fixture.sh  # パーツテストデータ
├── helpers/
│   ├── assertions.sh    # アサーション関数
│   ├── wait-for.sh      # 待機関数
│   ├── form-helpers.sh  # フォーム操作関数
│   └── screenshot.sh    # スクリーンショット
└── tests/
    ├── smoke/           # スモークテスト
    ├── feature/         # 機能テスト
    └── full/            # フルワークフローテスト
```

---

## UI変更時の更新手順

### 1. フォームフィールドが変更された場合

**対象ファイル**: `e2e/config/forms.sh`

#### フィールド追加

```bash
# 例: イベントフォームに maxParticipants フィールド追加
EVENT_FORM_OPTIONAL_FIELDS=(
    ...
    "maxParticipants:number:最大参加者数"  # 追加
)
```

#### フィールド削除

該当行を削除するだけでOK。テストは存在しないフィールドをスキップします。

#### 必須フィールド変更

`*_FORM_REQUIRED_FIELDS` 配列を更新し、対応するfixture/テストデータも更新してください。

### 2. セレクターが変更された場合

**対象ファイル**: `e2e/config/selectors.sh`

#### セレクター更新例

```bash
# 変更前
EVENT_CARD='.event-card'

# 変更後（data-testid導入時）
EVENT_CARD_PRIMARY='[data-testid^="event-card-"]'
EVENT_CARD_FALLBACK='.card'
EVENT_CARD="${EVENT_CARD_PRIMARY}"
```

#### フォールバック設定

新旧UIの移行期間中は、フォールバックセレクターを設定しておくと安全です。

### 3. テストデータを変更したい場合

**対象ファイル**: `e2e/fixtures/{entity}.fixture.sh`

各エンティティ（event, race, drone, part）に対応するfixtureファイルがあります。

```bash
# e2e/fixtures/event.fixture.sh
generate_event_test_data() {
    EVENT_TITLE=$(generate_test_name "E2E-Test" "Event")
    EVENT_DATE=$(generate_future_date 7 "14:00")
    EVENT_LOCATION="東京都渋谷区テスト会場"  # この値を変更
    ...
}
```

---

## セレクター優先順位

テストで使用するセレクターは以下の優先順位で選択します：

1. **data-testid** (最も安定) - `[data-testid="event-card"]`
2. **aria-label** (アクセシビリティ) - `[aria-label="ユーザーメニュー"]`
3. **特定のクラス名** (CSS) - `.event-card`
4. **HTML構造** (最も脆弱) - `div > a.card`

新しいUIコンポーネントを作成する際は、`data-testid` 属性の追加を推奨します。

---

## 定期メンテナンスチェックリスト

### 週次

- [ ] スモークテスト (`npm run e2e:smoke`) が通ることを確認
- [ ] 失敗したテストの原因調査

### 月次

- [ ] 必須フィールドの変更確認 (forms.sh vs 実装)
- [ ] セレクターの動作確認 (selectors.sh vs UI)
- [ ] テストデータの妥当性確認

### リリース前

- [ ] フル機能テスト (`npm run e2e:feature`)
- [ ] ワークフローテスト (`npm run e2e:full`)
- [ ] 新規ページ/機能のテスト追加

---

## トラブルシューティング

### テストが失敗する場合

1. **セレクターの確認**
   ```bash
   # ブラウザを表示して確認
   npm run e2e:headed
   ```

2. **スクリーンショット確認**
   ```bash
   ls -la e2e/results/
   open e2e/results/failure_*.png
   ```

3. **デバッグログ確認**
   テスト実行時のログで `[WARN]` や `[FAIL]` を探します。

### フォーム入力が効かない場合

1. セレクターが正しいか確認
2. フィールドのid/name属性が変更されていないか確認
3. `forms.sh` の定義と実装が一致しているか確認

### ローディングが終わらない場合

1. `wait_for_page_load` のタイムアウトを延長
2. ローディングスピナーのセレクターが正しいか確認
3. ネットワーク遅延が原因の場合は固定sleep追加

---

## 新機能追加時のテスト作成手順

1. **fixture作成**: `e2e/fixtures/{entity}.fixture.sh` にテストデータ生成関数を追加
2. **セレクター追加**: `e2e/config/selectors.sh` に必要なセレクターを追加
3. **テストスクリプト作成**: `e2e/tests/feature/{category}/` に新しいテストを作成
4. **forms.sh更新**: 新しいフォームがある場合は定義を追加

---

## テスト追加時のチェックリスト

新しいテストを追加する際は、以下の項目を確認してください：

### 必須チェック項目

- [ ] **fixtures を使用しているか**
  - テストデータは `e2e/fixtures/*.fixture.sh` から生成する
  - ハードコードされた固定値を避ける

- [ ] **セレクターは selectors.sh で定義されているか**
  - 新しいセレクターは `e2e/config/selectors.sh` に追加
  - `data-testid` を優先、フォールバックも設定

- [ ] **適切な待機処理があるか**
  - `wait_for_page_load` でページ読み込み完了を待機
  - `wait_for_element` で要素の出現を待機
  - 固定 `sleep` のみに依存しない

- [ ] **エラーハンドリングがあるか**
  - 失敗時にスクリーンショットを保存
  - 適切なログ出力

- [ ] **テストは単独で実行可能か**
  - 他のテストに依存しない
  - 必要なデータはテスト内で準備

### レビュー時の確認ポイント

1. **セレクターの安定性**
   - CSSクラス名のみに依存していないか
   - HTML構造に依存していないか

2. **テストデータの独立性**
   - `E2E-` プレフィックスが付いているか
   - タイムスタンプでユニーク化されているか

3. **待機処理の適切性**
   - タイムアウト値は適切か（通常10000ms）
   - 無限ループになる可能性はないか

---

## よくある失敗パターンと解決策

### パターン1: セレクターが見つからない

**症状**: `Element not found: .event-card`

**原因と解決策**:
| 原因 | 解決策 |
|------|--------|
| クラス名が変更された | `data-testid` を使用する |
| 要素がまだ読み込まれていない | `wait_for_element` を追加 |
| 要素が画面外にある | スクロール処理を追加 |

### パターン2: フォーム送信が失敗する

**症状**: フォーム送信後にページ遷移しない

**原因と解決策**:
| 原因 | 解決策 |
|------|--------|
| 必須フィールドが未入力 | `forms.sh` の定義を確認 |
| バリデーションエラー | エラーメッセージを確認 |
| ボタンがdisabled | 待機処理を追加 |

### パターン3: 認証エラー

**症状**: `Login failed` または `/login` にリダイレクト

**原因と解決策**:
| 原因 | 解決策 |
|------|--------|
| Cookie が期限切れ | `rm -rf e2e/state/*` で再認証 |
| クレデンシャルが間違っている | `.env.test.local` を確認 |
| セッション競合 | セッション名をユニークに |

### パターン4: テストが不安定（Flaky）

**症状**: 同じテストが時々成功、時々失敗

**原因と解決策**:
| 原因 | 解決策 |
|------|--------|
| 待機時間が不足 | タイムアウトを延長 |
| 非同期処理の競合 | `wait_for_dom_stable` を追加 |
| テスト間の状態干渉 | セッションを分離 |

---

## テストシナリオ修正の手順

### 1. 問題の特定

```bash
# headedモードで実行して動作を確認
npm run e2e:headed

# スクリーンショットを確認
ls -la e2e/results/
open e2e/results/failure_*.png
```

### 2. 修正対象の特定

| 問題の種類 | 修正対象ファイル |
|-----------|-----------------|
| セレクター変更 | `e2e/config/selectors.sh` |
| フィールド変更 | `e2e/config/forms.sh` |
| テストデータ変更 | `e2e/fixtures/*.fixture.sh` |
| テストロジック変更 | `e2e/tests/**/*.sh` |

### 3. 修正と検証

```bash
# 修正後、該当テストを実行
npm run e2e:smoke     # スモークテスト
npm run e2e:feature   # 機能テスト
npm run e2e:full      # フルワークフロー

# 全テスト実行
npm run e2e all
```

---

## 関連ドキュメント

- [E2E README](../README.md) - 全体概要と実行方法
- [アンチパターン集](./ANTI-PATTERNS.md) - やってはいけないこと
- [agent-browser](https://github.com/vercel-labs/agent-browser) - 使用しているE2Eツール
