#!/bin/bash
# Event Test Data Fixtures
# イベントテスト用データ生成

source "$E2E_ROOT/helpers/form-helpers.sh"

# ============================================
# イベントテストデータ生成
# ============================================

# 標準テストデータ生成
generate_event_test_data() {
    local prefix="${1:-E2E-Test}"

    EVENT_TITLE=$(generate_test_name "$prefix" "Event")
    EVENT_DATE=$(generate_future_date 7 "14:00")
    EVENT_LOCATION="東京都渋谷区テスト会場"
    EVENT_DESCRIPTION="E2Eテストで作成されたイベントです"
    EVENT_CATEGORY="other"
    EVENT_VISIBILITY="public"
    EVENT_STATUS="draft"

    log_info "Generated event test data:"
    log_info "  Title: $EVENT_TITLE"
    log_info "  Date: $EVENT_DATE"
    log_info "  Location: $EVENT_LOCATION"
}

# 最小限テストデータ（必須のみ）
generate_minimal_event_data() {
    local prefix="${1:-E2E-Minimal}"

    EVENT_TITLE=$(generate_test_name "$prefix" "Event")
    EVENT_DATE=$(generate_future_date 7 "10:00")
    EVENT_LOCATION="テスト会場"

    log_info "Generated minimal event data:"
    log_info "  Title: $EVENT_TITLE"
}

# ワークフローテスト用データ
generate_workflow_event_data() {
    local prefix="${1:-E2E-Workflow}"

    EVENT_TITLE=$(generate_test_name "$prefix" "Event")
    EVENT_DATE=$(generate_future_date 14 "13:00")
    EVENT_LOCATION="東京都港区ワークフローテスト会場"
    EVENT_DESCRIPTION="ワークフローテストで作成されたイベント"
    EVENT_CATEGORY="race"
    EVENT_VISIBILITY="public"
    EVENT_STATUS="draft"

    # 更新用データも準備
    EVENT_TITLE_UPDATED="${EVENT_TITLE}-Updated"
    EVENT_DESCRIPTION_UPDATED="ワークフローテストで更新されたイベント"

    log_info "Generated workflow event data:"
    log_info "  Title: $EVENT_TITLE"
    log_info "  Updated Title: $EVENT_TITLE_UPDATED"
}

# ============================================
# イベントフォーム入力
# ============================================

# 必須フィールドのみ入力
fill_event_form_minimal() {
    fill_event_required "$EVENT_TITLE" "$EVENT_DATE" "$EVENT_LOCATION"
}

# 全フィールド入力
fill_event_form_full() {
    fill_event_required "$EVENT_TITLE" "$EVENT_DATE" "$EVENT_LOCATION"

    if [[ -n "$EVENT_DESCRIPTION" ]]; then
        fill_description "$EVENT_DESCRIPTION"
    fi

    if [[ -n "$EVENT_CATEGORY" ]]; then
        fill_category "$EVENT_CATEGORY"
    fi
}
