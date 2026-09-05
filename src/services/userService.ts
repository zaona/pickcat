/**
 * 用户服务
 *
 * 对外保持异步 Promise 接口，便于日后替换为 HTTP 请求。
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import { useAuthStore } from '@/stores/auth'
import type { User, UserProfileDetail, UserProfileStats } from '@/types'

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

/** 个人主页聚合（含统计 / 热力图 / 动态 / 是否已关注） */
export async function fetchUserProfile(
  userId: string,
): Promise<UserProfileDetail | null> {
  await delay()
  const auth = useAuthStore()
  return mockStore.getUserProfile(userId, auth.currentUserId) ?? null
}

export async function toggleFollow(
  targetUserId: string,
): Promise<{ following: boolean; stats: UserProfileStats } | null> {
  await delay(160)
  const auth = useAuthStore()
  if (!auth.currentUserId) return null
  return mockStore.toggleFollow(auth.currentUserId, targetUserId) ?? null
}

export async function fetchFollowers(userId: string): Promise<User[]> {
  await delay()
  return mockStore.listFollowers(userId)
}

export async function fetchFollowing(userId: string): Promise<User[]> {
  await delay()
  return mockStore.listFollowing(userId)
}
