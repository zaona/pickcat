<script setup lang="ts">
/**
 * 评论树节点（递归）
 *
 * 支持点赞与回复；回复缩进由父级容器控制。
 */
import type { CommentNode } from '@/composables/usePostDetail'

const props = defineProps<{
  node: CommentNode
  likingIds?: Set<string>
}>()

const emit = defineEmits<{
  like: [commentId: string]
  reply: [node: CommentNode]
}>()

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isLiking(id: string) {
  return props.likingIds?.has(id) ?? false
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
      <template #footer>
        <div class="row-wrap">
          <Button
            :label="String(node.likeCount)"
            :icon="node.liked ? 'pi pi-heart-fill' : 'pi pi-heart'"
            :severity="node.liked ? 'danger' : 'secondary'"
            text
            size="small"
            :loading="isLiking(node.id)"
            @click="emit('like', node.id)"
          />
          <Button
            label="回复"
            icon="pi pi-reply"
            severity="secondary"
            text
            size="small"
            @click="emit('reply', node)"
          />
        </div>
      </template>
    </Card>

    <div v-if="node.children.length" class="comment-replies stack-sm">
      <CommentThread
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :liking-ids="likingIds"
        @like="emit('like', $event)"
        @reply="emit('reply', $event)"
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
