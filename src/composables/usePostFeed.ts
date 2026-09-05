/**
 * 首页信息流组合逻辑
 *
 * 负责：分类/搜索条件、分页、加载帖子与关联的用户/分类映射。
 */
import { computed, onMounted, ref, watch } from 'vue'

import { fetchCategories } from '@/services/categoryService'
import { fetchPosts } from '@/services/postService'
import { fetchUsers } from '@/services/userService'
import type { Category, Post, User } from '@/types'

export function usePostFeed() {
  const loading = ref(true)
  const posts = ref<Post[]>([])
  const total = ref(0)
  const page = ref(0) // PrimeVue Paginator 使用 0-based first index 时另算；此处用 1-based page
  const pageSize = ref(5)

  const categories = ref<Category[]>([])
  const users = ref<User[]>([])

  const selectedCategoryId = ref<string | null>(null)
  const keyword = ref('')
  /** 防抖后的关键词，真正用于请求 */
  const appliedKeyword = ref('')

  const categoryOptions = computed(() => [
    { label: '全部分类', value: null as string | null },
    ...categories.value.map((item) => ({ label: item.name, value: item.id })),
  ])

  const userMap = computed(() => {
    const map = new Map<string, User>()
    users.value.forEach((user) => map.set(user.id, user))
    return map
  })

  const categoryMap = computed(() => {
    const map = new Map<string, Category>()
    categories.value.forEach((category) => map.set(category.id, category))
    return map
  })

  async function loadMeta() {
    const [categoryList, userList] = await Promise.all([fetchCategories(), fetchUsers()])
    categories.value = categoryList
    users.value = userList
  }

  async function loadPosts() {
    loading.value = true
    try {
      const result = await fetchPosts({
        categoryId: selectedCategoryId.value,
        keyword: appliedKeyword.value,
        page: page.value,
        pageSize: pageSize.value,
      })
      posts.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  function search() {
    appliedKeyword.value = keyword.value.trim()
    page.value = 1
    void loadPosts()
  }

  function resetFilters() {
    selectedCategoryId.value = null
    keyword.value = ''
    appliedKeyword.value = ''
    page.value = 1
    void loadPosts()
  }

  function onPageChange(event: { page: number; rows: number }) {
    // PrimeVue Paginator：page 为 0-based
    page.value = event.page + 1
    pageSize.value = event.rows
    void loadPosts()
  }

  watch(selectedCategoryId, () => {
    page.value = 1
    void loadPosts()
  })

  onMounted(async () => {
    page.value = 1
    await loadMeta()
    await loadPosts()
  })

  return {
    loading,
    posts,
    total,
    page,
    pageSize,
    categories,
    selectedCategoryId,
    keyword,
    categoryOptions,
    userMap,
    categoryMap,
    search,
    resetFilters,
    onPageChange,
    loadPosts,
  }
}
