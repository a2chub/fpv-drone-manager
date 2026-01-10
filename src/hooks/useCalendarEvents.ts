import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { droneService } from '@/services/droneService'
import { partService } from '@/services/partService'
import { partHistoryService } from '@/services/partHistoryService'
import { raceService } from '@/services/raceService'
import { timestampToDate, isInMonth, groupEventsByDate } from '@/utils/calendarUtils'
import type {
  CalendarEvent,
  EventsByDate,
  RaceEventMeta,
  PartPurchaseEventMeta,
  PartHistoryEventMeta,
  DroneCreatedEventMeta,
} from '@/types'
import type { Drone, Part, PartHistory, Race } from '@/types'

const CALENDAR_EVENTS_QUERY_KEY = 'calendarEvents'

/**
 * レースイベントに変換
 */
function raceToEvent(race: Race): CalendarEvent {
  const metadata: RaceEventMeta = {
    type: 'race',
    raceId: race.id,
    raceName: race.name,
    location: race.location,
    category: race.category,
    rank: race.result.rank,
    usedDroneName: race.usedDroneName,
  }

  return {
    id: `race-${race.id}`,
    type: 'race',
    title: race.name,
    date: timestampToDate(race.date),
    metadata,
  }
}

/**
 * パーツ購入イベントに変換
 */
function partToEvent(part: Part, drone: Drone): CalendarEvent | null {
  if (!part.purchaseDate) return null

  const metadata: PartPurchaseEventMeta = {
    type: 'partPurchase',
    partId: part.id,
    droneId: drone.id,
    partName: part.name,
    droneName: drone.name,
    category: part.category,
    purchasePrice: part.purchasePrice,
    purchaseStore: part.purchaseStore,
  }

  return {
    id: `partPurchase-${part.id}`,
    type: 'partPurchase',
    title: `${part.name} 購入`,
    date: timestampToDate(part.purchaseDate),
    metadata,
  }
}

/**
 * パーツ履歴イベントに変換
 */
function historyToEvent(
  history: PartHistory,
  part: Part,
  drone: Drone
): CalendarEvent {
  const metadata: PartHistoryEventMeta = {
    type: 'partHistory',
    historyId: history.id,
    partId: part.id,
    droneId: drone.id,
    partName: part.name,
    droneName: drone.name,
    historyType: history.type,
    title: history.title,
    description: history.description,
  }

  return {
    id: `partHistory-${history.id}`,
    type: 'partHistory',
    title: history.title,
    date: timestampToDate(history.date),
    metadata,
  }
}

/**
 * 機体作成イベントに変換
 */
function droneToEvent(drone: Drone): CalendarEvent {
  const metadata: DroneCreatedEventMeta = {
    type: 'droneCreated',
    droneId: drone.id,
    droneName: drone.name,
    category: drone.category,
  }

  return {
    id: `droneCreated-${drone.id}`,
    type: 'droneCreated',
    title: `${drone.name} 作成`,
    date: timestampToDate(drone.createdAt),
    metadata,
  }
}

/**
 * 全カレンダーイベントを取得
 */
async function fetchAllCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = []

  // 機体一覧を取得
  const drones = await droneService.getAll(userId)

  // レース一覧を取得
  const races = await raceService.getAll(userId)
  events.push(...races.map(raceToEvent))

  // 機体作成イベントを追加
  events.push(...drones.map(droneToEvent))

  // 各機体のパーツと履歴を並列で取得
  await Promise.all(
    drones.map(async (drone) => {
      const parts = await partService.getAll(userId, drone.id)

      for (const part of parts) {
        // パーツ購入イベント
        const purchaseEvent = partToEvent(part, drone)
        if (purchaseEvent) {
          events.push(purchaseEvent)
        }

        // パーツ履歴
        const histories = await partHistoryService.getAll(userId, drone.id, part.id)
        events.push(...histories.map((h) => historyToEvent(h, part, drone)))
      }
    })
  )

  // 日付でソート（新しい順）
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  return events
}

/**
 * カレンダーイベントを取得するカスタムフック
 */
export function useCalendarEvents() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [CALENDAR_EVENTS_QUERY_KEY, user?.id],
    queryFn: () => fetchAllCalendarEvents(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  })
}

/**
 * 特定の月のイベントをフィルタリング
 */
export function filterEventsByMonth(
  events: CalendarEvent[],
  year: number,
  month: number
): CalendarEvent[] {
  return events.filter((event) => isInMonth(event.date, year, month))
}

/**
 * 月別イベントマップを取得
 */
export function useCalendarEventsByMonth(year: number, month: number) {
  const { data: allEvents, isLoading, error } = useCalendarEvents()

  const monthEvents = allEvents
    ? filterEventsByMonth(allEvents, year, month)
    : []

  const eventsByDate: EventsByDate = groupEventsByDate(monthEvents)

  return {
    events: monthEvents,
    eventsByDate,
    isLoading,
    error,
  }
}
