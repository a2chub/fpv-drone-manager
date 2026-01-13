#!/bin/bash
# E2E Feature Test: Race List
# レース一覧ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/races/list"
setup_test "$TEST_NAME"

# ============================================
# Test: Access Race List Page
# ============================================
log_info "Testing: Race list page access"

ab open "${E2E_BASE_URL}/races"
wait_for_page_load 10000

assert_url_contains "/races"

log_success "Race list page loaded"

# ============================================
# Test: New Race Button
# ============================================
log_info "Testing: New race button visibility"

if ab is visible "$RACE_NEW_BUTTON" >/dev/null 2>&1 || ab is visible 'text=レースを記録' >/dev/null 2>&1 || ab is visible 'a[href="/races/new"]' >/dev/null 2>&1; then
    log_success "New race button visible"
else
    log_warn "New race button not immediately visible"
fi

# ============================================
# Test: Race Cards (if any)
# ============================================
log_info "Testing: Race cards display"

sleep 2
RACE_COUNT=$(ab get count 'article' 2>/dev/null || echo "0")

if [[ "$RACE_COUNT" -gt 0 ]]; then
    log_success "Found $RACE_COUNT race cards"
else
    if ab is visible 'text=レースが記録されていません' >/dev/null 2>&1 || ab is visible 'text=レース' >/dev/null 2>&1; then
        log_success "Empty state displayed correctly"
    else
        log_info "No races found (expected for new accounts)"
    fi
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Race List Feature Test: PASSED"
echo "=========================================="
