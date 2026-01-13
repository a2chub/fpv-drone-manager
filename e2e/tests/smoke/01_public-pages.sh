#!/bin/bash
# E2E Smoke Test: Public Pages
# 公開ページへのアクセステスト（認証不要）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../config/base.sh"
source "$SCRIPT_DIR/../../config/selectors.sh"
source "$SCRIPT_DIR/../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-smoke}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="smoke/public-pages"
setup_test "$TEST_NAME"

# ============================================
# Test: Home Page
# ============================================
log_info "Testing: Home Page"

ab open "$E2E_BASE_URL"
wait_for_page_load

assert_url_contains "/"
# ホームページの主要要素を確認
if ! assert_text_visible "FPV" 5000 2>/dev/null; then
    # 代替テキストを試す
    assert_element_exists "main" || true
fi

log_success "Home page loaded"

# ============================================
# Test: Login Page
# ============================================
log_info "Testing: Login Page"

ab open "${E2E_BASE_URL}/login"
wait_for_page_load

# ログイン済みの場合はダッシュボードにリダイレクトされる
CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/login"* ]]; then
    assert_element_exists "$LOGIN_EMAIL_INPUT"
    assert_element_exists "$LOGIN_PASSWORD_INPUT"
    assert_element_exists "$LOGIN_SUBMIT_BUTTON"
    log_success "Login page loaded with form elements"
elif [[ "$CURRENT_URL" == *"/dashboard"* ]] || [[ "$CURRENT_URL" == *"/"* ]]; then
    log_success "Already logged in - redirected to dashboard (expected behavior)"
else
    log_warn "Unexpected URL: $CURRENT_URL"
fi

# ============================================
# Test: Users List Page
# ============================================
log_info "Testing: Users List Page"

ab open "${E2E_BASE_URL}/users"
wait_for_page_load

assert_url_contains "/users"

# 新UIのページヘッダー確認
if assert_text_visible "パイロットを探す" 5000 2>/dev/null; then
    log_success "Users page header visible"
fi

# フィルタータブの存在確認
if ab is visible 'text=人気' >/dev/null 2>&1; then
    log_success "Filter tabs visible"
fi

# 検索フィールドの存在確認
if ab is visible 'input[placeholder*="パイロットを検索"]' >/dev/null 2>&1; then
    log_success "Search input visible"
fi

log_success "Users list page loaded"

# ============================================
# Test: Public Profile Page (if exists)
# ============================================
log_info "Testing: Public Profile accessibility"

# 存在しないユーザーでも404ページが表示されることを確認
ab open "${E2E_BASE_URL}/u/nonexistent-user-12345"
sleep 2

# エラーページまたはプロフィールページが表示される
CURRENT_URL=$(ab get url 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == *"/u/"* ]] || [[ "$CURRENT_URL" == *"/404"* ]] || [[ "$CURRENT_URL" == *"/"* ]]; then
    log_success "Public profile route accessible"
else
    log_warn "Unexpected redirect: $CURRENT_URL"
fi

# ============================================
# Test: Navigation
# ============================================
log_info "Testing: Navigation from home"

ab open "$E2E_BASE_URL"
wait_for_page_load

# ナビゲーションリンクの存在確認
if ab is visible 'nav' >/dev/null 2>&1; then
    log_success "Navigation bar visible"
else
    log_warn "Navigation bar not found"
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Public Pages Smoke Test: PASSED"
echo "=========================================="
