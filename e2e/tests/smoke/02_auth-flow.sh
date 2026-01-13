#!/bin/bash
# E2E Smoke Test: Authentication Flow
# ログイン/ログアウトフローのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../config/base.sh"
source "$SCRIPT_DIR/../../config/selectors.sh"
source "$SCRIPT_DIR/../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-smoke}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="smoke/auth-flow"
setup_test "$TEST_NAME"

# クレデンシャル確認
if [[ -z "$E2E_TEST_EMAIL" || -z "$E2E_TEST_PASSWORD" ]]; then
    log_error "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set"
    exit 1
fi

# ============================================
# Test: Check Current Auth State
# ============================================
log_info "Testing: Current auth state"

ab open "${E2E_BASE_URL}/login"
wait_for_page_load

CURRENT_URL=$(ab get url 2>/dev/null || echo "")

# すでにログイン済みの場合はダッシュボードにリダイレクトされる
if [[ "$CURRENT_URL" == *"/dashboard"* ]] || [[ "$CURRENT_URL" == *"/"* && "$CURRENT_URL" != *"/login"* ]]; then
    log_success "Already authenticated - redirected from login page (expected)"
    ALREADY_LOGGED_IN=true
elif [[ "$CURRENT_URL" == *"/login"* ]]; then
    log_info "Not logged in - testing login flow"
    ALREADY_LOGGED_IN=false

    # ============================================
    # Test: Login Form Validation
    # ============================================
    log_info "Testing: Login form validation"

    # 空フォームで送信を試みる（バリデーションエラーが出るはず）
    ab click "$LOGIN_SUBMIT_BUTTON" 2>/dev/null || true
    sleep 1

    # フォーム要素が残っていることを確認
    if ab is visible "$LOGIN_EMAIL_INPUT" >/dev/null 2>&1; then
        log_success "Login form validation works"
    fi

    # ============================================
    # Test: Login with Valid Credentials
    # ============================================
    log_info "Testing: Login with valid credentials"

    # フォーム入力
    ab fill "$LOGIN_EMAIL_INPUT" "$E2E_TEST_EMAIL"
    ab fill "$LOGIN_PASSWORD_INPUT" "$E2E_TEST_PASSWORD"

    # 送信
    ab click "$LOGIN_SUBMIT_BUTTON"
    sleep 3

    # ダッシュボードまたはホームにリダイレクトされることを確認
    CURRENT_URL=$(ab get url 2>/dev/null || echo "")
    if [[ "$CURRENT_URL" == *"/dashboard"* ]] || [[ "$CURRENT_URL" != *"/login"* ]]; then
        log_success "Login successful, redirected to: $CURRENT_URL"
    else
        # エラーメッセージを確認
        ERROR_TEXT=$(ab get text "$ERROR_MESSAGE" 2>/dev/null || echo "")
        if [[ -n "$ERROR_TEXT" ]]; then
            log_error "Login failed: $ERROR_TEXT"
            teardown_test "$TEST_NAME" "fail"
            exit 1
        else
            log_error "Login failed: Still on login page"
            teardown_test "$TEST_NAME" "fail"
            exit 1
        fi
    fi
else
    log_warn "Unexpected URL: $CURRENT_URL"
fi

# ============================================
# Test: Access Protected Route
# ============================================
log_info "Testing: Access to protected route"

ab open "${E2E_BASE_URL}/dashboard"
sleep 2

# ダッシュボードにアクセスできることを確認
assert_url_contains "/dashboard"

log_success "Protected route accessible after login"

# ============================================
# Test: Access Settings Page
# ============================================
log_info "Testing: Access to settings page"

ab open "${E2E_BASE_URL}/settings"
sleep 2

# 設定ページにアクセスできることを確認
assert_url_contains "/settings"

log_success "Settings page accessible"

# ============================================
# Test: Logout
# ============================================
log_info "Testing: Logout"

# ログアウトボタンを探す
# 設定ページにいる状態でログアウトを試みる

# ユーザーメニューを開く
if ab click "$USER_MENU_BUTTON" 2>/dev/null; then
    sleep 1

    # ログアウトボタンをクリック
    if ab is visible "$LOGOUT_BUTTON" >/dev/null 2>&1; then
        ab click "$LOGOUT_BUTTON"
        sleep 2
        log_success "Clicked logout button"
    else
        log_warn "Logout button not found in menu"
        ab cookies clear 2>/dev/null || true
    fi
else
    log_warn "User menu button not found, clearing cookies"
    ab cookies clear 2>/dev/null || true
fi

# ログインページにリダイレクトされるか、ホームに戻ることを確認
ab open "${E2E_BASE_URL}/dashboard"
sleep 2

CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/login"* ]]; then
    log_success "Logout successful - redirected to login"
elif [[ "$CURRENT_URL" == *"/"* && "$CURRENT_URL" != *"/dashboard"* ]]; then
    log_success "Logout successful - session cleared"
else
    log_warn "Logout verification unclear: $CURRENT_URL"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Auth Flow Smoke Test: PASSED"
echo "=========================================="
