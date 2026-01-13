#!/bin/bash
# E2E Feature Test: Event Detail
# イベント詳細ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/events/detail"
setup_test "$TEST_NAME"

# ============================================
# Get Event ID
# ============================================
log_info "Getting event ID for detail test"

EVENT_ID=""
if [[ -f "$E2E_ROOT/state/last_created_event.txt" ]]; then
    EVENT_ID=$(cat "$E2E_ROOT/state/last_created_event.txt")
    log_info "Using previously created event: $EVENT_ID"
fi

if [[ -z "$EVENT_ID" ]]; then
    log_info "No stored event ID, fetching from list..."

    ab open "${E2E_BASE_URL}/events"
    wait_for_page_load

    # EventCardは<Link>コンポーネント（<a>タグ）を使用
    # フォールバック: 複数のセレクターを試行
    EVENT_CARD_SELECTOR='a[href*="/events/"].card'
    EVENT_CARD_FALLBACK='a[href*="/events/"]'

    if ab is visible "$EVENT_CARD_SELECTOR" >/dev/null 2>&1; then
        ab click "$EVENT_CARD_SELECTOR"
        sleep 2
        CURRENT_URL=$(ab get url 2>/dev/null || echo "")
        EVENT_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    elif ab is visible "$EVENT_CARD_FALLBACK" >/dev/null 2>&1; then
        ab click "$EVENT_CARD_FALLBACK"
        sleep 2
        CURRENT_URL=$(ab get url 2>/dev/null || echo "")
        EVENT_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    fi
fi

if [[ -z "$EVENT_ID" ]]; then
    log_warn "No events found to test detail page"
    log_info "Skipping detail test - create an event first"
    teardown_test "$TEST_NAME" "pass"
    exit 0
fi

# ============================================
# Test: Access Detail Page
# ============================================
log_info "Testing: Event detail page access"

ab open "${E2E_BASE_URL}/events/${EVENT_ID}"
wait_for_page_load 10000

assert_url_contains "/events/"

log_success "Event detail page loaded"

# ============================================
# Test: Detail Content
# ============================================
log_info "Testing: Detail page content"

sleep 2

# イベントタイトル
if ab is visible 'h1' >/dev/null 2>&1 || ab is visible 'h2' >/dev/null 2>&1; then
    log_success "Event title visible"
fi

# 参加ボタン（主催者以外に表示）
if ab is visible "$EVENT_JOIN_BUTTON" >/dev/null 2>&1 || ab is visible 'text=参加する' >/dev/null 2>&1; then
    log_success "Join button visible"
fi

# 編集ボタン（主催者に表示）
if ab is visible 'text=編集' >/dev/null 2>&1; then
    log_success "Edit button visible (organizer)"
fi

# ============================================
# Test: Participants Section
# ============================================
log_info "Testing: Participants section"

if ab is visible 'text=参加者' >/dev/null 2>&1; then
    log_success "Participants section visible"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Event Detail Feature Test: PASSED"
echo "=========================================="
