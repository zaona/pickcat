<script setup lang="ts">
/**
 * 帖子详情页
 *
 * 职责：展示正文、点赞、评论列表与发表评论。
 * 阶段 4 实现业务逻辑；当前为占位。
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="stack-md">
    <header class="stack-sm">
      <h1>帖子详情</h1>
      <p class="muted">帖子 ID：{{ route.params.id }}</p>
    </header>
    <Message severity="info" :closable="false">详情与评论将在后续阶段实现。</Message>
  </section>
</template>
