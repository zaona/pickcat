/**
 * 首页信息流组合逻辑
 *
 * 负责：分类筛选、最新/最热排序、分页、加载帖子与关联的用户/分类映射。
 * 关键词搜索已独立到搜索页。
 */
import { computed, onMounted, ref, watch } from 'vue'

import { fetchCategories } from '@/services/categoryService'
import { fetchPosts } from '@/services/postService'
import { fetchUsers } from '@/services/userService'
import type { Category, FeedSort, Post, User } from '@/types'

export const feedSortOptions: { label: string; value: FeedSort }[] = [
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'hot' },
]

export function usePostFeed() {
  const loading = ref(true)
  const posts = ref<Post[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(5)

  const categories = ref<Category[]>([])
  const users = ref<User[]>([])

  const selectedCategoryId = ref<string | null>(null)
  const sort = ref<FeedSort>('latest')

  const categoryOptions = computed(() => [
    { label: '全部', value: null as string | null, icon: 'pi pi-th-large' },
    ...categories.value.map((item) => ({
      label: item.name,
      value: item.id,
      icon: item.icon,
    })),
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
        page: page.value,
        pageSize: pageSize.value,
        sort: sort.value,
      })
      posts.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  function onPageChange(event: { page: number; rows: number }) {
    page.value = event.page + 1
    pageSize.value = event.rows
    void loadPosts()
  }

  watch(selectedCategoryId, () => {
    page.value = 1
    void loadPosts()
  })

  watch(sort, () => {
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
    sort,
    categoryOptions,
    userMap,
    categoryMap,
    onPageChange,
    loadPosts,
  }
}
