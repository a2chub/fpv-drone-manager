#!/bin/bash
# E2E Test Form Helpers
# フォーム操作の共通関数

# ============================================
# フィールドセレクター生成
# ============================================

# フィールド定義からセレクターを生成
get_field_selector() {
    local field_name="$1"
    local field_type="$2"

    case "$field_type" in
        textarea)
            echo "textarea[id='$field_name']"
            ;;
        select)
            echo "select[id='$field_name']"
            ;;
        checkbox)
            echo "input[type='checkbox'][id='$field_name']"
            ;;
        datetime-local)
            echo "input[id='$field_name']"
            ;;
        number)
            echo "input[id='$field_name']"
            ;;
        url)
            echo "input[id='$field_name']"
            ;;
        *)
            echo "input[id='$field_name']"
            ;;
    esac
}

# ============================================
# フィールド入力関数
# ============================================

# 単一フィールドに値を入力
fill_field() {
    local field_name="$1"
    local field_type="$2"
    local value="$3"

    local selector=$(get_field_selector "$field_name" "$field_type")

    case "$field_type" in
        checkbox)
            if [[ "$value" == "true" ]]; then
                ab click "$selector" 2>/dev/null || true
            fi
            ;;
        select)
            # selectの場合はオプションを選択
            ab click "$selector" 2>/dev/null || true
            sleep 0.3
            ab click "option[value='$value']" 2>/dev/null || \
            ab click "text=$value" 2>/dev/null || true
            ;;
        *)
            ab fill "$selector" "$value" 2>/dev/null || true
            ;;
    esac

    sleep 0.2  # 入力安定化
}

# ============================================
# フォーム入力関数（配列ベース）
# ============================================

# 必須フィールドを入力（シンプル版）
fill_event_required() {
    local title="$1"
    local date="$2"
    local location="$3"

    log_info "Filling event required fields..."

    ab fill "input[id='title']" "$title" 2>/dev/null || \
    ab fill "input[name='title']" "$title" 2>/dev/null || true

    ab fill "input[id='date']" "$date" 2>/dev/null || \
    ab fill "input[type='datetime-local']" "$date" 2>/dev/null || true

    ab fill "input[id='location']" "$location" 2>/dev/null || \
    ab fill "input[name='location']" "$location" 2>/dev/null || true

    sleep 0.3
}

fill_race_required() {
    local name="$1"
    local date="$2"
    local location="$3"

    log_info "Filling race required fields..."

    ab fill "input[id='name']" "$name" 2>/dev/null || \
    ab fill "input[name='name']" "$name" 2>/dev/null || true

    ab fill "input[id='date']" "$date" 2>/dev/null || \
    ab fill "input[type='datetime-local']" "$date" 2>/dev/null || true

    ab fill "input[id='location']" "$location" 2>/dev/null || \
    ab fill "input[name='location']" "$location" 2>/dev/null || true

    sleep 0.3
}

fill_drone_required() {
    local name="$1"

    log_info "Filling drone required fields..."

    ab fill "input[id='name']" "$name" 2>/dev/null || \
    ab fill "input[name='name']" "$name" 2>/dev/null || true

    sleep 0.3
}

fill_part_required() {
    local name="$1"
    local category="${2:-motor}"

    log_info "Filling part required fields..."

    ab fill "input[id='name']" "$name" 2>/dev/null || \
    ab fill "input[name='name']" "$name" 2>/dev/null || true

    # カテゴリー選択
    ab click "select[id='category']" 2>/dev/null || true
    sleep 0.2
    ab click "option[value='$category']" 2>/dev/null || true

    sleep 0.3
}

# ============================================
# オプションフィールド入力
# ============================================

fill_description() {
    local description="$1"

    ab fill "textarea[id='description']" "$description" 2>/dev/null || \
    ab fill "textarea[name='description']" "$description" 2>/dev/null || \
    ab fill "textarea" "$description" 2>/dev/null || true
}

fill_category() {
    local category="$1"

    ab click "select[id='category']" 2>/dev/null || \
    ab click "select[name='category']" 2>/dev/null || true
    sleep 0.2
    ab click "option[value='$category']" 2>/dev/null || true
}

fill_status() {
    local status="$1"

    ab click "select[id='status']" 2>/dev/null || \
    ab click "select[name='status']" 2>/dev/null || true
    sleep 0.2
    ab click "option[value='$status']" 2>/dev/null || true
}

# ============================================
# フォーム送信
# ============================================

submit_form() {
    local button_selector="${1:-button[type='submit']}"

    log_info "Submitting form..."
    ab click "$button_selector" 2>/dev/null || \
    ab click "button[type='submit']" 2>/dev/null || \
    ab click "text=保存" 2>/dev/null || true

    sleep 2  # 送信後の処理待機
}

# ============================================
# テストデータ生成ヘルパー
# ============================================

# macOS/Linux互換の将来日付生成
generate_future_date() {
    local days_ahead="${1:-7}"
    local time="${2:-14:00}"

    # macOS (BSD date)
    if date -v+${days_ahead}d '+%Y-%m-%dT%H:%M' 2>/dev/null; then
        return
    fi

    # Linux (GNU date)
    date -d "+${days_ahead} days" '+%Y-%m-%dT%H:%M' 2>/dev/null || \
    echo "2026-02-01T${time}"
}

# タイムスタンプ付きテスト名生成
generate_test_name() {
    local prefix="${1:-E2E-Test}"
    local entity="${2:-Item}"
    local timestamp=$(date +%s)

    echo "${prefix}-${entity}-${timestamp}"
}
