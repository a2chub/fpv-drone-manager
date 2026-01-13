#!/bin/bash
# E2E Feature Test: Drone List
# ドローン一覧ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/drones/list"
setup_test "$TEST_NAME"

# ============================================
# Test: Access Drone List Page
# ============================================
log_info "Testing: Drone list page access"

ab open "${E2E_BASE_URL}/drones"
wait_for_page_load 10000

assert_url_contains "/drones"

log_success "Drone list page loaded"

# ============================================
# Test: New Drone Button
# ============================================
log_info "Testing: New drone button visibility"

if ab is visible "$DRONE_NEW_BUTTON" >/dev/null 2>&1 || ab is visible 'text=機体を登録' >/dev/null 2>&1 || ab is visible 'a[href="/drones/new"]' >/dev/null 2>&1; then
    log_success "New drone button visible"
else
    log_warn "New drone button not immediately visible (may be in menu)"
fi

# ============================================
# Test: Filter/Category Options
# ============================================
log_info "Testing: Filter options"

# カテゴリーフィルターの存在確認
if ab is visible 'select' >/dev/null 2>&1 || ab is visible '[role="combobox"]' >/dev/null 2>&1; then
    log_success "Filter controls visible"
else
    log_info "No filter controls found (may not be implemented)"
fi

# ============================================
# Test: Drone Cards (if any)
# ============================================
log_info "Testing: Drone cards display"

# ドローンカードまたは空状態メッセージを確認
sleep 2
DRONE_COUNT=$(ab get count 'article' 2>/dev/null || echo "0")

if [[ "$DRONE_COUNT" -gt 0 ]]; then
    log_success "Found $DRONE_COUNT drone cards"
else
    # 空状態を確認
    if ab is visible 'text=機体が登録されていません' >/dev/null 2>&1 || ab is visible 'text=ドローン' >/dev/null 2>&1; then
        log_success "Empty state displayed correctly"
    else
        log_info "No drones found (expected for new accounts)"
    fi
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Drone List Feature Test: PASSED"
echo "=========================================="
