#!/bin/bash
# Part Test Data Fixtures
# パーツテスト用データ生成

source "$E2E_ROOT/helpers/form-helpers.sh"

# ============================================
# パーツテストデータ生成
# ============================================

# 標準テストデータ生成
generate_part_test_data() {
    local prefix="${1:-E2E-Test}"

    PART_NAME=$(generate_test_name "$prefix" "Part")
    PART_CATEGORY="motor"
    PART_MANUFACTURER="テストメーカー"
    PART_MODEL="TEST-001"
    PART_NOTES="E2Eテストで作成されたパーツ"
    PART_IS_PUBLIC="false"

    log_info "Generated part test data:"
    log_info "  Name: $PART_NAME"
    log_info "  Category: $PART_CATEGORY"
}

# 最小限テストデータ（必須のみ）
generate_minimal_part_data() {
    local prefix="${1:-E2E-Minimal}"

    PART_NAME=$(generate_test_name "$prefix" "Part")
    PART_CATEGORY="motor"

    log_info "Generated minimal part data:"
    log_info "  Name: $PART_NAME"
}

# ワークフローテスト用データ
generate_workflow_part_data() {
    local prefix="${1:-E2E-Workflow}"

    PART_NAME=$(generate_test_name "$prefix" "Part")
    PART_CATEGORY="motor"
    PART_MANUFACTURER="ワークフローテストメーカー"
    PART_MODEL="WF-001"
    PART_NOTES="ワークフローテストで作成されたパーツ"

    # 更新用データも準備
    PART_NAME_UPDATED="${PART_NAME}-Updated"
    PART_NOTES_UPDATED="ワークフローテストで更新されたパーツ"

    log_info "Generated workflow part data:"
    log_info "  Name: $PART_NAME"
    log_info "  Updated Name: $PART_NAME_UPDATED"
}

# ============================================
# パーツフォーム入力
# ============================================

# 必須フィールドのみ入力
fill_part_form_minimal() {
    fill_part_required "$PART_NAME" "$PART_CATEGORY"
}

# 全フィールド入力
fill_part_form_full() {
    fill_part_required "$PART_NAME" "$PART_CATEGORY"

    if [[ -n "$PART_MANUFACTURER" ]]; then
        ab fill "input[id='manufacturer']" "$PART_MANUFACTURER" 2>/dev/null || true
    fi

    if [[ -n "$PART_MODEL" ]]; then
        ab fill "input[id='model']" "$PART_MODEL" 2>/dev/null || true
    fi

    if [[ -n "$PART_NOTES" ]]; then
        ab fill "textarea[id='notes']" "$PART_NOTES" 2>/dev/null || true
    fi
}
