/**
 * 帖子详情与评论组合逻辑
 */
import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

import {
  createComment,
  fetchCommentLiked,
  fetchCommentsByPost,
  toggleCommentLike as toggleCommentLikeApi,
} from '@/services/commentService'
import { fetchCategoryById } from '@/services/categoryService'
import {
  fetchPostBookmarked,
  fetchPostById,
  fetchPostLiked,
  togglePostBookmark,
  togglePostLike,
} from '@/services/postService'
import { fetchUserById } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import type { Category, Comment, FeedSort, Post, User } from '@/types'

export interface CommentNode extends Comment {
  author?: User
  liked: boolean
  children: CommentNode[]
}

export interface ReplyTarget {
  /** 写入 parentId 的根评论 id（仅一层回复） */
  rootId: string
  /** 被回复者展示名 */
  displayName: string
}

export const commentSortOptions: { label: string; value: FeedSort }[] = [
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'hot' },
]

export function usePostDetail(postId: () => string) {
  const toast = useToast()
  const auth = useAuthStore()

  const loading = ref(true)
  const submitting = ref(false)
  const liking = ref(false)
  const bookmarking = ref(false)
  const sharing = ref(false)
  const likingCommentIds = ref<Set<string>>(new Set())

  const post = ref<Post | null>(null)
  const author = ref<User | null>(null)
  const category = ref<Category | null>(null)
  const liked = ref(false)
  const bookmarked = ref(false)
  const comments = ref<Comment[]>([])
  const commentLikedMap = ref<Map<string, boolean>>(new Map())
  const commentAuthors = ref<Map<string, User>>(new Map())
  const commentSort = ref<FeedSort>('latest')
  const replyTarget = ref<ReplyTarget | null>(null)

  const draft = ref('')

  const commentTree = computed<CommentNode[]>(() => {
    const nodes = new Map<string, CommentNode>()
    comments.value.forEach((item) => {
      nodes.set(item.id, {
        ...item,
        author: commentAuthors.value.get(item.authorId),
        liked: commentLikedMap.value.get(item.id) ?? false,
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

    nodes.forEach((node) => {
      node.children.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    })

    roots.sort((a, b) => {
      if (commentSort.value === 'hot') {
        if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount
        if (b.children.length !== a.children.length) {
          return b.children.length - a.children.length
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return roots
  })

  async function loadCommentLikes(commentList: Comment[]) {
    const entries = await Promise.all(
      commentList.map(async (item) => {
        const likedState = await fetchCommentLiked(item.id)
        return [item.id, likedState] as const
      }),
    )
    const map = new Map<string, boolean>()
    entries.forEach(([id, state]) => map.set(id, state))
    commentLikedMap.value = map
  }

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
      replyTarget.value = null
      draft.value = ''

      await loadCommentLikes(commentList)

      if (auth.currentUser && postData) {
        bookmarked.value = await fetchPostBookmarked(auth.currentUser.id, id)
      } else {
        bookmarked.value = false
      }

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

  function requireLogin(action: string) {
    if (auth.currentUser) return true
    toast.add({
      severity: 'warn',
      summary: '请先登录',
      detail: `${action}前需要选择 Mock 用户身份。`,
      life: 2500,
    })
    return false
  }

  async function toggleLike() {
    if (!post.value) return
    if (!requireLogin('点赞')) return

    liking.value = true
    try {
      const result = await togglePostLike(post.value.id, auth.currentUser!.id)
      if (!result) return
      post.value = result.post
      liked.value = result.liked
    } finally {
      liking.value = false
    }
  }

  async function toggleBookmark() {
    if (!post.value) return
    if (!requireLogin('收藏')) return

    bookmarking.value = true
    try {
      const result = await togglePostBookmark(auth.currentUser!.id, post.value.id)
      if (!result) return
      post.value = result.post
      bookmarked.value = result.bookmarked
      toast.add({
        severity: 'success',
        summary: result.bookmarked ? '已收藏' : '已取消收藏',
        life: 1600,
      })
    } finally {
      bookmarking.value = false
    }
  }

  async function sharePost() {
    if (!post.value) return
    sharing.value = true
    try {
      const url = `${window.location.origin}/posts/${post.value.id}`
      const title = post.value.title

      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text: title, url })
        toast.add({ severity: 'success', summary: '已调起分享', life: 1600 })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.add({
          severity: 'success',
          summary: '链接已复制',
          detail: url,
          life: 2200,
        })
        return
      }

      toast.add({
        severity: 'info',
        summary: '请手动复制链接',
        detail: url,
        life: 4000,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.add({
        severity: 'error',
        summary: '分享失败',
        life: 2000,
      })
    } finally {
      sharing.value = false
    }
  }

  function startReply(node: CommentNode) {
    if (!requireLogin('回复')) return
    const rootId = node.parentId ?? node.id
    replyTarget.value = {
      rootId,
      displayName: node.author?.displayName ?? '未知用户',
    }
    document.getElementById('comment-composer')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  function cancelReply() {
    replyTarget.value = null
  }

  async function toggleCommentLike(commentId: string) {
    if (!requireLogin('点赞评论')) return
    if (likingCommentIds.value.has(commentId)) return

    const next = new Set(likingCommentIds.value)
    next.add(commentId)
    likingCommentIds.value = next

    try {
      const result = await toggleCommentLikeApi(commentId, auth.currentUser!.id)
      if (!result) return
      comments.value = comments.value.map((item) =>
        item.id === commentId ? result.comment : item,
      )
      const likedMap = new Map(commentLikedMap.value)
      likedMap.set(commentId, result.liked)
      commentLikedMap.value = likedMap
    } finally {
      const done = new Set(likingCommentIds.value)
      done.delete(commentId)
      likingCommentIds.value = done
    }
  }

  async function submitComment() {
    if (!post.value) return
    if (!requireLogin('发表评论')) return

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
        authorId: auth.currentUser!.id,
        content,
        parentId: replyTarget.value?.rootId ?? null,
      })
      if (!created) return

      draft.value = ''
      replyTarget.value = null
      comments.value = [...comments.value, created]
      commentAuthors.value.set(auth.currentUser!.id, auth.currentUser!)
      const likedMap = new Map(commentLikedMap.value)
      likedMap.set(created.id, false)
      commentLikedMap.value = likedMap
      post.value = {
        ...post.value,
        commentCount: post.value.commentCount + 1,
      }

      toast.add({
        severity: 'success',
        summary: created.parentId ? '回复成功' : '评论成功',
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

  watch(
    () => auth.currentUserId,
    () => {
      void load()
    },
  )

  return {
    loading,
    submitting,
    liking,
    bookmarking,
    sharing,
    likingCommentIds,
    post,
    author,
    category,
    liked,
    bookmarked,
    draft,
    commentSort,
    commentTree,
    replyTarget,
    toggleLike,
    toggleBookmark,
    sharePost,
    startReply,
    cancelReply,
    toggleCommentLike,
    submitComment,
    reload: load,
  }
}
