#!/bin/bash
# E2E Auth Verification Script
# 現在の認証状態を確認

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/base.sh"
source "$SCRIPT_DIR/../config/selectors.sh"

# セッション名（引数またはデフォルト）
SESSION_NAME="${1:-e2e-default}"
export E2E_SESSION="$SESSION_NAME"

log_info "Verifying auth for session: $SESSION_NAME"

# ダッシュボードにアクセス（認証が必要なページ）
ab open "${E2E_BASE_URL}/dashboard"
sleep 3

# URLを確認
CURRENT_URL=$(ab get url 2>/dev/null || echo "")

# ダッシュボードにいれば認証済み
if [[ "$CURRENT_URL" == *"/dashboard"* ]]; then
    log_success "Authentication verified - user is logged in"

    # ウェルカムメッセージを確認
    if ab is visible "$DASHBOARD_WELCOME" >/dev/null 2>&1; then
        log_info "Welcome message visible"
    fi

    exit 0
fi

# ログインページにリダイレクトされた場合は未認証
if [[ "$CURRENT_URL" == *"/login"* ]]; then
    log_warn "Authentication expired - redirected to login"
    exit 1
fi

# その他の場合
log_warn "Unexpected URL: $CURRENT_URL"
exit 1
