<script setup lang="ts">
/**
 * 评论树节点（递归）
 *
 * 一级评论与回复共用本组件；回复缩进由父级容器控制。
 */
import type { CommentNode } from '@/composables/usePostDetail'

defineProps<{
  node: CommentNode
}>()

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="stack-sm">
    <Card>
      <template #subtitle>
        <div class="row-wrap">
          <Avatar
            :label="(node.author?.displayName ?? '?').slice(0, 1)"
            shape="circle"
            size="small"
          />
          <strong>{{ node.author?.displayName ?? '未知用户' }}</strong>
          <span class="muted">{{ formatTime(node.createdAt) }}</span>
        </div>
      </template>
      <template #content>
        <p style="white-space: pre-wrap; margin: 0">{{ node.content }}</p>
      </template>
    </Card>

    <div v-if="node.children.length" class="comment-replies stack-sm">
      <CommentThread
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </div>
  </div>
</template>

<style scoped>
/* 仅用于回复层级缩进 */
.comment-replies {
  margin-left: 1.25rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--p-content-border-color);
}
</style>
