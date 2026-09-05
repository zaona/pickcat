<script setup lang="ts">
/**
 * 我的收藏
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import PostListItem from '@/components/PostListItem.vue'
import { fetchCategories } from '@/services/categoryService'
import { fetchBookmarkedPosts } from '@/services/postService'
import { fetchUsers } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import type { Category, Post, User } from '@/types'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const posts = ref<Post[]>([])
const users = ref<User[]>([])
const categories = ref<Category[]>([])

const userMap = computed(() => {
  const map = new Map<string, User>()
  users.value.forEach((user) => map.set(user.id, user))
  return map
})

const categoryMap = computed(() => {
  const map = new Map<string, Category>()
  categories.value.forEach((item) => map.set(item.id, item))
  return map
})

async function load() {
  if (!auth.currentUser) {
    posts.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    const [postList, userList, categoryList] = await Promise.all([
      fetchBookmarkedPosts(auth.currentUser.id),
      fetchUsers(),
      fetchCategories(),
    ])
    posts.value = postList
    users.value = userList
    categories.value = categoryList
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(
  () => auth.currentUserId,
  () => {
    void load()
  },
)
</script>

<template>
  <section class="stack-md">
    <header class="page-title">
      <h1>我的收藏</h1>
    </header>

    <div v-if="!auth.currentUser" class="stack-sm">
      <Message severity="warn" :closable="false">
        登录后可查看收藏的帖子。
      </Message>
      <Button
        label="去登录"
        icon="pi pi-sign-in"
        @click="router.push({ name: 'login' })"
      />
    </div>

    <template v-else>
      <div v-if="loading" class="post-list">
        <Skeleton height="6rem" />
        <Skeleton height="6rem" />
      </div>

      <Message
        v-else-if="posts.length === 0"
        severity="secondary"
        :closable="false"
      >
        还没有收藏，去帖子详情点「收藏」吧。
      </Message>

      <div v-else class="post-list">
        <PostListItem
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :author="userMap.get(post.authorId)"
          :category="categoryMap.get(post.categoryId)"
        />
      </div>
    </template>
  </section>
</template>
