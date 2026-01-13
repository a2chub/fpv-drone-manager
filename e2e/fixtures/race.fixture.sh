#!/bin/bash
# Race Test Data Fixtures
# レーステスト用データ生成

source "$E2E_ROOT/helpers/form-helpers.sh"

# ============================================
# レーステストデータ生成
# ============================================

# 標準テストデータ生成
generate_race_test_data() {
    local prefix="${1:-E2E-Test}"

    RACE_NAME=$(generate_test_name "$prefix" "Race")
    RACE_DATE=$(generate_future_date 7 "09:00")
    RACE_LOCATION="東京都渋谷区テストサーキット"
    RACE_CATEGORY="official"
    RACE_IMPRESSIONS="E2Eテストで記録されたレース"
    RACE_IS_PUBLIC="false"

    log_info "Generated race test data:"
    log_info "  Name: $RACE_NAME"
    log_info "  Date: $RACE_DATE"
    log_info "  Location: $RACE_LOCATION"
}

# 最小限テストデータ（必須のみ）
generate_minimal_race_data() {
    local prefix="${1:-E2E-Minimal}"

    RACE_NAME=$(generate_test_name "$prefix" "Race")
    RACE_DATE=$(generate_future_date 3 "10:00")
    RACE_LOCATION="テストサーキット"

    log_info "Generated minimal race data:"
    log_info "  Name: $RACE_NAME"
}

# ワークフローテスト用データ
generate_workflow_race_data() {
    local prefix="${1:-E2E-Workflow}"

    RACE_NAME=$(generate_test_name "$prefix" "Race")
    RACE_DATE=$(generate_future_date 14 "08:00")
    RACE_LOCATION="東京都港区ワークフローテストサーキット"
    RACE_CATEGORY="practice"
    RACE_IMPRESSIONS="ワークフローテストで記録されたレース"

    # 更新用データも準備
    RACE_NAME_UPDATED="${RACE_NAME}-Updated"
    RACE_IMPRESSIONS_UPDATED="ワークフローテストで更新されたレース記録"

    log_info "Generated workflow race data:"
    log_info "  Name: $RACE_NAME"
    log_info "  Updated Name: $RACE_NAME_UPDATED"
}

# ============================================
# レースフォーム入力
# ============================================

# 必須フィールドのみ入力
fill_race_form_minimal() {
    fill_race_required "$RACE_NAME" "$RACE_DATE" "$RACE_LOCATION"
}

# 全フィールド入力
fill_race_form_full() {
    fill_race_required "$RACE_NAME" "$RACE_DATE" "$RACE_LOCATION"

    if [[ -n "$RACE_CATEGORY" ]]; then
        fill_category "$RACE_CATEGORY"
    fi

    if [[ -n "$RACE_IMPRESSIONS" ]]; then
        ab fill "textarea[id='impressions']" "$RACE_IMPRESSIONS" 2>/dev/null || \
        ab fill "textarea[name='impressions']" "$RACE_IMPRESSIONS" 2>/dev/null || true
    fi
}
