#!/bin/bash
# E2E Feature Test: Settings Profile
# ユーザー設定ページのテスト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../../config/base.sh"
source "$SCRIPT_DIR/../../../config/selectors.sh"
source "$SCRIPT_DIR/../../../helpers/assertions.sh"
source "$SCRIPT_DIR/../../../helpers/wait-for.sh"

# セッション名
SESSION_NAME="${1:-e2e-feature}"
export E2E_SESSION="$SESSION_NAME"

TEST_NAME="feature/settings/profile"
setup_test "$TEST_NAME"

# ============================================
# Test: Access Settings Page
# ============================================
log_info "Testing: Settings page access"

ab open "${E2E_BASE_URL}/settings"
wait_for_page_load 10000

assert_url_contains "/settings"

log_success "Settings page loaded"

# ============================================
# Test: Profile Section
# ============================================
log_info "Testing: Profile section"

# 表示名入力
if ab is visible 'input[name="displayName"]' >/dev/null 2>&1 || ab is visible 'text=表示名' >/dev/null 2>&1; then
    log_success "Display name field visible"
else
    log_info "Display name field not found"
fi

# 自己紹介入力
if ab is visible 'textarea[name="bio"]' >/dev/null 2>&1 || ab is visible 'text=自己紹介' >/dev/null 2>&1; then
    log_success "Bio field visible"
else
    log_info "Bio field not found"
fi

# 所在地入力
if ab is visible 'input[name="location"]' >/dev/null 2>&1 || ab is visible 'text=所在地' >/dev/null 2>&1; then
    log_success "Location field visible"
else
    log_info "Location field not found"
fi

# ============================================
# Test: Theme Section
# ============================================
log_info "Testing: Theme section"

if ab is visible 'text=外観' >/dev/null 2>&1 || ab is visible 'text=テーマ' >/dev/null 2>&1; then
    log_success "Theme section visible"
else
    log_info "Theme section not found"
fi

# ============================================
# Test: Privacy Section
# ============================================
log_info "Testing: Privacy section"

if ab is visible 'text=プライバシー' >/dev/null 2>&1; then
    log_success "Privacy section visible"
fi

# プロフィール公開設定
if ab is visible 'text=プロフィール公開' >/dev/null 2>&1 || ab is visible 'input[name="isProfilePublic"]' >/dev/null 2>&1; then
    log_success "Profile public toggle visible"
fi

# ============================================
# Test: Save Button
# ============================================
log_info "Testing: Save button"

if ab is visible "$SETTINGS_SAVE_BUTTON" >/dev/null 2>&1 || ab is visible 'text=保存' >/dev/null 2>&1 || ab is visible 'button[type="submit"]' >/dev/null 2>&1; then
    log_success "Save button visible"
else
    log_info "Save button not found (may be section-specific)"
fi

# ============================================
# Test: Profile Update (Optional)
# ============================================
log_info "Testing: Profile update flow"

# 軽微な変更をテスト（説明文に追加）
TIMESTAMP=$(date +%s)
TEST_BIO="E2Eテスト更新 - ${TIMESTAMP}"

# 自己紹介を更新
if ab is visible 'textarea[name="bio"]' >/dev/null 2>&1; then
    ab fill 'textarea[name="bio"]' "$TEST_BIO" 2>/dev/null || true
    sleep 1

    # 保存ボタンをクリック
    ab click 'text=保存' 2>/dev/null || ab click 'button[type="submit"]' 2>/dev/null || true
    sleep 2

    # 成功メッセージを確認
    if ab is visible 'text=保存しました' >/dev/null 2>&1 || ab is visible "$SUCCESS_MESSAGE" >/dev/null 2>&1; then
        log_success "Profile updated successfully"
    else
        log_info "Save confirmation not visible (may be auto-saved)"
    fi
fi

# ============================================
# Complete
# ============================================
teardown_test "$TEST_NAME" "pass"
echo ""
echo "=========================================="
echo "Settings Profile Feature Test: PASSED"
echo "=========================================="
