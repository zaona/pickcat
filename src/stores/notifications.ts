/**
 * 消息未读数（顶栏角标共享）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { fetchUnreadNotificationCount } from '@/services/notificationService'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  async function refreshUnread() {
    const auth = useAuthStore()
    if (!auth.currentUser) {
      unreadCount.value = 0
      return
    }
    unreadCount.value = await fetchUnreadNotificationCount(auth.currentUser.id)
  }

  return {
    unreadCount,
    refreshUnread,
  }
})
