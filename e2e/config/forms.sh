#!/bin/bash
# E2E Test Form Field Definitions
# フォームフィールド定義（UI変更時はここを修正）
#
# フィールド定義形式: "フィールド名:タイプ:ラベル"
# タイプ: input, text, textarea, select, checkbox, datetime-local, number, url

# ============================================
# イベントフォーム (EventForm.tsx)
# ============================================
EVENT_FORM_REQUIRED_FIELDS=(
    "title:input:タイトル"
    "date:datetime-local:開催日"
    "location:text:開催場所"
)

EVENT_FORM_OPTIONAL_FIELDS=(
    "description:textarea:説明"
    "endDate:datetime-local:終了日時"
    "locationDetails:text:場所詳細"
    "officialUrl:url:公式URL"
    "category:select:カテゴリー"
    "capacity:number:定員"
    "registrationType:select:参加登録タイプ"
    "visibility:select:公開設定"
    "status:select:ステータス"
    "coverImageUrl:url:カバー画像URL"
)

EVENT_FORM_DEFAULTS=(
    "category:other"
    "registrationType:free"
    "visibility:public"
    "status:draft"
)

# ============================================
# レースフォーム (RaceForm.tsx)
# ============================================
RACE_FORM_REQUIRED_FIELDS=(
    "name:input:レース名"
    "date:datetime-local:開催日"
    "location:text:開催場所"
)

RACE_FORM_OPTIONAL_FIELDS=(
    "category:select:カテゴリー"
    "officialUrl:url:公式URL"
    "rank:number:順位"
    "totalParticipants:number:参加者数"
    "lapTime:text:ベストラップ"
    "usedDroneId:select:使用機体"
    "impressions:textarea:感想・振り返り"
    "isPublic:checkbox:公開設定"
)

RACE_FORM_DEFAULTS=(
    "category:official"
    "isPublic:false"
)

# ============================================
# ドローンフォーム (DroneFormPage.tsx)
# ============================================
DRONE_FORM_REQUIRED_FIELDS=(
    "name:input:機体名"
)

DRONE_FORM_OPTIONAL_FIELDS=(
    "category:select:カテゴリー"
    "status:select:ステータス"
    "specifications.frameSize:text:フレームサイズ"
    "specifications.weight:number:重量"
    "specifications.batteryType:text:バッテリー"
    "description:textarea:説明"
    "isPublic:checkbox:機体を公開"
)

DRONE_FORM_DEFAULTS=(
    "category:racing"
    "status:active"
    "isPublic:false"
)

# ============================================
# パーツフォーム (PartForm.tsx)
# ============================================
PART_FORM_REQUIRED_FIELDS=(
    "name:input:パーツ名"
    "category:select:カテゴリー"
)

PART_FORM_OPTIONAL_FIELDS=(
    "manufacturer:text:メーカー"
    "model:text:型番"
    "purchasePrice:number:購入価格"
    "purchaseStore:text:購入店舗"
    "purchaseUrl:url:購入URL"
    "notes:textarea:メモ"
    "isPublic:checkbox:パーツを公開"
)

PART_FORM_DEFAULTS=(
    "category:motor"
    "isPublic:false"
)

# ============================================
# パーツ履歴フォーム (PartHistoryForm.tsx)
# ============================================
PART_HISTORY_FORM_REQUIRED_FIELDS=(
    "type:select:種類"
    "title:input:タイトル"
    "date:datetime-local:日付"
)

PART_HISTORY_FORM_OPTIONAL_FIELDS=(
    "description:textarea:説明"
    "isPublic:checkbox:公開設定"
)

PART_HISTORY_FORM_DEFAULTS=(
    "type:note"
    "isPublic:false"
)
