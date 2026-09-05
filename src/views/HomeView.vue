<script setup lang="ts">
/**
 * 首页
 *
 * 展示帖子信息流：分类筛选、关键词搜索、分页与加载骨架。
 */
import PostListItem from '@/components/PostListItem.vue'
import { usePostFeed } from '@/composables/usePostFeed'

const {
  loading,
  posts,
  total,
  page,
  pageSize,
  selectedCategoryId,
  keyword,
  categoryOptions,
  userMap,
  categoryMap,
  search,
  resetFilters,
  onPageChange,
} = usePostFeed()
</script>

<template>
  <section class="stack-md">
    <header class="stack-sm">
      <h1>社区动态</h1>
      <p class="muted">浏览最新帖子，按分类筛选或搜索关键词。</p>
    </header>

    <!-- 筛选栏：全部使用 PrimeVue 表单控件 -->
    <Toolbar>
      <template #start>
        <div class="row-wrap">
          <Select
            v-model="selectedCategoryId"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="选择分类"
            style="min-width: 10rem"
          />
          <InputText
            v-model="keyword"
            placeholder="搜索标题或正文"
            style="min-width: 12rem"
            @keyup.enter="search"
          />
          <Button label="搜索" icon="pi pi-search" @click="search" />
          <Button
            label="重置"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            @click="resetFilters"
          />
        </div>
      </template>
    </Toolbar>

    <!-- 加载骨架 -->
    <div v-if="loading" class="stack-md">
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

    <Message v-else-if="posts.length === 0" severity="secondary" :closable="false">
      没有符合条件的帖子，试试调整筛选条件。
    </Message>

    <div v-else class="stack-md">
      <PostListItem
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :author="userMap.get(post.authorId)"
        :category="categoryMap.get(post.categoryId)"
      />

      <Paginator
        :rows="pageSize"
        :total-records="total"
        :first="(page - 1) * pageSize"
        :rows-per-page-options="[5, 10]"
        @page="onPageChange"
      />
    </div>
  </section>
</template>
