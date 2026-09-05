/**
 * 未读消息数（顶栏角标）
 */
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

export function useUnreadNotifications() {
  const auth = useAuthStore()
  const notificationStore = useNotificationStore()
  const { unreadCount } = storeToRefs(notificationStore)

  onMounted(() => {
    void notificationStore.refreshUnread()
  })

  watch(
    () => auth.currentUserId,
    () => {
      void notificationStore.refreshUnread()
    },
  )

  return {
    unreadCount,
    refreshUnread: notificationStore.refreshUnread,
  }
}
