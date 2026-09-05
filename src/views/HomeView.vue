<script setup lang="ts">
/**
 * 首页
 *
 * - 桌面：标题通栏，下方帖子列表与右侧分类侧栏（发帖在分类上方）
 * - 移动端：横向分类 + 排序 + 信息流
 */
import { useRouter } from 'vue-router'

import PostListItem from '@/components/PostListItem.vue'
import AppIcon from '@/components/AppIcon.vue'
import { feedSortOptions, usePostFeed } from '@/composables/usePostFeed'

const router = useRouter()

const {
  loading,
  posts,
  total,
  page,
  pageSize,
  selectedCategoryId,
  sort,
  categoryOptions,
  userMap,
  categoryMap,
  onPageChange,
} = usePostFeed()

function goCreate() {
  router.push({ name: 'post-create' })
}
</script>

<template>
  <div class="stack-md">
    <header class="page-title">
      <h1>社区动态</h1>
    </header>

    <div class="mobile-only mobile-feed-filters">
      <div class="mobile-category-scroll" role="tablist" aria-label="分类">
        <button
          v-for="option in categoryOptions"
          :key="String(option.value)"
          type="button"
          role="tab"
          class="mobile-category-chip"
          :class="{ 'is-active': selectedCategoryId === option.value }"
          :aria-selected="selectedCategoryId === option.value"
          @click="selectedCategoryId = option.value"
        >
          <AppIcon :name="option.icon" :size="16" />
          <span>{{ option.label }}</span>
        </button>
      </div>
      <SelectButton
        v-model="sort"
        :options="feedSortOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
      />
    </div>

    <!-- 帖子列与侧栏同行，顶部对齐 -->
    <div class="home-layout">
      <section class="home-main stack-md">
        <div class="desktop-only row">
          <SelectButton
            v-model="sort"
            :options="feedSortOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>

        <div v-if="loading" class="post-list">
          <Card v-for="n in 3" :key="n">
            <template #title><Skeleton width="60%" height="1.5rem" /></template>
            <template #content>
              <div class="stack-sm">
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="80%" height="1rem" />
              </div>
            </template>
          </Card>
        </div>

        <Message
          v-else-if="posts.length === 0"
          severity="secondary"
          :closable="false"
        >
          当前分类下暂无帖子。
        </Message>

        <template v-else>
          <div class="post-list">
            <PostListItem
              v-for="post in posts"
              :key="post.id"
              :post="post"
              :author="userMap.get(post.authorId)"
              :category="categoryMap.get(post.categoryId)"
            />
          </div>

          <Paginator
            :rows="pageSize"
            :total-records="total"
            :first="(page - 1) * pageSize"
            :rows-per-page-options="[5, 10]"
            @page="onPageChange"
          />
        </template>
      </section>

      <aside class="desktop-only category-sidebar">
        <Button
          label="发帖"
          size="large"
          fluid
          @click="goCreate"
        />
        <Listbox
          v-model="selectedCategoryId"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          scroll-height="none"
          class="category-listbox"
        >
          <template #option="{ option }">
            <span class="category-option">
              <AppIcon :name="option.icon" :size="16" />
              <span>{{ option.label }}</span>
            </span>
          </template>
        </Listbox>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* 侧栏项：圆角矩形背景，颜色走主题 token */
.category-listbox {
  border: none;
  background: transparent;
  box-shadow: none;
}

.category-listbox :deep(.p-listbox-list-container),
.category-listbox :deep(.p-listbox-list) {
  border: none;
  background: transparent;
  padding: 0;
  gap: 0.4rem;
  display: flex;
  flex-direction: column;
  max-height: none;
  overflow: visible;
  height: auto;
}

.category-listbox :deep(.p-listbox-option) {
  border-radius: var(--p-content-border-radius);
  background: var(--p-content-background);
  border: none;
  padding: 0.65rem 0.85rem;
}

.category-listbox :deep(.p-listbox-option.p-listbox-option-selected) {
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
}

.category-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.category-option .pi {
  font-size: 1rem;
}

/* 移动端：分类 + 排序（仅窄屏设 display，避免盖过 .mobile-only 的隐藏） */
@media (max-width: 768px) {
  .mobile-feed-filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

/* 移动端：分类横向滚动 */
.mobile-category-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-inline: -0.15rem;
  padding-inline: 0.15rem;
}

.mobile-category-scroll::-webkit-scrollbar {
  display: none;
}

.mobile-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
  padding: 0.55rem 0.85rem;
  border: none;
  border-radius: var(--p-content-border-radius);
  background: var(--p-content-background);
  color: var(--p-text-color);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.mobile-category-chip.is-active {
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
}

.mobile-category-chip .pi {
  font-size: 1rem;
}
</style>
