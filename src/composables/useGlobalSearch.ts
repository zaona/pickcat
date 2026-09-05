/**
 * 搜索页：同时检索帖子与用户
 */
import { computed, ref, watch } from 'vue'

import { fetchCategories } from '@/services/categoryService'
import { fetchPosts } from '@/services/postService'
import { fetchUsers, searchUsers } from '@/services/userService'
import type { Category, Post, User } from '@/types'

export function useGlobalSearch(getQuery: () => string) {
  const loading = ref(false)
  const posts = ref<Post[]>([])
  const users = ref<User[]>([])
  const authorPool = ref<User[]>([])
  const categories = ref<Category[]>([])

  const query = computed(() => getQuery().trim())

  const userMap = computed(() => {
    const map = new Map<string, User>()
    authorPool.value.forEach((user) => map.set(user.id, user))
    users.value.forEach((user) => map.set(user.id, user))
    return map
  })

  const categoryMap = computed(() => {
    const map = new Map<string, Category>()
    categories.value.forEach((category) => map.set(category.id, category))
    return map
  })

  async function load() {
    const q = query.value
    if (!q) {
      posts.value = []
      users.value = []
      return
    }

    loading.value = true
    try {
      const [postPage, userHits, categoryList, userList] = await Promise.all([
        fetchPosts({ keyword: q, page: 1, pageSize: 50 }),
        searchUsers(q),
        fetchCategories(),
        fetchUsers(),
      ])
      posts.value = postPage.items
      users.value = userHits
      categories.value = categoryList
      authorPool.value = userList
    } finally {
      loading.value = false
    }
  }

  watch(query, () => void load(), { immediate: true })

  return {
    loading,
    query,
    posts,
    users,
    userMap,
    categoryMap,
    reload: load,
  }
}
