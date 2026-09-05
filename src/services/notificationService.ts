/**
 * 消息 / 通知服务
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import type { Notification } from '@/types'

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  await delay()
  return mockStore.listNotifications(userId)
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  await delay(60)
  return mockStore.countUnreadNotifications(userId)
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<Notification | null> {
  await delay(100)
  return mockStore.markNotificationRead(userId, id) ?? null
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  await delay(120)
  return mockStore.markAllNotificationsRead(userId)
}
