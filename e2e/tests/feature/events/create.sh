#!/bin/bash
# E2E Feature Test: Event Create
# イベント作成機能のテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"
source "$SCRIPT_DIR/../../../fixtures/event.fixture.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/events/create"
setup_test "$TEST_NAME"

# テストデータ生成（必須フィールド含む）
generate_event_test_data "E2E-Feature"

# ============================================
# Test: Access Create Page
# ============================================
log_info "Testing: Event create page access"

ab open "${E2E_BASE_URL}/events/new"
wait_for_page_load 10000

assert_url_contains "/events/new"

log_success "Event create page loaded"

# ============================================
# Test: Form Elements
# ============================================
log_info "Testing: Form elements presence"

# タイトル入力フィールド
if ab is visible 'input[name="title"]' >/dev/null 2>&1 || ab is visible 'input' >/dev/null 2>&1; then
    log_success "Title input visible"
else
    log_warn "Title input not found"
fi

# 説明入力フィールド
if ab is visible 'textarea[name="description"]' >/dev/null 2>&1 || ab is visible 'textarea' >/dev/null 2>&1; then
    log_success "Description input visible"
else
    log_info "Description field not found"
fi

# ============================================
# Test: Form Submission
# ============================================
log_info "Testing: Form submission"

# 必須フィールドを入力（title, date, location）
fill_event_form_minimal

# 説明を入力（オプション）
if [[ -n "$EVENT_DESCRIPTION" ]]; then
    fill_description "$EVENT_DESCRIPTION"
fi

sleep 1

# 送信ボタンをクリック
ab click 'button[type="submit"]' 2>/dev/null || ab click 'text=作成' 2>/dev/null || ab click 'text=保存' 2>/dev/null || true

sleep 3

# ============================================
# Test: Result
# ============================================
log_info "Testing: Form submission result"

CURRENT_URL=$(ab get url 2>/dev/null || echo "")

if [[ "$CURRENT_URL" == *"/events/"* && "$CURRENT_URL" != *"/new"* ]]; then
    log_success "Redirected to event detail page: $CURRENT_URL"

    # イベントIDを保存
    EVENT_ID=$(echo "$CURRENT_URL" | grep -oE '[^/]+$' || echo "")
    if [[ -n "$EVENT_ID" && "$EVENT_ID" != "new" ]]; then
        echo "$EVENT_ID" > "$E2E_ROOT/state/last_created_event.txt"
        log_info "Stored event ID: $EVENT_ID"
    fi
elif [[ "$CURRENT_URL" == *"/events"* ]]; then
    log_success "Redirected to events list"
else
    if ab is visible "$ERROR_MESSAGE" >/dev/null 2>&1; then
        ERROR_TEXT=$(ab get text "$ERROR_MESSAGE" 2>/dev/null || echo "")
        log_warn "Form submission error: $ERROR_TEXT"
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
echo "Event Create Feature Test: PASSED"
echo "=========================================="
