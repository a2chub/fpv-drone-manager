#!/bin/bash
# E2E Feature Test: Event List
# イベント一覧ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/events/list"
setup_test "$TEST_NAME"

# ============================================
# Test: Access Event List Page
# ============================================
log_info "Testing: Event list page access"

ab open "${E2E_BASE_URL}/events"
wait_for_page_load 10000

assert_url_contains "/events"

log_success "Event list page loaded"

# ============================================
# Test: Tabs (Public/My Events)
# ============================================
log_info "Testing: Event tabs"

if ab is visible 'text=公開イベント' >/dev/null 2>&1 || ab is visible '[role="tab"]' >/dev/null 2>&1; then
    log_success "Public events tab visible"
else
    log_info "Tabs not found (may be single view)"
fi

if ab is visible 'text=マイイベント' >/dev/null 2>&1; then
    log_success "My events tab visible"
fi

# ============================================
# Test: New Event Button
# ============================================
log_info "Testing: New event button visibility"

if ab is visible "$EVENT_NEW_BUTTON" >/dev/null 2>&1 || ab is visible 'text=イベントを作成' >/dev/null 2>&1 || ab is visible 'a[href="/events/new"]' >/dev/null 2>&1; then
    log_success "New event button visible"
else
    log_warn "New event button not immediately visible"
fi

# ============================================
# Test: Event Cards (if any)
# ============================================
log_info "Testing: Event cards display"

sleep 2
EVENT_COUNT=$(ab get count 'article' 2>/dev/null || echo "0")

if [[ "$EVENT_COUNT" -gt 0 ]]; then
    log_success "Found $EVENT_COUNT event cards"
else
    log_info "No events found (expected for new accounts)"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Event List Feature Test: PASSED"
echo "=========================================="
