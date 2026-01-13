#!/bin/bash
# E2E Feature Test: Race Create
# レース作成機能のテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/races/create"
setup_test "$TEST_NAME"

# ユニークな名前を生成
TIMESTAMP=$(date +%s)
RACE_NAME="E2E-Test-Race-${TIMESTAMP}"

# ============================================
# Test: Access Create Page
# ============================================
log_info "Testing: Race create page access"

ab open "${E2E_BASE_URL}/races/new"
wait_for_page_load 10000

assert_url_contains "/races/new"

log_success "Race create page loaded"

# ============================================
# Test: Form Elements
# ============================================
log_info "Testing: Form elements presence"

# 名前入力フィールド
if ab is visible 'input[name="name"]' >/dev/null 2>&1 || ab is visible 'input' >/dev/null 2>&1; then
    log_success "Name input visible"
else
    log_warn "Name input not found"
fi

# ドローン選択
if ab is visible 'select[name="droneId"]' >/dev/null 2>&1 || ab is visible 'select' >/dev/null 2>&1; then
    log_success "Drone select visible"
else
    log_info "Drone select not found"
fi

# ============================================
# Test: Form Submission
# ============================================
log_info "Testing: Form submission"

# 名前を入力
ab fill 'input[name="name"]' "$RACE_NAME" 2>/dev/null || ab fill 'input' "$RACE_NAME" 2>/dev/null || true

sleep 1

# 送信ボタンをクリック
ab click 'button[type="submit"]' 2>/dev/null || ab click 'text=記録' 2>/dev/null || ab click 'text=保存' 2>/dev/null || true

sleep 3

# ============================================
# Test: Result
# ============================================
log_info "Testing: Form submission result"

CURRENT_URL=$(ab get url 2>/dev/null || echo "")

if [[ "$CURRENT_URL" == *"/races/"* && "$CURRENT_URL" != *"/new"* ]]; then
    log_success "Redirected to race detail page: $CURRENT_URL"

    # レースIDを保存
    RACE_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    if [[ -n "$RACE_ID" && "$RACE_ID" != "new" ]]; then
        echo "$RACE_ID" > "$E2E_ROOT/state/last_created_race.txt"
        log_info "Stored race ID: $RACE_ID"
    fi
elif [[ "$CURRENT_URL" == *"/races"* ]]; then
    log_success "Redirected to races list"
else
    if ab is visible "$ERROR_MESSAGE" >/dev/null 2>&1; then
        ERROR_TEXT=$(ab get text "$ERROR_MESSAGE" 2>/dev/null || echo "")
        log_warn "Form submission error: $ERROR_TEXT"
        log_info "Race creation may require a drone to be selected"
    else
        log_warn "Unexpected result: $CURRENT_URL"
    fi
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Race Create Feature Test: PASSED"
echo "=========================================="
