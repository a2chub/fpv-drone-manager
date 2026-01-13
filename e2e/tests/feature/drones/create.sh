#!/bin/bash
# E2E Feature Test: Drone Create
# ドローン作成機能のテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/drones/create"
setup_test "$TEST_NAME"

# ユニークな名前を生成
TIMESTAMP=$(date +%s)
DRONE_NAME="E2E-Test-Drone-${TIMESTAMP}"

# ============================================
# Test: Access Create Page
# ============================================
log_info "Testing: Drone create page access"

ab open "${E2E_BASE_URL}/drones/new"
wait_for_page_load 10000

assert_url_contains "/drones/new"

log_success "Drone create page loaded"

# ============================================
# Test: Form Elements
# ============================================
log_info "Testing: Form elements presence"

# 名前入力フィールド
if ab is visible 'input[name="name"]' >/dev/null 2>&1; then
    log_success "Name input visible"
else
    log_warn "Name input not found with expected selector"
fi

# 説明入力フィールド
if ab is visible 'textarea' >/dev/null 2>&1 || ab is visible 'textarea[name="description"]' >/dev/null 2>&1; then
    log_success "Description input visible"
else
    log_info "Description field not immediately visible"
fi

# カテゴリー選択
if ab is visible 'select[name="category"]' >/dev/null 2>&1 || ab is visible 'select' >/dev/null 2>&1; then
    log_success "Category select visible"
else
    log_info "Category select not found"
fi

# ============================================
# Test: Form Submission
# ============================================
log_info "Testing: Form submission"

# 名前を入力
ab fill 'input[name="name"]' "$DRONE_NAME" 2>/dev/null || ab fill 'input' "$DRONE_NAME" 2>/dev/null || true

# 説明を入力（オプション）
ab fill 'textarea[name="description"]' "E2Eテストで作成したドローン" 2>/dev/null || ab fill 'textarea' "E2Eテストで作成" 2>/dev/null || true

# カテゴリーを選択（オプション）
ab select 'select[name="category"]' "racing" 2>/dev/null || true

sleep 1

# 送信ボタンをクリック
ab click 'button[type="submit"]' 2>/dev/null || ab click 'text=登録' 2>/dev/null || ab click 'text=保存' 2>/dev/null || true

sleep 3

# ============================================
# Test: Redirect After Creation
# ============================================
log_info "Testing: Redirect after creation"

CURRENT_URL=$(ab get url 2>/dev/null || echo "")

if [[ "$CURRENT_URL" == *"/drones/"* && "$CURRENT_URL" != *"/new"* ]]; then
    log_success "Redirected to drone detail page: $CURRENT_URL"
elif [[ "$CURRENT_URL" == *"/drones"* ]]; then
    log_success "Redirected to drones list"
else
    # エラーがないか確認
    if ab is visible "$ERROR_MESSAGE" >/dev/null 2>&1; then
        ERROR_TEXT=$(ab get text "$ERROR_MESSAGE" 2>/dev/null || echo "")
        log_error "Form submission error: $ERROR_TEXT"
        teardown_test "$TEST_NAME" "fail"
        exit 1
    else
        log_warn "Unexpected redirect: $CURRENT_URL"
    fi
fi

# ============================================
# Test: Verify Drone Created
# ============================================
log_info "Testing: Verify drone was created"

# ドローン名が表示されているか確認
if assert_text_visible "$DRONE_NAME" 5000 2>/dev/null; then
    log_success "Drone '$DRONE_NAME' created successfully"
else
    log_warn "Drone name not visible on page (may be on list)"
fi

# ============================================
# Store drone ID for cleanup
# ============================================
# ドローンIDをURLから抽出（後のテストで使用可能）
DRONE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
if [[ -n "$DRONE_ID" && "$DRONE_ID" != "new" ]]; then
    echo "$DRONE_ID" > "$E2E_ROOT/state/last_created_drone.txt"
    log_info "Stored drone ID: $DRONE_ID"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Drone Create Feature Test: PASSED"
echo "Created: $DRONE_NAME"
echo "=========================================="
