<script setup lang="ts">
/**
 * 用户主页
 *
 * 职责：展示用户资料及其发帖列表。
 * 阶段 5 实现；当前为占位。
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="stack-md">
    <header class="stack-sm">
      <h1>用户主页</h1>
      <p class="muted">用户 ID：{{ route.params.id }}</p>
    </header>
    <Message severity="info" :closable="false">用户资料与其帖子列表将在后续阶段实现。</Message>
  </section>
</template>
