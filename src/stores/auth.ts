/**
 * 认证状态（Mock）
 *
 * 无真实鉴权：通过切换本地「当前用户」模拟登录。
 * 持久化使用 localStorage，刷新后保持选择。
 *
 * 后续若接入真实登录，可保留本 store 的对外 API（currentUser / login / logout），
 * 仅替换内部实现。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { User } from '@/types'

const STORAGE_KEY = 'pickcat.currentUserId'

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref<string | null>(localStorage.getItem(STORAGE_KEY))
  /** 由外部（如 app 启动或登录页）注入的用户列表查找函数，避免 store 直接依赖 mock */
  const userResolver = ref<((id: string) => User | undefined) | null>(null)

  const currentUser = computed<User | null>(() => {
    if (!currentUserId.value || !userResolver.value) return null
    return userResolver.value(currentUserId.value) ?? null
  })

  function setUserResolver(fn: (id: string) => User | undefined) {
    userResolver.value = fn
  }

  function login(userId: string) {
    currentUserId.value = userId
    localStorage.setItem(STORAGE_KEY, userId)
  }

  function logout() {
    currentUserId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    currentUserId,
    currentUser,
    setUserResolver,
    login,
    logout,
  }
})
