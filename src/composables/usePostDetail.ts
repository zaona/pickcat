/**
 * 帖子详情与评论组合逻辑
 */
import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

import { createComment, fetchCommentsByPost } from '@/services/commentService'
import { fetchCategoryById } from '@/services/categoryService'
import {
  fetchPostById,
  fetchPostLiked,
  togglePostLike,
} from '@/services/postService'
import { fetchUserById } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import type { Category, Comment, Post, User } from '@/types'

export interface CommentNode extends Comment {
  author?: User
  children: CommentNode[]
}

export function usePostDetail(postId: () => string) {
  const toast = useToast()
  const auth = useAuthStore()

  const loading = ref(true)
  const submitting = ref(false)
  const liking = ref(false)

  const post = ref<Post | null>(null)
  const author = ref<User | null>(null)
  const category = ref<Category | null>(null)
  const liked = ref(false)
  const comments = ref<Comment[]>([])
  const commentAuthors = ref<Map<string, User>>(new Map())

  const draft = ref('')

  const commentTree = computed<CommentNode[]>(() => {
    const nodes = new Map<string, CommentNode>()
    comments.value.forEach((item) => {
      nodes.set(item.id, {
        ...item,
        author: commentAuthors.value.get(item.authorId),
        children: [],
      })
    })

    const roots: CommentNode[] = []
    nodes.forEach((node) => {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  })

  async function load() {
    const id = postId()
    if (!id) return

    loading.value = true
    try {
      const [postData, likedState, commentList] = await Promise.all([
        fetchPostById(id),
        fetchPostLiked(id),
        fetchCommentsByPost(id),
      ])

      post.value = postData
      liked.value = likedState
      comments.value = commentList

      if (!postData) {
        author.value = null
        category.value = null
        return
      }

      const [authorData, categoryData] = await Promise.all([
        fetchUserById(postData.authorId),
        fetchCategoryById(postData.categoryId),
      ])
      author.value = authorData
      category.value = categoryData

      const authorIds = [...new Set(commentList.map((item) => item.authorId))]
      const authorEntries = await Promise.all(
        authorIds.map(async (userId) => {
          const user = await fetchUserById(userId)
          return [userId, user] as const
        }),
      )
      const map = new Map<string, User>()
      authorEntries.forEach(([userId, user]) => {
        if (user) map.set(userId, user)
      })
      commentAuthors.value = map
    } finally {
      loading.value = false
    }
  }

  async function toggleLike() {
    if (!post.value) return
    if (!auth.currentUser) {
      toast.add({
        severity: 'warn',
        summary: '请先登录',
        detail: '点赞前需要选择 Mock 用户身份。',
        life: 2500,
      })
      return
    }

    liking.value = true
    try {
      const result = await togglePostLike(post.value.id)
      if (!result) return
      post.value = result.post
      liked.value = result.liked
    } finally {
      liking.value = false
    }
  }

  async function submitComment() {
    if (!post.value) return
    if (!auth.currentUser) {
      toast.add({
        severity: 'warn',
        summary: '请先登录',
        detail: '发表评论前需要选择 Mock 用户身份。',
        life: 2500,
      })
      return
    }

    const content = draft.value.trim()
    if (!content) {
      toast.add({
        severity: 'warn',
        summary: '内容为空',
        detail: '请输入评论内容。',
        life: 2000,
      })
      return
    }

    submitting.value = true
    try {
      const created = await createComment({
        postId: post.value.id,
        authorId: auth.currentUser.id,
        content,
      })
      if (!created) return

      draft.value = ''
      comments.value = [...comments.value, created]
      commentAuthors.value.set(auth.currentUser.id, auth.currentUser)
      post.value = {
        ...post.value,
        commentCount: post.value.commentCount + 1,
      }

      toast.add({
        severity: 'success',
        summary: '评论成功',
        life: 1800,
      })
    } finally {
      submitting.value = false
    }
  }

  watch(
    postId,
    () => {
      void load()
    },
    { immediate: true },
  )

  return {
    loading,
    submitting,
    liking,
    post,
    author,
    category,
    liked,
    draft,
    commentTree,
    toggleLike,
    submitComment,
    reload: load,
  }
}
