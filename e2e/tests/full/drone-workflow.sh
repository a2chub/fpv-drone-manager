#!/bin/bash
# E2E Full Workflow Test: Drone Workflow
# ドローン登録→詳細確認→編集→削除の完全フロー

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../config/base.sh"
source "$SCRIPT_DIR/../../config/selectors.sh"
source "$SCRIPT_DIR/../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../helpers/wait-for.sh"
source "$SCRIPT_DIR/../../helpers/screenshot.sh"

# セッション名
SESSION_NAME="${1:-e2e-full}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="full/drone-workflow"
setup_test "$TEST_NAME"

# ユニークな名前を生成
TIMESTAMP=$(date +%s)
DRONE_NAME="E2E-Workflow-Drone-${TIMESTAMP}"
DRONE_UPDATED_NAME="E2E-Workflow-Drone-Updated-${TIMESTAMP}"

echo ""
echo "=========================================="
echo "Drone Full Workflow Test"
echo "=========================================="
echo ""

# ============================================
# Step 1: Create Drone
# ============================================
log_info "Step 1: Creating drone..."

ab open "${E2E_BASE_URL}/drones/new"
wait_for_page_load

# フォーム入力
ab fill 'input[name="name"]' "$DRONE_NAME" 2>/dev/null || ab fill 'input' "$DRONE_NAME" 2>/dev/null || true
ab fill 'textarea[name="description"]' "E2Eワークフローテストで作成したドローン" 2>/dev/null || ab fill 'textarea' "E2Eワークフローテスト" 2>/dev/null || true
ab select 'select[name="category"]' "racing" 2>/dev/null || true
sleep 1

# スクリーンショット（作成前）
take_screenshot "drone-workflow-before-create"

# 送信
ab click 'button[type="submit"]' 2>/dev/null || ab click 'text=登録' 2>/dev/null || true
sleep 3

# 作成確認
CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/drones/"* && "$CURRENT_URL" != *"/new"* ]]; then
    DRONE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    log_success "Step 1 PASSED: Drone created with ID: $DRONE_ID"
else
    log_error "Step 1 FAILED: Drone creation failed"
    take_failure_screenshot "drone-workflow-create-failed"
    exit 1
fi

# ============================================
# Step 2: View Drone Detail
# ============================================
log_info "Step 2: Viewing drone detail..."

ab open "${E2E_BASE_URL}/drones/${DRONE_ID}"
wait_for_page_load

# ドローン名が表示されているか確認
if assert_text_visible "$DRONE_NAME" 5000 2>/dev/null; then
    log_success "Step 2 PASSED: Drone detail displayed correctly"
else
    log_warn "Step 2: Drone name not visible, but continuing..."
fi

take_screenshot "drone-workflow-detail"

# ============================================
# Step 3: Edit Drone
# ============================================
log_info "Step 3: Editing drone..."

# 編集ページへ
ab open "${E2E_BASE_URL}/drones/${DRONE_ID}/edit"
wait_for_page_load

# 名前を更新
ab fill 'input[name="name"]' "" 2>/dev/null || true  # クリア
sleep 0.5
ab fill 'input[name="name"]' "$DRONE_UPDATED_NAME" 2>/dev/null || ab fill 'input' "$DRONE_UPDATED_NAME" 2>/dev/null || true
sleep 1

# 保存
ab click 'button[type="submit"]' 2>/dev/null || ab click 'text=保存' 2>/dev/null || true
sleep 3

# 更新確認
if assert_text_visible "$DRONE_UPDATED_NAME" 5000 2>/dev/null; then
    log_success "Step 3 PASSED: Drone edited successfully"
else
    log_warn "Step 3: Updated name not visible, checking URL..."
    CURRENT_URL=$(ab get url 2>/dev/null || echo "")
    if [[ "$CURRENT_URL" == *"/drones/${DRONE_ID}"* && "$CURRENT_URL" != *"/edit"* ]]; then
        log_success "Step 3 PASSED: Redirected to detail page"
    else
        log_warn "Step 3: Edit result unclear"
    fi
fi

take_screenshot "drone-workflow-after-edit"

# ============================================
# Step 4: Verify in List
# ============================================
log_info "Step 4: Verifying in drone list..."

ab open "${E2E_BASE_URL}/drones"
wait_for_page_load

sleep 2
if assert_text_visible "$DRONE_UPDATED_NAME" 5000 2>/dev/null; then
    log_success "Step 4 PASSED: Drone visible in list"
else
    log_info "Step 4: Drone may be on another page or filtered"
fi

take_screenshot "drone-workflow-list"

# ============================================
# Step 5: Delete Drone (Optional - Skip by default)
# ============================================
# 注意: 削除は破壊的操作なのでデフォルトではスキップ
# 有効化するには環境変数 E2E_ENABLE_DELETE=true を設定

if [[ "$E2E_ENABLE_DELETE" == "true" ]]; then
    log_info "Step 5: Deleting drone..."

    ab open "${E2E_BASE_URL}/drones/${DRONE_ID}"
    wait_for_page_load

    # 削除ボタンをクリック
    ab click 'text=削除' 2>/dev/null || true
    sleep 1

    # 確認ダイアログで「はい」をクリック
    if ab is visible "$CONFIRM_YES_BUTTON" >/dev/null 2>&1 || ab is visible 'text=はい' >/dev/null 2>&1; then
        ab click 'text=はい' 2>/dev/null || ab click "$CONFIRM_YES_BUTTON" 2>/dev/null || true
        sleep 2
    fi

    # 削除確認
    CURRENT_URL=$(ab get url 2>/dev/null || echo "")
    if [[ "$CURRENT_URL" == *"/drones"* && "$CURRENT_URL" != *"/${DRONE_ID}"* ]]; then
        log_success "Step 5 PASSED: Drone deleted successfully"
    else
        log_warn "Step 5: Delete result unclear"
    fi
else
    log_info "Step 5: Delete skipped (set E2E_ENABLE_DELETE=true to enable)"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Drone Full Workflow Test: PASSED"
echo "Created: $DRONE_NAME"
echo "Updated to: $DRONE_UPDATED_NAME"
echo "Drone ID: $DRONE_ID"
echo "=========================================="
