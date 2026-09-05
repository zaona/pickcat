<script setup lang="ts">
/**
 * 单条帖子摘要卡片
 *
 * 使用 PrimeVue Card / Tag / Button，点击标题进入详情。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import type { Category, Post, User } from '@/types'

const props = defineProps<{
  post: Post
  author?: User
  category?: Category
}>()

const router = useRouter()

const excerpt = computed(() => {
  const text = props.post.content.replace(/\s+/g, ' ').trim()
  return text.length > 120 ? `${text.slice(0, 120)}…` : text
})

const createdLabel = computed(() =>
  new Date(props.post.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

function openDetail() {
  router.push({ name: 'post-detail', params: { id: props.post.id } })
}

function openAuthor() {
  if (!props.author) return
  router.push({ name: 'user', params: { id: props.author.id } })
}
</script>

<template>
  <Card>
    <template #title>
      <Button
        :label="post.title"
        link
        class="post-title-btn"
        @click="openDetail"
      />
    </template>
    <template #subtitle>
      <div class="row-wrap">
        <Tag v-if="category" :value="category.name" severity="info" />
        <Button
          v-if="author"
          :label="author.displayName"
          link
          size="small"
          @click="openAuthor"
        />
        <span class="muted">{{ createdLabel }}</span>
      </div>
    </template>
    <template #content>
      <p class="muted">{{ excerpt }}</p>
    </template>
    <template #footer>
      <div class="row-wrap">
        <span class="muted">
          <i class="pi pi-heart" /> {{ post.likeCount }}
        </span>
        <span class="muted">
          <i class="pi pi-comments" /> {{ post.commentCount }}
        </span>
        <div class="grow" />
        <Button
          label="查看详情"
          icon="pi pi-arrow-right"
          icon-pos="right"
          size="small"
          @click="openDetail"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
/* 仅调整标题按钮对齐，不覆盖主题色 */
.post-title-btn {
  padding: 0;
  text-align: left;
  white-space: normal;
  height: auto;
}
</style>
