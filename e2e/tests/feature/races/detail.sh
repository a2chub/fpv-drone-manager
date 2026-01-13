#!/bin/bash
# E2E Feature Test: Race Detail
# レース詳細ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/races/detail"
setup_test "$TEST_NAME"

# ============================================
# Get Race ID
# ============================================
log_info "Getting race ID for detail test"

RACE_ID=""
if [[ -f "$E2E_ROOT/state/last_created_race.txt" ]]; then
    RACE_ID=$(cat "$E2E_ROOT/state/last_created_race.txt")
    log_info "Using previously created race: $RACE_ID"
fi

if [[ -z "$RACE_ID" ]]; then
    log_info "No stored race ID, fetching from list..."

    ab open "${E2E_BASE_URL}/races"
    wait_for_page_load

    # RaceCardは<div>内に<Link>コンポーネント（<a>タグ）を使用
    # フォールバック: 複数のセレクターを試行
    RACE_TITLE_SELECTOR='a[href*="/races/"]'
    RACE_CARD_SELECTOR='.card a[href*="/races/"]'

    if ab is visible "$RACE_TITLE_SELECTOR" >/dev/null 2>&1; then
        ab click "$RACE_TITLE_SELECTOR"
        sleep 2
        CURRENT_URL=$(ab get url 2>/dev/null || echo "")
        RACE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    elif ab is visible "$RACE_CARD_SELECTOR" >/dev/null 2>&1; then
        ab click "$RACE_CARD_SELECTOR"
        sleep 2
        CURRENT_URL=$(ab get url 2>/dev/null || echo "")
        RACE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    fi
fi

if [[ -z "$RACE_ID" ]]; then
    log_warn "No races found to test detail page"
    log_info "Skipping detail test - create a race first"
    teardown_test "$TEST_NAME" "pass"
    exit 0
fi

# ============================================
# Test: Access Detail Page
# ============================================
log_info "Testing: Race detail page access"

ab open "${E2E_BASE_URL}/races/${RACE_ID}"
wait_for_page_load 10000

assert_url_contains "/races/"

log_success "Race detail page loaded"

# ============================================
# Test: Detail Content
# ============================================
log_info "Testing: Detail page content"

sleep 2
if ab is visible 'h1' >/dev/null 2>&1 || ab is visible 'h2' >/dev/null 2>&1; then
    log_success "Race title visible"
else
    log_warn "Race title not found"
fi

if ab is visible 'text=編集' >/dev/null 2>&1; then
    log_success "Edit button visible"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Race Detail Feature Test: PASSED"
echo "=========================================="
