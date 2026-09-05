<script setup lang="ts">
/**
 * Mock 登录页
 *
 * 职责：从种子用户中选择身份，写入 auth store。
 * 阶段 5 完善用户列表选择；当前为占位。
 */
</script>

<template>
  <section class="stack-md">
    <header class="stack-sm">
      <h1>登录</h1>
      <p class="muted">本项目为 Mock 登录，无真实鉴权。</p>
    </header>
    <Message severity="info" :closable="false">用户切换将在后续阶段实现。</Message>
  </section>
</template>
