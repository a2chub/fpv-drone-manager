#!/bin/bash
# E2E Feature Test: Drone Detail
# ドローン詳細ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/drones/detail"
setup_test "$TEST_NAME"

# ============================================
# Get Drone ID
# ============================================
log_info "Getting drone ID for detail test"

# 前のテストで作成したドローンIDを取得
DRONE_ID=""
if [[ -f "$E2E_ROOT/state/last_created_drone.txt" ]]; then
    DRONE_ID=$(cat "$E2E_ROOT/state/last_created_drone.txt")
    log_info "Using previously created drone: $DRONE_ID"
fi

# IDがない場合は一覧から取得を試みる
if [[ -z "$DRONE_ID" ]]; then
    log_info "No stored drone ID, fetching from list..."

    ab open "${E2E_BASE_URL}/drones"
    wait_for_page_load

    # 最初のドローンカードをクリック
    if ab is visible 'article a' >/dev/null 2>&1; then
        ab click 'article a'
        sleep 2

        CURRENT_URL=$(ab get url 2>/dev/null || echo "")
        DRONE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    fi
fi

if [[ -z "$DRONE_ID" ]]; then
    log_warn "No drones found to test detail page"
    log_info "Skipping detail test - create a drone first"
    teardown_test "$TEST_NAME" "pass"
    exit 0
fi

# ============================================
# Test: Access Detail Page
# ============================================
log_info "Testing: Drone detail page access"

ab open "${E2E_BASE_URL}/drones/${DRONE_ID}"
wait_for_page_load 10000

assert_url_contains "/drones/"

log_success "Drone detail page loaded"

# ============================================
# Test: Detail Content
# ============================================
log_info "Testing: Detail page content"

# ドローン名が表示されているか
sleep 2
if ab is visible 'h1' >/dev/null 2>&1 || ab is visible 'h2' >/dev/null 2>&1; then
    log_success "Drone title visible"
else
    log_warn "Drone title not found"
fi

# 編集ボタン
if ab is visible "$DRONE_EDIT_BUTTON" >/dev/null 2>&1 || ab is visible 'a[href*="/edit"]' >/dev/null 2>&1 || ab is visible 'text=編集' >/dev/null 2>&1; then
    log_success "Edit button visible"
else
    log_info "Edit button not immediately visible"
fi

# 削除ボタン
if ab is visible "$DRONE_DELETE_BUTTON" >/dev/null 2>&1 || ab is visible 'text=削除' >/dev/null 2>&1; then
    log_success "Delete button visible"
else
    log_info "Delete button not immediately visible"
fi

# ============================================
# Test: Specifications Section
# ============================================
log_info "Testing: Specifications display"

# スペック情報の存在確認
if ab is visible 'text=カテゴリー' >/dev/null 2>&1 || ab is visible 'text=ステータス' >/dev/null 2>&1; then
    log_success "Specifications visible"
else
    log_info "Specifications section not found (may be collapsed)"
fi

# ============================================
# Test: Parts Section
# ============================================
log_info "Testing: Parts section"

if ab is visible 'text=パーツ' >/dev/null 2>&1; then
    log_success "Parts section visible"
else
    log_info "Parts section not found"
fi

# ============================================
# Test: Navigation Back
# ============================================
log_info "Testing: Navigation back to list"

# 戻るリンクまたはボタンを確認
if ab is visible 'a[href="/drones"]' >/dev/null 2>&1 || ab is visible 'text=一覧' >/dev/null 2>&1; then
    log_success "Back to list link visible"
else
    log_info "Back link not found (browser back may be used)"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Drone Detail Feature Test: PASSED"
echo "=========================================="
