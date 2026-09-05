<script setup lang="ts">
/**
 * 搜索页
 *
 * 支持按关键词检索帖子与用户，结果分 Tab 展示。
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PostListItem from '@/components/PostListItem.vue'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const route = useRoute()
const router = useRouter()

const draft = ref(String(route.query.q ?? ''))

watch(
  () => route.query.q,
  (q) => {
    draft.value = String(q ?? '')
  },
)

const queryFromRoute = computed(() => String(route.query.q ?? ''))

const { loading, query, posts, users, userMap, categoryMap } = useGlobalSearch(
  () => queryFromRoute.value,
)

const activeTab = ref('0')

function submit() {
  const q = draft.value.trim()
  router.push({ name: 'search', query: q ? { q } : {} })
}

function openUser(id: string) {
  router.push({ name: 'user', params: { id } })
}
</script>

<template>
  <section class="stack-md">
    <header class="page-title">
      <h1>搜索</h1>
    </header>

    <IconField>
      <InputIcon class="pi pi-search" @click="submit" />
      <InputText
        v-model="draft"
        placeholder="搜索帖子或用户"
        size="large"
        fluid
        @keyup.enter="submit"
      />
    </IconField>

    <template v-if="query">
      <div v-if="loading" class="stack-md">
        <Skeleton height="2.5rem" />
        <Skeleton height="6rem" />
        <Skeleton height="6rem" />
      </div>

      <Tabs v-else v-model:value="activeTab">
        <TabList>
          <Tab value="0">帖子（{{ posts.length }}）</Tab>
          <Tab value="1">用户（{{ users.length }}）</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div class="post-list">
              <Message
                v-if="posts.length === 0"
                severity="secondary"
                :closable="false"
              >
                没有匹配的帖子。
              </Message>
              <PostListItem
                v-for="post in posts"
                :key="post.id"
                :post="post"
                :author="userMap.get(post.authorId)"
                :category="categoryMap.get(post.categoryId)"
              />
            </div>
          </TabPanel>
          <TabPanel value="1">
            <div class="stack-md">
              <Message
                v-if="users.length === 0"
                severity="secondary"
                :closable="false"
              >
                没有匹配的用户。
              </Message>
              <Card
                v-for="user in users"
                :key="user.id"
                style="cursor: pointer"
                @click="openUser(user.id)"
              >
                <template #title>
                  <div class="row">
                    <Avatar
                      :label="user.displayName.slice(0, 1)"
                      shape="circle"
                    />
                    <span>{{ user.displayName }}</span>
                  </div>
                </template>
                <template #subtitle>@{{ user.username }}</template>
                <template #content>
                  <p class="muted" style="margin: 0">{{ user.bio }}</p>
                </template>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </section>
</template>

<style scoped>
/* 结果列表仅保留上边距，左右/底部贴齐 */
:deep(.p-tabpanels),
:deep(.p-tabpanel) {
  padding: 0.5rem 0 0;
}
</style>
