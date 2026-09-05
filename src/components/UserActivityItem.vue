<script setup lang="ts">
/**
 * 个人动态列表项
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import type { IconName } from '@/icons/registry'
import type { UserActivity } from '@/types'

const props = defineProps<{
  activity: UserActivity
}>()

const router = useRouter()

const iconName = computed<IconName>(() => {
  switch (props.activity.type) {
    case 'post':
      return 'plus'
    case 'comment':
      return 'comments'
    case 'like_received':
      return 'heart'
    case 'follow':
      return 'userFollow'
    default:
      return 'info'
  }
})

const timeLabel = computed(() =>
  new Date(props.activity.createdAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

function open() {
  if (props.activity.postId) {
    router.push({ name: 'post-detail', params: { id: props.activity.postId } })
    return
  }
  if (props.activity.targetUserId) {
    router.push({
      name: 'user',
      params: { id: props.activity.targetUserId },
    })
  }
}

const clickable = computed(
  () => Boolean(props.activity.postId || props.activity.targetUserId),
)
</script>

<template>
  <Card
    class="activity-card"
    :class="{ 'is-clickable': clickable }"
    @click="clickable && open()"
  >
    <template #content>
      <div class="row" style="align-items: flex-start">
        <span class="activity-icon">
          <AppIcon :name="iconName" :size="18" />
        </span>
        <div class="stack-sm grow" style="gap: 0.2rem; min-width: 0">
          <div class="row-wrap" style="justify-content: space-between">
            <strong>{{ activity.title }}</strong>
            <span class="muted">{{ timeLabel }}</span>
          </div>
          <p v-if="activity.body" class="muted activity-body">
            {{ activity.body }}
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.activity-card.is-clickable {
  cursor: pointer;
}

.activity-icon {
  display: inline-flex;
  color: var(--p-primary-color);
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.activity-body {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
