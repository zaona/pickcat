/**
 * 用户服务
 *
 * 对外保持异步 Promise 接口，便于日后替换为 HTTP 请求。
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import type { User } from '@/types'

export async function fetchUsers(): Promise<User[]> {
  await delay()
  return mockStore.listUsers()
}

/** 按关键词搜索用户（用户名 / 展示名 / 简介） */
export async function searchUsers(keyword: string): Promise<User[]> {
  await delay()
  return mockStore.searchUsers(keyword)
}

export async function fetchUserById(id: string): Promise<User | null> {
  await delay()
  return mockStore.getUser(id) ?? null
}
