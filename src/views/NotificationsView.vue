<script setup lang="ts">
/**
 * 消息中心
 *
 * 按分类 Tab 展示通知；支持单条已读 / 全部已读。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notificationService'
import AppIcon from '@/components/AppIcon.vue'
import type { IconName } from '@/icons/registry'
import { useUnreadNotifications } from '@/composables/useUnreadNotifications'
import { useAuthStore } from '@/stores/auth'
import type { Notification, NotificationType } from '@/types'

type NoticeTab = 'all' | 'comment' | 'like' | 'system'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const { refreshUnread } = useUnreadNotifications()

const loading = ref(true)
const markingAll = ref(false)
const items = ref<Notification[]>([])
const activeTab = ref<NoticeTab>('all')

const typeIcon: Record<NotificationType, IconName> = {
  comment: 'comment',
  reply: 'comments',
  like: 'heart',
  system: 'info',
}

const tabOptions: { label: string; value: NoticeTab }[] = [
  { label: '全部', value: 'all' },
  { label: '评论', value: 'comment' },
  { label: '点赞', value: 'like' },
  { label: '系统', value: 'system' },
]

const filteredItems = computed(() => {
  if (activeTab.value === 'all') return items.value
  if (activeTab.value === 'comment') {
    return items.value.filter(
      (item) => item.type === 'comment' || item.type === 'reply',
    )
  }
  return items.value.filter((item) => item.type === activeTab.value)
})

const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

const tabUnread = computed(() => {
  const counts: Record<NoticeTab, number> = {
    all: 0,
    comment: 0,
    like: 0,
    system: 0,
  }
  items.value.forEach((item) => {
    if (item.read) return
    counts.all += 1
    if (item.type === 'comment' || item.type === 'reply') counts.comment += 1
    else if (item.type === 'like') counts.like += 1
    else if (item.type === 'system') counts.system += 1
  })
  return counts
})

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function tabLabel(option: { label: string; value: NoticeTab }) {
  const count = tabUnread.value[option.value]
  return count > 0 ? `${option.label} ${count}` : option.label
}

async function load() {
  if (!auth.currentUser) {
    items.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    items.value = await fetchNotifications(auth.currentUser.id)
  } finally {
    loading.value = false
  }
}

async function openItem(item: Notification) {
  if (!auth.currentUser) return
  if (!item.read) {
    await markNotificationRead(auth.currentUser.id, item.id)
    item.read = true
    await refreshUnread()
  }
  if (item.postId) {
    router.push({ name: 'post-detail', params: { id: item.postId } })
  }
}

async function markAll() {
  if (!auth.currentUser || unreadCount.value === 0) return
  markingAll.value = true
  try {
    await markAllNotificationsRead(auth.currentUser.id)
    items.value = items.value.map((item) => ({ ...item, read: true }))
    await refreshUnread()
    toast.add({ severity: 'success', summary: '已全部标为已读', life: 1600 })
  } finally {
    markingAll.value = false
  }
}

onMounted(() => {
  void load()
})

watch(
  () => auth.currentUserId,
  () => {
    void load()
  },
)
</script>

<template>
  <section class="stack-md">
    <header class="page-title">
      <h1>消息中心</h1>
    </header>

    <div v-if="!auth.currentUser" class="stack-sm">
      <Message severity="warn" :closable="false">
        登录后可查看点赞、评论与系统通知。
      </Message>
      <Button label="去登录" @click="router.push({ name: 'login' })">
        <template #icon="{ class: iconClass }">
          <AppIcon name="signIn" :class="iconClass" :size="16" />
        </template>
      </Button>
    </div>

    <template v-else>
      <div class="row-wrap" style="justify-content: space-between">
        <span class="muted">未读 {{ unreadCount }} 条</span>
        <Button
          label="全部已读"
          text
          :disabled="unreadCount === 0"
          :loading="markingAll"
          @click="markAll"
        >
          <template #icon="{ class: iconClass }">
            <AppIcon name="check" :class="iconClass" :size="16" />
          </template>
        </Button>
      </div>

      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab
            v-for="option in tabOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ tabLabel(option) }}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            v-for="option in tabOptions"
            :key="option.value"
            :value="option.value"
          >
            <div class="stack-sm">
              <div v-if="loading" class="stack-md">
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
              </div>

              <Message
                v-else-if="filteredItems.length === 0"
                severity="secondary"
                :closable="false"
                :pt="{ transition: { appear: false } }"
              >
                该分类暂无消息。
              </Message>

              <template v-else>
                <Card
                  v-for="item in filteredItems"
                  :key="item.id"
                  class="notice-card"
                  @click="openItem(item)"
                >
                  <template #content>
                    <div class="row" style="align-items: flex-start">
                      <span class="notice-icon-wrap">
                        <AppIcon
                          :name="typeIcon[item.type]"
                          class="notice-icon"
                          :size="18"
                        />
                        <span
                          v-if="!item.read"
                          class="notice-dot"
                          aria-label="未读"
                        />
                      </span>
                      <div
                        class="stack-sm grow"
                        style="gap: 0.25rem; min-width: 0"
                      >
                        <div
                          class="row-wrap"
                          style="justify-content: space-between"
                        >
                          <strong>{{ item.title }}</strong>
                          <span class="muted">{{
                            formatTime(item.createdAt)
                          }}</span>
                        </div>
                        <p class="muted" style="margin: 0">{{ item.body }}</p>
                      </div>
                    </div>
                  </template>
                </Card>
              </template>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </section>
</template>

<style scoped>
/* 与搜索页一致：列表仅保留上边距，左右/底部贴齐 */
:deep(.p-tabpanels),
:deep(.p-tabpanel) {
  padding: 0.5rem 0 0;
}

/* 空态 Message 在隐藏 Tab 内挂载时勿播入场动画，避免切换时被裁切再展开 */
:deep(.p-message-enter-active) {
  animation: none;
  overflow: visible;
}

.notice-card {
  cursor: pointer;
}

.notice-icon-wrap {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.notice-icon {
  color: var(--p-primary-color);
}

.notice-dot {
  position: absolute;
  top: -0.1rem;
  right: -0.1rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--p-red-500, #ef4444);
  pointer-events: none;
}
</style>
