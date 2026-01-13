#!/bin/bash
# E2E Test CSS Selectors
# ページ要素のセレクター定義

# ============================================
# 認証関連
# ============================================
LOGIN_EMAIL_INPUT="#email"
LOGIN_PASSWORD_INPUT="#password"
LOGIN_SUBMIT_BUTTON='button[type="submit"]'
GOOGLE_LOGIN_BUTTON='text=Googleでログイン'
USER_MENU_BUTTON='button[aria-label="ユーザーメニュー"]'
LOGOUT_BUTTON='text=ログアウト'

# ============================================
# ナビゲーション
# ============================================
NAV_HOME='a[href="/"]'
NAV_DASHBOARD='a[href="/dashboard"]'
NAV_DRONES='a[href="/drones"]'
NAV_RACES='a[href="/races"]'
NAV_EVENTS='a[href="/events"]'
NAV_SETTINGS='a[href="/settings"]'

# ============================================
# ダッシュボード（Flight Deck UI）
# ============================================
DASHBOARD_WELCOME='text=こんにちは'
DASHBOARD_STATS='.panel-card'
DASHBOARD_QUICK_ACTIONS='a[href="/drones/new"]'
# Flight Deck 新UI要素
DASHBOARD_HEALTH_GAUGE='[data-testid="fleet-health-gauge"], .gauge-indicator'
DASHBOARD_FLEET_OVERVIEW='[data-testid="fleet-overview"], .panel-card'
DASHBOARD_MAINTENANCE_ALERT='text=整備が必要'
DASHBOARD_STAT_CARD='text=登録機体'
DASHBOARD_ACTIVITY_CALENDAR='text=活動カレンダー'
DASHBOARD_MAINTENANCE_TIMELINE='text=整備記録'

# ============================================
# ホームページ（認証後）
# ============================================
HOME_WELCOME_AUTH='text=おかえりなさい'
HOME_QUICK_STATS='[data-testid="quick-stats"], .glass'
HOME_COMMUNITY_HIGHLIGHTS='text=コミュニティハイライト'
HOME_SUGGESTED_PILOTS='text=おすすめパイロット'
HOME_UPCOMING_EVENTS='text=今後のイベント'

# ============================================
# ユーザー一覧ページ
# ============================================
USERS_PAGE_HEADER='text=パイロットを探す'
USERS_FILTER_POPULAR='text=人気'
USERS_FILTER_RECENT='text=新着'
USERS_FILTER_NEARBY='text=近く'
USERS_FILTER_ACTIVE='text=アクティブ'
USERS_SEARCH_INPUT='input[placeholder*="パイロットを検索"]'
USERS_FEATURED_PILOT='text=注目のパイロット'
USERS_CARD_GRID='.grid'

# ============================================
# ドローン関連（data-testid優先）
# ============================================
# プライマリセレクター（data-testid）
DRONE_LIST_PRIMARY='[data-testid="drone-list"]'
DRONE_CARD_PRIMARY='[data-testid^="drone-card-"]'
# フォールバックセレクター
DRONE_LIST_FALLBACK='.drone-list'
DRONE_CARD_FALLBACK='.card'
# 実際に使用するセレクター
DRONE_LIST_CONTAINER="${DRONE_LIST_PRIMARY}"
DRONE_CARD="${DRONE_CARD_PRIMARY}"
DRONE_NEW_BUTTON='a[href="/drones/new"]'
DRONE_NAME_INPUT='input[name="name"], input[id="name"]'
DRONE_DESCRIPTION_INPUT='textarea[name="description"], textarea[id="description"]'
DRONE_CATEGORY_SELECT='select[name="category"], select[id="category"]'
DRONE_STATUS_SELECT='select[name="status"], select[id="status"]'
DRONE_SUBMIT_BUTTON='button[type="submit"]'
DRONE_DELETE_BUTTON='text=削除'
DRONE_EDIT_BUTTON='text=編集'

# ============================================
# レース関連（data-testid優先）
# ============================================
# プライマリセレクター（data-testid）
RACE_LIST_PRIMARY='[data-testid="race-list"]'
RACE_CARD_PRIMARY='[data-testid^="race-card-"]'
# フォールバックセレクター
RACE_LIST_FALLBACK='.space-y-4'
RACE_CARD_FALLBACK='.card'
RACE_TITLE_LINK='a[href^="/races/"]'
# 実際に使用するセレクター
RACE_LIST_CONTAINER="${RACE_LIST_PRIMARY}"
RACE_CARD="${RACE_CARD_PRIMARY}"
RACE_NEW_BUTTON='a[href="/races/new"]'
RACE_NAME_INPUT='input[name="name"], input[id="name"]'
RACE_DRONE_SELECT='select[name="droneId"], select[id="usedDroneId"]'
RACE_SUBMIT_BUTTON='button[type="submit"]'

# ============================================
# イベント関連（data-testid優先）
# ============================================
# プライマリセレクター（data-testid）
EVENT_LIST_PRIMARY='[data-testid="event-list"]'
EVENT_CARD_PRIMARY='[data-testid^="event-card-"]'
# フォールバックセレクター
EVENT_LIST_FALLBACK='.grid'
EVENT_CARD_FALLBACK='a[href*="/events/"].card'
# 実際に使用するセレクター
EVENT_LIST_CONTAINER="${EVENT_LIST_PRIMARY}"
EVENT_CARD="${EVENT_CARD_PRIMARY}"
EVENT_NEW_BUTTON='a[href="/events/new"]'
EVENT_TITLE_INPUT='input[name="title"], input[id="title"]'
EVENT_DESCRIPTION_INPUT='textarea[name="description"], textarea[id="description"]'
EVENT_SUBMIT_BUTTON='button[type="submit"]'
EVENT_JOIN_BUTTON='text=参加する'
EVENT_LEAVE_BUTTON='text=参加をキャンセル'

# ============================================
# 設定関連
# ============================================
SETTINGS_DISPLAY_NAME_INPUT='input[name="displayName"]'
SETTINGS_BIO_INPUT='textarea[name="bio"]'
SETTINGS_LOCATION_INPUT='input[name="location"]'
SETTINGS_SAVE_BUTTON='text=保存'
SETTINGS_PROFILE_PUBLIC_TOGGLE='input[name="isProfilePublic"]'

# ============================================
# 共通UI要素
# ============================================
LOADING_SPINNER='.animate-spin'
ERROR_MESSAGE='.text-red-600'
SUCCESS_MESSAGE='.text-green-600'
MODAL_OVERLAY='.fixed.inset-0'
MODAL_CLOSE_BUTTON='button[aria-label="Close"]'
CONFIRM_DIALOG='[role="alertdialog"]'
CONFIRM_YES_BUTTON='text=はい'
CONFIRM_NO_BUTTON='text=いいえ'
