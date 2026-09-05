<script setup lang="ts">
/**
 * GitHub 风格活跃热力图（近约一年，按周列）
 */
import { computed } from 'vue'

import type { HeatmapDay } from '@/types'

const props = defineProps<{
  days: HeatmapDay[]
}>()

const weeks = computed(() => {
  const result: HeatmapDay[][] = []
  let week: HeatmapDay[] = []
  props.days.forEach((day, index) => {
    week.push(day)
    if (week.length === 7 || index === props.days.length - 1) {
      while (week.length < 7) {
        week.push({ date: '', count: -1 })
      }
      result.push(week)
      week = []
    }
  })
  return result
})

function level(count: number) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function tip(day: HeatmapDay) {
  if (!day.date || day.count < 0) return ''
  return `${day.date} · ${day.count} 次活跃`
}
</script>

<template>
  <div class="heatmap">
    <div class="heatmap-scroll">
      <div class="heatmap-grid" role="img" aria-label="近一年活跃热力图">
        <div v-for="(week, wi) in weeks" :key="wi" class="heatmap-week">
          <span
            v-for="(day, di) in week"
            :key="`${wi}-${di}`"
            class="heatmap-cell"
            :class="[
              day.count < 0 ? 'is-pad' : `lv-${level(day.count)}`,
            ]"
            :title="tip(day)"
          />
        </div>
      </div>
    </div>
    <div class="heatmap-legend muted">
      <span>少</span>
      <span class="heatmap-cell lv-0" />
      <span class="heatmap-cell lv-1" />
      <span class="heatmap-cell lv-2" />
      <span class="heatmap-cell lv-3" />
      <span class="heatmap-cell lv-4" />
      <span>多</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.heatmap-scroll {
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.heatmap-grid {
  display: inline-flex;
  gap: 3px;
  min-height: 5.5rem;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 2px;
  background: color-mix(in srgb, var(--p-content-border-color) 70%, transparent);
}

.heatmap-cell.is-pad {
  visibility: hidden;
}

.heatmap-cell.lv-0 {
  background: color-mix(in srgb, var(--p-content-border-color) 55%, transparent);
}

.heatmap-cell.lv-1 {
  background: color-mix(in srgb, var(--p-primary-color) 28%, transparent);
}

.heatmap-cell.lv-2 {
  background: color-mix(in srgb, var(--p-primary-color) 48%, transparent);
}

.heatmap-cell.lv-3 {
  background: color-mix(in srgb, var(--p-primary-color) 72%, transparent);
}

.heatmap-cell.lv-4 {
  background: var(--p-primary-color);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  justify-content: flex-end;
}
</style>
