<script setup lang="ts">
/**
 * 全站图标入口：按 IconName 解析 MingCute 组件。
 */
import { computed } from 'vue'

import { iconRegistry, type IconName } from '@/icons/registry'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
  }>(),
  {
    size: 18,
  },
)

const component = computed(() => iconRegistry[props.name])
</script>

<template>
  <component
    :is="component"
    class="app-icon"
    :size="size"
    color="currentColor"
    aria-hidden="true"
  />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: -0.125em;
}
</style>
