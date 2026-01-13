#!/bin/bash
# E2E Test Base Configuration
# 共通設定と環境変数読み込み

set -e

# ルートディレクトリを取得
E2E_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$E2E_ROOT/.." && pwd)"

# .env.test.local から環境変数を読み込み
ENV_FILE="$PROJECT_ROOT/.env.test.local"
if [[ -f "$ENV_FILE" ]]; then
    # shellcheck source=/dev/null
    source "$ENV_FILE"
else
    echo "Warning: $ENV_FILE not found. Please create it from .env.test.local.example"
fi

# デフォルト値設定
E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:5173}"
E2E_HEADLESS="${E2E_HEADLESS:-true}"
E2E_SCREENSHOT_ON_FAILURE="${E2E_SCREENSHOT_ON_FAILURE:-true}"
E2E_TIMEOUT="${E2E_TIMEOUT:-30000}"

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# agent-browser コマンドラッパー
# ヘッドレスモードとセッション管理を自動適用
ab() {
    local session="${E2E_SESSION:-default}"
    local args=("--session" "$session")

    if [[ "$E2E_HEADLESS" == "false" ]]; then
        args+=("--headed")
    fi

    agent-browser "${args[@]}" "$@"
}

# テスト開始時のセットアップ
setup_test() {
    local test_name="$1"
    log_info "Starting test: $test_name"
    TEST_START_TIME=$(date +%s)
}

# テスト終了時のクリーンアップ
teardown_test() {
    local test_name="$1"
    local status="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - TEST_START_TIME))

    if [[ "$status" == "pass" ]]; then
        log_success "$test_name completed in ${duration}s"
    else
        log_error "$test_name failed after ${duration}s"
        if [[ "$E2E_SCREENSHOT_ON_FAILURE" == "true" ]]; then
            take_failure_screenshot "$test_name"
        fi
    fi
}

# 失敗時スクリーンショット
take_failure_screenshot() {
    local test_name="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safe_name=$(echo "$test_name" | tr '/' '_' | tr ' ' '_')
    local path="$E2E_ROOT/results/failure_${safe_name}_${timestamp}.png"

    ab screenshot "$path" --full 2>/dev/null || true
    log_info "Screenshot saved: $path"
}

# セッション名を設定
set_session() {
    export E2E_SESSION="$1"
}

# 環境情報を表示
show_env() {
    echo "=========================================="
    echo "E2E Test Environment"
    echo "=========================================="
    echo "Base URL: $E2E_BASE_URL"
    echo "Headless: $E2E_HEADLESS"
    echo "Timeout: ${E2E_TIMEOUT}ms"
    echo "Session: ${E2E_SESSION:-default}"
    echo "=========================================="
}

# ============================================
# テストデータ管理
# ============================================

# 状態ファイルディレクトリ
E2E_STATE_DIR="$E2E_ROOT/state"

# テストデータを保存
save_test_data() {
    local key="$1"
    local value="$2"
    local session="${E2E_SESSION:-default}"

    mkdir -p "$E2E_STATE_DIR"
    echo "$value" > "$E2E_STATE_DIR/${session}_${key}"
    log_info "Saved test data: $key"
}

# テストデータを取得
get_test_data() {
    local key="$1"
    local default="${2:-}"
    local session="${E2E_SESSION:-default}"

    local file="$E2E_STATE_DIR/${session}_${key}"
    if [[ -f "$file" ]]; then
        cat "$file"
    else
        echo "$default"
    fi
}

# セッションのテストデータをクリア
clear_test_data() {
    local session="${E2E_SESSION:-default}"
    rm -f "$E2E_STATE_DIR/${session}_"* 2>/dev/null || true
    log_info "Cleared test data for session: $session"
}

# ============================================
# テストデータ生成ユーティリティ
# ============================================

# ユニークなテスト名を生成
generate_test_name() {
    local prefix="${1:-E2E}"
    local suffix="${2:-Test}"
    local timestamp=$(date +%s)
    echo "${prefix}-${suffix}-${timestamp}"
}

# 将来の日付を生成（macOS/Linux互換）
generate_future_date() {
    local days="${1:-7}"
    local time="${2:-14:00}"

    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        date -v+${days}d "+%Y-%m-%dT${time}"
    else
        # Linux
        date -d "+${days} days" "+%Y-%m-%dT${time}"
    fi
}

# 過去の日付を生成（macOS/Linux互換）
generate_past_date() {
    local days="${1:-7}"
    local time="${2:-14:00}"

    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        date -v-${days}d "+%Y-%m-%dT${time}"
    else
        # Linux
        date -d "-${days} days" "+%Y-%m-%dT${time}"
    fi
}
