#!/bin/bash
# Drone Test Data Fixtures
# ドローンテスト用データ生成

source "$E2E_ROOT/helpers/form-helpers.sh"

# ============================================
# ドローンテストデータ生成
# ============================================

# 標準テストデータ生成
generate_drone_test_data() {
    local prefix="${1:-E2E-Test}"

    DRONE_NAME=$(generate_test_name "$prefix" "Drone")
    DRONE_CATEGORY="racing"
    DRONE_STATUS="active"
    DRONE_DESCRIPTION="E2Eテストで作成されたドローン"
    DRONE_IS_PUBLIC="false"

    # スペック
    DRONE_FRAME_SIZE="5inch"
    DRONE_WEIGHT="250"
    DRONE_BATTERY_TYPE="4S 1500mAh"

    log_info "Generated drone test data:"
    log_info "  Name: $DRONE_NAME"
    log_info "  Category: $DRONE_CATEGORY"
}

# 最小限テストデータ（必須のみ）
generate_minimal_drone_data() {
    local prefix="${1:-E2E-Minimal}"

    DRONE_NAME=$(generate_test_name "$prefix" "Drone")

    log_info "Generated minimal drone data:"
    log_info "  Name: $DRONE_NAME"
}

# ワークフローテスト用データ
generate_workflow_drone_data() {
    local prefix="${1:-E2E-Workflow}"

    DRONE_NAME=$(generate_test_name "$prefix" "Drone")
    DRONE_CATEGORY="racing"
    DRONE_STATUS="active"
    DRONE_DESCRIPTION="ワークフローテストで作成されたドローン"

    # 更新用データも準備
    DRONE_NAME_UPDATED="${DRONE_NAME}-Updated"
    DRONE_DESCRIPTION_UPDATED="ワークフローテストで更新されたドローン"

    log_info "Generated workflow drone data:"
    log_info "  Name: $DRONE_NAME"
    log_info "  Updated Name: $DRONE_NAME_UPDATED"
}

# ============================================
# ドローンフォーム入力
# ============================================

# 必須フィールドのみ入力
fill_drone_form_minimal() {
    fill_drone_required "$DRONE_NAME"
}

# 全フィールド入力
fill_drone_form_full() {
    fill_drone_required "$DRONE_NAME"

    if [[ -n "$DRONE_DESCRIPTION" ]]; then
        fill_description "$DRONE_DESCRIPTION"
    fi

    if [[ -n "$DRONE_CATEGORY" ]]; then
        fill_category "$DRONE_CATEGORY"
    fi

    if [[ -n "$DRONE_STATUS" ]]; then
        fill_status "$DRONE_STATUS"
    fi
}
