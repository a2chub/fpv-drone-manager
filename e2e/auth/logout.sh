#!/bin/bash
# E2E Logout Script
# ログアウトを実行し、認証状態をクリア

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/base.sh"
source "$SCRIPT_DIR/../config/selectors.sh"

# セッション名（引数またはデフォルト）
SESSION_NAME="${1:-e2e-default}"
export E2E_SESSION="$SESSION_NAME"

STATE_FILE="$E2E_ROOT/state/${SESSION_NAME}.cookies.json"

log_info "Logout session: $SESSION_NAME"

# 設定ページまたはダッシュボードにアクセス（ログアウトボタンがある場所）
ab open "${E2E_BASE_URL}/settings"
sleep 2

# ユーザーメニューを開いてログアウト
log_info "Opening user menu..."

if ab click "$USER_MENU_BUTTON" 2>/dev/null; then
    sleep 1

    if ab is visible "$LOGOUT_BUTTON" >/dev/null 2>&1; then
        ab click "$LOGOUT_BUTTON"
        sleep 2
        log_success "Logout button clicked"
    else
        log_warn "Logout button not found in menu, clearing cookies manually"
    fi
else
    log_warn "User menu button not found, clearing cookies manually"
fi

# Cookieをクリア
ab cookies clear 2>/dev/null || true

# 保存済みの認証状態を削除
if [[ -f "$STATE_FILE" ]]; then
    rm -f "$STATE_FILE"
    log_info "Removed saved auth state"
fi

# ログインページにリダイレクトされたか確認
CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/login"* ]] || [[ "$CURRENT_URL" == *"/"* ]]; then
    log_success "Logout successful"
else
    log_warn "Unexpected URL after logout: $CURRENT_URL"
fi
