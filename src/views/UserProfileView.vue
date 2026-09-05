<script setup lang="ts">
/**
 * 用户主页
 *
 * 桌面：左用户信息 + 右帖子列表；移动端上下堆叠。
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PostListItem from '@/components/PostListItem.vue'
import AppIcon from '@/components/AppIcon.vue'
import { fetchCategories } from '@/services/categoryService'
import { fetchPosts } from '@/services/postService'
import { fetchUserById } from '@/services/userService'
import type { Category, Post, User } from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const user = ref<User | null>(null)
const posts = ref<Post[]>([])
const categories = ref<Category[]>([])

const userId = computed(() => String(route.params.id ?? ''))

const categoryMap = computed(() => {
  const map = new Map<string, Category>()
  categories.value.forEach((item) => map.set(item.id, item))
  return map
})

const joinedLabel = computed(() => {
  if (!user.value) return ''
  return new Date(user.value.createdAt).toLocaleDateString('zh-CN')
})

async function load() {
  const id = userId.value
  if (!id) return

  loading.value = true
  try {
    const [userData, categoryList, postPage] = await Promise.all([
      fetchUserById(id),
      fetchCategories(),
      fetchPosts({ authorId: id, page: 1, pageSize: 50 }),
    ])
    user.value = userData
    categories.value = categoryList
    posts.value = postPage.items
  } finally {
    loading.value = false
  }
}

watch(userId, () => void load(), { immediate: true })
</script>

<template>
  <section class="stack-md">
    <div v-if="loading" class="profile-layout">
      <div class="profile-aside stack-md">
        <Skeleton width="100%" height="10rem" />
      </div>
      <div class="profile-main stack-md">
        <Skeleton width="100%" height="6rem" />
        <Skeleton width="100%" height="6rem" />
      </div>
    </div>

    <div v-else-if="!user" class="stack-sm">
      <Message severity="error" :closable="false">未找到该用户。</Message>
      <Button label="返回首页" @click="router.push({ name: 'home' })">
        <template #icon="{ class: iconClass }">
          <AppIcon name="home" :class="iconClass" :size="16" />
        </template>
      </Button>
    </div>

    <div v-else class="profile-layout">
      <!-- 左侧：用户信息 -->
      <aside class="profile-aside">
        <Card>
          <template #title>
            <div class="stack-sm" style="align-items: flex-start">
              <Avatar
                :label="user.displayName.slice(0, 1)"
                shape="circle"
                size="xlarge"
              />
              <div class="stack-sm" style="gap: 0.25rem">
                <span>{{ user.displayName }}</span>
                <span class="muted">@{{ user.username }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <p style="margin: 0 0 0.75rem">{{ user.bio }}</p>
            <p class="muted" style="margin: 0">加入于 {{ joinedLabel }}</p>
          </template>
        </Card>
      </aside>

      <!-- 右侧：帖子列表 -->
      <div class="profile-main stack-md">
        <Message
          v-if="posts.length === 0"
          severity="secondary"
          :closable="false"
        >
          还没有发布过帖子。
        </Message>

        <div v-else class="post-list">
          <PostListItem
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :author="user"
            :category="categoryMap.get(post.categoryId)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
