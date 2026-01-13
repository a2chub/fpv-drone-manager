#!/bin/bash
# E2E Test Runner
# メインテストランナースクリプト

set -e

E2E_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$E2E_ROOT/config/base.sh"

# テストレベル（引数またはデフォルト）
TEST_LEVEL="${1:-smoke}"

# セッション名を生成
SESSION_PREFIX="e2e-$(date +%s)"
export E2E_SESSION="$SESSION_PREFIX"

# テスト結果カウンター
PASSED=0
FAILED=0
SKIPPED=0

# ============================================
# Helper Functions
# ============================================

run_test() {
    local test_script="$1"
    local test_name=$(basename "$test_script" .sh)

    echo ""
    log_info "Running: $test_name"
    echo "-------------------------------------------"

    if bash "$test_script" "$SESSION_PREFIX"; then
        ((PASSED++)) || true
    else
        ((FAILED++)) || true
        log_error "Test failed: $test_name"
    fi
}

run_tests_in_dir() {
    local dir="$1"

    if [[ ! -d "$dir" ]]; then
        log_warn "Directory not found: $dir"
        return
    fi

    for test in "$dir"/*.sh; do
        if [[ -f "$test" ]]; then
            run_test "$test"
        fi
    done
}

# ============================================
# Main
# ============================================

echo ""
echo "=========================================="
echo "E2E Test Runner"
echo "=========================================="
show_env
echo ""

# 環境チェック
if ! command -v agent-browser &>/dev/null; then
    log_error "agent-browser is not installed"
    log_info "Install with: npm install -g agent-browser && agent-browser install"
    exit 1
fi

# クレデンシャルチェック
if [[ -z "$E2E_TEST_EMAIL" || -z "$E2E_TEST_PASSWORD" ]]; then
    log_error "E2E credentials not set"
    log_info "Create .env.test.local from .env.test.local.example"
    exit 1
fi

# ============================================
# 認証セットアップ
# ============================================
log_info "Setting up authentication..."

"$E2E_ROOT/auth/login.sh" "$SESSION_PREFIX"

if [[ $? -ne 0 ]]; then
    log_error "Authentication failed"
    exit 1
fi

echo ""
log_success "Authentication successful"
echo ""

# ============================================
# テスト実行
# ============================================

START_TIME=$(date +%s)

case "$TEST_LEVEL" in
    smoke)
        log_info "Running smoke tests..."
        run_tests_in_dir "$E2E_ROOT/tests/smoke"
        ;;

    feature)
        log_info "Running all feature tests..."
        for category in "$E2E_ROOT/tests/feature/"*/; do
            if [[ -d "$category" ]]; then
                log_info "Category: $(basename $category)"
                run_tests_in_dir "$category"
            fi
        done
        ;;

    feature/*)
        # 特定のカテゴリーのみ実行
        CATEGORY_DIR="$E2E_ROOT/tests/$TEST_LEVEL"
        log_info "Running feature tests: $TEST_LEVEL"
        run_tests_in_dir "$CATEGORY_DIR"
        ;;

    full)
        log_info "Running full workflow tests..."
        run_tests_in_dir "$E2E_ROOT/tests/full"
        ;;

    all)
        log_info "Running all tests..."

        # Smoke tests
        log_info "=== Smoke Tests ==="
        run_tests_in_dir "$E2E_ROOT/tests/smoke"

        # Feature tests
        log_info "=== Feature Tests ==="
        for category in "$E2E_ROOT/tests/feature/"*/; do
            if [[ -d "$category" ]]; then
                log_info "Category: $(basename $category)"
                run_tests_in_dir "$category"
            fi
        done

        # Full workflow tests
        log_info "=== Full Workflow Tests ==="
        run_tests_in_dir "$E2E_ROOT/tests/full"
        ;;

    *)
        # 特定のテストファイルを実行
        if [[ -f "$E2E_ROOT/tests/$TEST_LEVEL.sh" ]]; then
            run_test "$E2E_ROOT/tests/$TEST_LEVEL.sh"
        elif [[ -f "$E2E_ROOT/tests/$TEST_LEVEL" ]]; then
            run_test "$E2E_ROOT/tests/$TEST_LEVEL"
        else
            log_error "Unknown test level: $TEST_LEVEL"
            echo ""
            echo "Available test levels:"
            echo "  smoke       - Basic functionality tests"
            echo "  feature     - All feature tests"
            echo "  feature/drones  - Drone feature tests only"
            echo "  feature/races   - Race feature tests only"
            echo "  feature/events  - Event feature tests only"
            echo "  full        - Full workflow tests"
            echo "  all         - Run all tests"
            exit 1
        fi
        ;;
esac

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# ============================================
# クリーンアップ
# ============================================
log_info "Cleaning up session..."
ab close 2>/dev/null || true

# ============================================
# 結果サマリー
# ============================================
echo ""
echo "=========================================="
echo "E2E Test Results"
echo "=========================================="
echo ""
echo "Total Duration: ${DURATION}s"
echo ""
log_success "Passed: $PASSED"

if [[ $FAILED -gt 0 ]]; then
    log_error "Failed: $FAILED"
fi

if [[ $SKIPPED -gt 0 ]]; then
    log_warn "Skipped: $SKIPPED"
fi

echo ""
echo "=========================================="

# 失敗があれば非ゼロで終了
if [[ $FAILED -gt 0 ]]; then
    exit 1
fi

exit 0
