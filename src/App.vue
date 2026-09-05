<script setup lang="ts">
/**
 * 根组件：挂载全局 Toast / Confirm，并渲染路由出口。
 * 具体页面壳层由 AppLayout 与各视图负责。
 */
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>
