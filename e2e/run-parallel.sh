#!/bin/bash
# E2E Parallel Test Runner
# 機能テストを並列実行するスクリプト

set -e

E2E_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$E2E_ROOT/config/base.sh"

# タイムスタンプ + PIDでユニークなセッションIDを生成（競合防止）
TIMESTAMP=$(date +%s)
UNIQUE_ID="${TIMESTAMP}-$$"

# 並列セッション名（完全にユニーク）
SESSION_DRONES="e2e-drones-${UNIQUE_ID}"
SESSION_RACES="e2e-races-${UNIQUE_ID}"
SESSION_EVENTS="e2e-events-${UNIQUE_ID}"

# PIDトラッキング
declare -a PIDS

# 結果トラッキング
DRONES_RESULT=0
RACES_RESULT=0
EVENTS_RESULT=0

# ============================================
# Cleanup Function
# ============================================
cleanup() {
    log_info "Cleaning up parallel sessions..."

    # 全セッションを閉じる
    for session in "$SESSION_DRONES" "$SESSION_RACES" "$SESSION_EVENTS"; do
        E2E_SESSION="$session" ab close 2>/dev/null || true
    done

    # セッション固有のテストデータをクリア
    for session in "$SESSION_DRONES" "$SESSION_RACES" "$SESSION_EVENTS"; do
        rm -f "$E2E_STATE_DIR/${session}_"* 2>/dev/null || true
    done

    # 残っているバックグラウンドジョブを終了
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
}

# セッション間の競合を防ぐため、開始前に古いデータをクリア
ensure_session_isolation() {
    local session="$1"
    rm -f "$E2E_STATE_DIR/${session}_"* 2>/dev/null || true
    log_info "Session isolated: $session"
}

trap cleanup EXIT

# ============================================
# Main
# ============================================

echo ""
echo "=========================================="
echo "E2E Parallel Test Runner"
echo "=========================================="
show_env
echo ""

# 環境チェック
if ! command -v agent-browser &>/dev/null; then
    log_error "agent-browser is not installed"
    exit 1
fi

if [[ -z "$E2E_TEST_EMAIL" || -z "$E2E_TEST_PASSWORD" ]]; then
    log_error "E2E credentials not set"
    exit 1
fi

START_TIME=$(date +%s)

# ============================================
# Step 1: セッション分離とテストデータクリア
# ============================================
log_info "Step 1: Ensuring session isolation..."

ensure_session_isolation "$SESSION_DRONES"
ensure_session_isolation "$SESSION_RACES"
ensure_session_isolation "$SESSION_EVENTS"

# ============================================
# Step 2: 並列認証セットアップ
# ============================================
log_info "Step 2: Setting up authentication for all sessions..."

"$E2E_ROOT/auth/login.sh" "$SESSION_DRONES" &
PIDS+=($!)

"$E2E_ROOT/auth/login.sh" "$SESSION_RACES" &
PIDS+=($!)

"$E2E_ROOT/auth/login.sh" "$SESSION_EVENTS" &
PIDS+=($!)

# 全認証の完了を待機
log_info "Waiting for authentication to complete..."
wait

# PIDリストをクリア
PIDS=()

log_success "All sessions authenticated"
echo ""

# ============================================
# Step 3: 機能テストを並列実行
# ============================================
log_info "Step 3: Running feature tests in parallel..."
echo ""

# Drones tests
(
    log_info "[Drones] Starting drone tests..."
    export E2E_SESSION="$SESSION_DRONES"

    for test in "$E2E_ROOT/tests/feature/drones/"*.sh; do
        if [[ -f "$test" ]]; then
            bash "$test" "$SESSION_DRONES" 2>&1 | sed 's/^/[Drones] /'
        fi
    done

    log_success "[Drones] Completed"
) &
PIDS+=($!)

# Races tests
(
    log_info "[Races] Starting race tests..."
    export E2E_SESSION="$SESSION_RACES"

    for test in "$E2E_ROOT/tests/feature/races/"*.sh; do
        if [[ -f "$test" ]]; then
            bash "$test" "$SESSION_RACES" 2>&1 | sed 's/^/[Races] /'
        fi
    done

    log_success "[Races] Completed"
) &
PIDS+=($!)

# Events tests
(
    log_info "[Events] Starting event tests..."
    export E2E_SESSION="$SESSION_EVENTS"

    for test in "$E2E_ROOT/tests/feature/events/"*.sh; do
        if [[ -f "$test" ]]; then
            bash "$test" "$SESSION_EVENTS" 2>&1 | sed 's/^/[Events] /'
        fi
    done

    log_success "[Events] Completed"
) &
PIDS+=($!)

# 全テストの完了を待機
log_info "Waiting for all parallel tests to complete..."
wait

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# ============================================
# 結果サマリー
# ============================================
echo ""
echo "=========================================="
echo "Parallel Test Execution Complete"
echo "=========================================="
echo ""
echo "Total Duration: ${DURATION}s"
echo ""
echo "Tests executed in parallel:"
echo "  - Drones feature tests"
echo "  - Races feature tests"
echo "  - Events feature tests"
echo ""
echo "=========================================="

log_success "All parallel tests completed!"
