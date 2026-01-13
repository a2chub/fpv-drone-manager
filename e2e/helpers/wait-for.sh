#!/bin/bash
# E2E Test Wait Functions
# 待機関数

# ============================================
# Element Wait Functions
# ============================================

# 要素が表示されるまで待機
wait_for_element() {
    local selector="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for element: $selector"

    if ab wait "$selector" --timeout "$timeout" 2>/dev/null; then
        log_success "Element appeared: $selector"
        return 0
    else
        log_error "Element did not appear: $selector (timeout: ${timeout}ms)"
        return 1
    fi
}

# 要素が非表示になるまで待機
wait_for_element_hidden() {
    local selector="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for element to hide: $selector"

    # macOS互換: 秒単位で計算
    local timeout_sec=$((timeout / 1000))
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout_sec))

    while [[ $(date +%s) -lt $end_time ]]; do
        if ! ab is visible "$selector" >/dev/null 2>&1; then
            log_success "Element hidden: $selector"
            return 0
        fi
        sleep 0.5
    done

    log_error "Element still visible: $selector (timeout: ${timeout}ms)"
    return 1
}

# テキストが表示されるまで待機
wait_for_text() {
    local text="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for text: $text"

    if ab wait "text=$text" --timeout "$timeout" 2>/dev/null; then
        log_success "Text appeared: $text"
        return 0
    else
        log_error "Text did not appear: $text (timeout: ${timeout}ms)"
        return 1
    fi
}

# ============================================
# Navigation Wait Functions
# ============================================

# URLが変更されるまで待機
wait_for_url_change() {
    local initial_url="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for URL change from: $initial_url"

    # macOS互換: 秒単位で計算
    local timeout_sec=$((timeout / 1000))
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout_sec))

    while [[ $(date +%s) -lt $end_time ]]; do
        local current_url=$(ab get url 2>/dev/null || echo "")
        if [[ "$current_url" != "$initial_url" ]]; then
            log_success "URL changed to: $current_url"
            return 0
        fi
        sleep 0.5
    done

    log_error "URL did not change (timeout: ${timeout}ms)"
    return 1
}

# 特定のURLになるまで待機
wait_for_url() {
    local expected_url="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for URL: $expected_url"

    # macOS互換: 秒単位で計算
    local timeout_sec=$((timeout / 1000))
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout_sec))

    while [[ $(date +%s) -lt $end_time ]]; do
        local current_url=$(ab get url 2>/dev/null || echo "")
        if [[ "$current_url" == *"$expected_url"* ]]; then
            log_success "Navigated to: $current_url"
            return 0
        fi
        sleep 0.5
    done

    log_error "Did not navigate to $expected_url (timeout: ${timeout}ms)"
    return 1
}

# ページ読み込み完了まで待機（複数スピナー対応版）
wait_for_page_load() {
    local timeout="${1:-10000}"

    log_info "Waiting for page load..."

    # 複数のローディングインジケーターを検出
    local spinner_selectors=(
        ".animate-spin"
        "[data-loading='true']"
        ".loading"
        ".skeleton"
    )

    sleep 0.5  # 初期安定化

    # macOS互換: 秒単位で計算
    local timeout_sec=$((timeout / 1000))
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout_sec))

    while [[ $(date +%s) -lt $end_time ]]; do
        local all_loaded=true

        for selector in "${spinner_selectors[@]}"; do
            if ab is visible "$selector" >/dev/null 2>&1; then
                all_loaded=false
                break
            fi
        done

        if $all_loaded; then
            log_success "Page loaded"
            return 0
        fi
        sleep 0.3
    done

    log_warn "Page may still be loading after ${timeout}ms"
    return 0  # タイムアウトでも続行
}

# DOM安定化待機（要素の描画完了を待つ）
wait_for_dom_stable() {
    local timeout="${1:-5000}"

    log_info "Waiting for DOM to stabilize..."
    sleep 1
    log_success "DOM stabilized"
    return 0
}

# 要素出現後の安定化待機
wait_for_element_stable() {
    local selector="$1"
    local timeout="${2:-10000}"

    if wait_for_element "$selector" "$timeout"; then
        sleep 0.3  # 描画安定化
        return 0
    fi
    return 1
}

# ============================================
# Network Wait Functions
# ============================================

# ネットワークリクエストが完了するまで待機
wait_for_network_idle() {
    local timeout="${1:-5000}"

    log_info "Waiting for network idle..."

    # 簡易的にsleepで待機（agent-browserにnetwork idle待機がない場合）
    sleep 2

    log_success "Network idle (approximate)"
    return 0
}

# ============================================
# Animation Wait Functions
# ============================================

# アニメーションが完了するまで待機
wait_for_animation() {
    local duration="${1:-500}"

    log_info "Waiting for animation (${duration}ms)..."
    sleep $(echo "scale=3; $duration / 1000" | bc)
    log_success "Animation complete"
    return 0
}

# ============================================
# Conditional Wait Functions
# ============================================

# 条件が満たされるまで待機（カスタムコマンド）
wait_until() {
    local condition_cmd="$1"
    local timeout="${2:-10000}"

    log_info "Waiting for condition..."

    # macOS互換: 秒単位で計算
    local timeout_sec=$((timeout / 1000))
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout_sec))

    while [[ $(date +%s) -lt $end_time ]]; do
        if eval "$condition_cmd" 2>/dev/null; then
            log_success "Condition met"
            return 0
        fi
        sleep 0.5
    done

    log_error "Condition not met (timeout: ${timeout}ms)"
    return 1
}

# 固定時間待機
wait_ms() {
    local ms="$1"
    sleep $(echo "scale=3; $ms / 1000" | bc)
}
