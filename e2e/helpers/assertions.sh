#!/bin/bash
# E2E Test Assertions
# テスト用アサーション関数

# base.sh から関数を継承（呼び出し元でsource済み想定）

# ============================================
# Text Assertions
# ============================================

# テキストが表示されているか確認
assert_text_visible() {
    local text="$1"
    local timeout="${2:-5000}"

    if ab wait "text=$text" --timeout "$timeout" 2>/dev/null; then
        log_success "Text '$text' is visible"
        return 0
    else
        log_error "Text '$text' not visible within ${timeout}ms"
        return 1
    fi
}

# テキストが表示されていないことを確認
assert_text_not_visible() {
    local text="$1"

    if ! ab is visible "text=$text" >/dev/null 2>&1; then
        log_success "Text '$text' is not visible"
        return 0
    else
        log_error "Text '$text' should not be visible"
        return 1
    fi
}

# ============================================
# URL Assertions
# ============================================

# URLに特定の文字列が含まれるか確認
assert_url_contains() {
    local expected="$1"

    local current_url=$(ab get url 2>/dev/null || echo "")
    if [[ "$current_url" == *"$expected"* ]]; then
        log_success "URL contains '$expected'"
        return 0
    else
        log_error "URL '$current_url' does not contain '$expected'"
        return 1
    fi
}

# URLが完全に一致するか確認
assert_url_equals() {
    local expected="$1"

    local current_url=$(ab get url 2>/dev/null || echo "")
    if [[ "$current_url" == "$expected" ]]; then
        log_success "URL equals '$expected'"
        return 0
    else
        log_error "URL '$current_url' does not equal '$expected'"
        return 1
    fi
}

# URLがパターンに一致するか確認（正規表現）
assert_url_matches() {
    local pattern="$1"

    local current_url=$(ab get url 2>/dev/null || echo "")
    if [[ "$current_url" =~ $pattern ]]; then
        log_success "URL matches pattern '$pattern'"
        return 0
    else
        log_error "URL '$current_url' does not match pattern '$pattern'"
        return 1
    fi
}

# ============================================
# Element Assertions
# ============================================

# 要素が存在するか確認
assert_element_exists() {
    local selector="$1"
    local timeout="${2:-5000}"

    if ab wait "$selector" --timeout "$timeout" 2>/dev/null; then
        log_success "Element '$selector' exists"
        return 0
    else
        log_error "Element '$selector' not found within ${timeout}ms"
        return 1
    fi
}

# 要素が表示されているか確認
assert_element_visible() {
    local selector="$1"

    if ab is visible "$selector" >/dev/null 2>&1; then
        log_success "Element '$selector' is visible"
        return 0
    else
        log_error "Element '$selector' is not visible"
        return 1
    fi
}

# 要素が非表示であることを確認
assert_element_not_visible() {
    local selector="$1"

    if ! ab is visible "$selector" >/dev/null 2>&1; then
        log_success "Element '$selector' is not visible"
        return 0
    else
        log_error "Element '$selector' should not be visible"
        return 1
    fi
}

# 要素の数を確認
assert_element_count() {
    local selector="$1"
    local expected_count="$2"

    local actual_count=$(ab get count "$selector" 2>/dev/null || echo "0")
    if [[ "$actual_count" -eq "$expected_count" ]]; then
        log_success "Element count is $expected_count"
        return 0
    else
        log_error "Expected $expected_count elements, found $actual_count"
        return 1
    fi
}

# 要素の数が期待値以上か確認
assert_element_count_at_least() {
    local selector="$1"
    local min_count="$2"

    local actual_count=$(ab get count "$selector" 2>/dev/null || echo "0")
    if [[ "$actual_count" -ge "$min_count" ]]; then
        log_success "Element count ($actual_count) >= $min_count"
        return 0
    else
        log_error "Expected at least $min_count elements, found $actual_count"
        return 1
    fi
}

# ============================================
# Input Assertions
# ============================================

# 入力値を確認
assert_input_value() {
    local selector="$1"
    local expected_value="$2"

    local actual_value=$(ab get value "$selector" 2>/dev/null || echo "")
    if [[ "$actual_value" == "$expected_value" ]]; then
        log_success "Input value equals '$expected_value'"
        return 0
    else
        log_error "Expected value '$expected_value', got '$actual_value'"
        return 1
    fi
}

# チェックボックスがチェックされているか確認
assert_checked() {
    local selector="$1"

    if ab is checked "$selector" 2>/dev/null; then
        log_success "Checkbox '$selector' is checked"
        return 0
    else
        log_error "Checkbox '$selector' is not checked"
        return 1
    fi
}

# チェックボックスがチェックされていないことを確認
assert_not_checked() {
    local selector="$1"

    if ! ab is checked "$selector" 2>/dev/null; then
        log_success "Checkbox '$selector' is not checked"
        return 0
    else
        log_error "Checkbox '$selector' should not be checked"
        return 1
    fi
}

# ============================================
# Page State Assertions
# ============================================

# ページタイトルを確認
assert_title_contains() {
    local expected="$1"

    local title=$(ab get title 2>/dev/null || echo "")
    if [[ "$title" == *"$expected"* ]]; then
        log_success "Title contains '$expected'"
        return 0
    else
        log_error "Title '$title' does not contain '$expected'"
        return 1
    fi
}

# ローディングが完了したことを確認
assert_loading_complete() {
    local timeout="${1:-10000}"
    local spinner_selector="${2:-$LOADING_SPINNER}"

    sleep 1
    local start_time=$(date +%s%3N)
    local end_time=$((start_time + timeout))

    while [[ $(date +%s%3N) -lt $end_time ]]; do
        if ! ab is visible "$spinner_selector" >/dev/null 2>&1; then
            log_success "Loading complete"
            return 0
        fi
        sleep 0.5
    done

    log_error "Loading did not complete within ${timeout}ms"
    return 1
}
