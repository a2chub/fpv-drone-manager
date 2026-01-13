#!/bin/bash
# E2E Login Script
# Email/Passwordでログインし、認証状態をCookieに保存

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/base.sh"
source "$SCRIPT_DIR/../config/selectors.sh"

# セッション名（引数またはデフォルト）
SESSION_NAME="${1:-e2e-default}"
export E2E_SESSION="$SESSION_NAME"

STATE_FILE="$E2E_ROOT/state/${SESSION_NAME}.cookies.json"

log_info "Login session: $SESSION_NAME"

# クレデンシャル確認
if [[ -z "$E2E_TEST_EMAIL" || -z "$E2E_TEST_PASSWORD" ]]; then
    log_error "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.test.local"
    exit 1
fi

# 既存の認証状態があれば再利用を試みる
if [[ -f "$STATE_FILE" ]]; then
    log_info "Found existing auth state, attempting to reuse..."

    # Cookieを復元
    ab cookies set < "$STATE_FILE" 2>/dev/null || true

    # 認証状態を確認
    if "$SCRIPT_DIR/verify-auth.sh" "$SESSION_NAME" 2>/dev/null; then
        log_success "Auth state valid, reusing existing session"
        exit 0
    else
        log_warn "Auth state expired, performing fresh login"
        rm -f "$STATE_FILE"
    fi
fi

# 新規ログイン実行
log_info "Performing fresh login..."

# ログインページへアクセス
ab open "${E2E_BASE_URL}/login"
sleep 2

# Email/Password入力
log_info "Filling login form..."
ab fill "$LOGIN_EMAIL_INPUT" "$E2E_TEST_EMAIL"
ab fill "$LOGIN_PASSWORD_INPUT" "$E2E_TEST_PASSWORD"

# 送信ボタンをクリック
ab click "$LOGIN_SUBMIT_BUTTON"

# ダッシュボードへのリダイレクト待機
log_info "Waiting for redirect to dashboard..."
sleep 3

# URLを確認
CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/dashboard"* ]] || [[ "$CURRENT_URL" == *"/"* && "$CURRENT_URL" != *"/login"* ]]; then
    log_success "Login successful"

    # Cookie保存
    ab cookies get --json > "$STATE_FILE" 2>/dev/null || true
    log_info "Auth state saved to $STATE_FILE"
else
    # エラーメッセージを確認
    ERROR_TEXT=$(ab get text "$ERROR_MESSAGE" 2>/dev/null || echo "")
    if [[ -n "$ERROR_TEXT" ]]; then
        log_error "Login failed: $ERROR_TEXT"
    else
        log_error "Login failed: Unexpected redirect to $CURRENT_URL"
    fi
    exit 1
fi
