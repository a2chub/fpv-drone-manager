#!/bin/bash
# E2E Test Screenshot Functions
# スクリーンショット取得関数

# ============================================
# Screenshot Functions
# ============================================

# スクリーンショットを取得
take_screenshot() {
    local name="$1"
    local full="${2:-false}"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safe_name=$(echo "$name" | tr '/' '_' | tr ' ' '_')
    local path="$E2E_ROOT/results/screenshot_${safe_name}_${timestamp}.png"

    local args=()
    if [[ "$full" == "true" ]]; then
        args+=("--full")
    fi

    if ab screenshot "$path" "${args[@]}" 2>/dev/null; then
        log_info "Screenshot saved: $path"
        echo "$path"
        return 0
    else
        log_warn "Failed to take screenshot"
        return 1
    fi
}

# フルページスクリーンショットを取得
take_full_screenshot() {
    local name="$1"
    take_screenshot "$name" "true"
}

# 失敗時スクリーンショット（テスト失敗時に自動呼び出し）
take_failure_screenshot() {
    local test_name="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safe_name=$(echo "$test_name" | tr '/' '_' | tr ' ' '_')
    local path="$E2E_ROOT/results/failure_${safe_name}_${timestamp}.png"

    ab screenshot "$path" --full 2>/dev/null || true
    log_info "Failure screenshot saved: $path"
    echo "$path"
}

# 要素のスクリーンショットを取得
take_element_screenshot() {
    local selector="$1"
    local name="$2"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safe_name=$(echo "$name" | tr '/' '_' | tr ' ' '_')
    local path="$E2E_ROOT/results/element_${safe_name}_${timestamp}.png"

    # 要素にスクロール
    ab scrollintoview "$selector" 2>/dev/null || true

    # スクリーンショット取得
    if ab screenshot "$path" 2>/dev/null; then
        log_info "Element screenshot saved: $path"
        echo "$path"
        return 0
    else
        log_warn "Failed to take element screenshot"
        return 1
    fi
}

# ============================================
# Comparison Functions
# ============================================

# スクリーンショットを比較（基準画像との差分）
compare_screenshot() {
    local current_path="$1"
    local baseline_path="$2"
    local threshold="${3:-0.1}"

    # ImageMagickのcompareコマンドを使用（要インストール）
    if command -v compare &>/dev/null; then
        local diff_path="${current_path%.png}_diff.png"

        local result=$(compare -metric RMSE "$baseline_path" "$current_path" "$diff_path" 2>&1)
        local diff_value=$(echo "$result" | grep -oE '^[0-9.]+' || echo "999999")

        if (( $(echo "$diff_value < $threshold" | bc -l) )); then
            log_success "Screenshot matches baseline (diff: $diff_value)"
            rm -f "$diff_path"
            return 0
        else
            log_error "Screenshot differs from baseline (diff: $diff_value)"
            log_info "Diff image saved: $diff_path"
            return 1
        fi
    else
        log_warn "ImageMagick not installed, skipping comparison"
        return 0
    fi
}

# ============================================
# Cleanup Functions
# ============================================

# 古いスクリーンショットを削除
cleanup_old_screenshots() {
    local days="${1:-7}"

    log_info "Cleaning up screenshots older than $days days..."

    find "$E2E_ROOT/results" -name "*.png" -mtime "+$days" -delete 2>/dev/null || true
    find "$E2E_ROOT/results" -name "*.json" -mtime "+$days" -delete 2>/dev/null || true

    log_success "Cleanup complete"
}

# 全スクリーンショットを削除
clear_all_screenshots() {
    log_info "Clearing all screenshots..."

    rm -f "$E2E_ROOT/results/"*.png 2>/dev/null || true
    rm -f "$E2E_ROOT/results/"*.json 2>/dev/null || true

    log_success "All screenshots cleared"
}
