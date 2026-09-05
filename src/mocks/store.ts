/**
 * 内存 Mock Store
 *
 * 在浏览器会话内持有可变数据，模拟后端数据库。
 * services 层应只通过本模块读写，页面不要直接依赖。
 *
 * 替换真实 API 时：删除对本文件的引用即可，保留 services 对外方法签名。
 */
import {
  seedCategories,
  seedComments,
  seedNotifications,
  seedPosts,
  seedUsers,
} from '@/mocks/data'
import type {
  Category,
  Comment,
  CommentInput,
  Notification,
  Paginated,
  Post,
  PostInput,
  PostListQuery,
  User,
} from '@/types'

function clone<T>(value: T): T {
  return structuredClone(value)
}

function nowIso() {
  return new Date().toISOString()
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function bookmarksFor(userId: string): Set<string> {
  let set = db.bookmarkedByUser.get(userId)
  if (!set) {
    set = new Set()
    db.bookmarkedByUser.set(userId, set)
  }
  return set
}

function pushNotification(
  input: Omit<Notification, 'id' | 'createdAt' | 'read'> & {
    read?: boolean
  },
) {
  db.notifications.unshift({
    id: createId('n'),
    read: input.read ?? false,
    createdAt: nowIso(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    postId: input.postId ?? null,
    actorId: input.actorId ?? null,
  })
}

/** 会话级可变状态 */
const db = {
  users: clone(seedUsers),
  categories: clone(seedCategories),
  posts: clone(seedPosts),
  comments: clone(seedComments),
  notifications: clone(seedNotifications),
  /** 当前会话已点赞的帖子 id（Mock 简化：不按用户分区） */
  likedPostIds: new Set<string>(),
  /** 当前会话已点赞的评论 id */
  likedCommentIds: new Set<string>(),
  /** 用户收藏：userId -> postId 集合 */
  bookmarkedByUser: new Map<string, Set<string>>(),
}

export const mockStore = {
  listUsers(): User[] {
    return clone(db.users)
  },

  /**
   * 按用户名 / 展示名 / 简介模糊搜索用户
   */
  searchUsers(keyword: string): User[] {
    const q = keyword.trim().toLowerCase()
    if (!q) return []
    return db.users
      .filter(
        (user) =>
          user.username.toLowerCase().includes(q) ||
          user.displayName.toLowerCase().includes(q) ||
          user.bio.toLowerCase().includes(q),
      )
      .map((user) => clone(user))
  },

  getUser(id: string): User | undefined {
    const user = db.users.find((item) => item.id === id)
    return user ? clone(user) : undefined
  },

  listCategories(): Category[] {
    return clone(db.categories)
  },

  getCategory(id: string): Category | undefined {
    const category = db.categories.find((item) => item.id === id)
    return category ? clone(category) : undefined
  },

  listPosts(query: PostListQuery = {}): Paginated<Post> {
    const page = query.page && query.page > 0 ? query.page : 1
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 10
    const keyword = query.keyword?.trim().toLowerCase() ?? ''

    let filtered = [...db.posts]

    if (query.categoryId) {
      filtered = filtered.filter((post) => post.categoryId === query.categoryId)
    }
    if (query.authorId) {
      filtered = filtered.filter((post) => post.authorId === query.authorId)
    }
    if (keyword) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword),
      )
    }

    filtered.sort((a, b) => {
      if (query.sort === 'hot') {
        if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount
        if (b.commentCount !== a.commentCount) return b.commentCount - a.commentCount
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize).map((item) => clone(item))

    return { items, total, page, pageSize }
  },

  getPost(id: string): Post | undefined {
    const post = db.posts.find((item) => item.id === id)
    return post ? clone(post) : undefined
  },

  createPost(input: PostInput): Post {
    const timestamp = nowIso()
    const post: Post = {
      id: createId('p'),
      title: input.title.trim(),
      content: input.content.trim(),
      categoryId: input.categoryId,
      authorId: input.authorId,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.posts.unshift(post)
    return clone(post)
  },

  /**
   * 切换点赞：同一帖子再次调用会取消点赞。
   * @returns 更新后的帖子与当前是否已赞
   */
  toggleLike(
    postId: string,
    actorId?: string | null,
  ): { post: Post; liked: boolean } | undefined {
    const post = db.posts.find((item) => item.id === postId)
    if (!post) return undefined

    if (db.likedPostIds.has(postId)) {
      db.likedPostIds.delete(postId)
      post.likeCount = Math.max(0, post.likeCount - 1)
      return { post: clone(post), liked: false }
    }

    db.likedPostIds.add(postId)
    post.likeCount += 1

    if (actorId && actorId !== post.authorId) {
      const actor = db.users.find((u) => u.id === actorId)
      pushNotification({
        userId: post.authorId,
        type: 'like',
        title: '帖子被点赞',
        body: `${actor?.displayName ?? '有人'} 赞了你的帖子「${post.title}」`,
        postId: post.id,
        actorId,
      })
    }

    return { post: clone(post), liked: true }
  },

  isLiked(postId: string): boolean {
    return db.likedPostIds.has(postId)
  },

  toggleBookmark(
    userId: string,
    postId: string,
  ): { post: Post; bookmarked: boolean } | undefined {
    const post = db.posts.find((item) => item.id === postId)
    if (!post) return undefined

    const set = bookmarksFor(userId)
    if (set.has(postId)) {
      set.delete(postId)
      post.bookmarkCount = Math.max(0, post.bookmarkCount - 1)
      return { post: clone(post), bookmarked: false }
    }

    set.add(postId)
    post.bookmarkCount += 1
    return { post: clone(post), bookmarked: true }
  },

  isBookmarked(userId: string, postId: string): boolean {
    return bookmarksFor(userId).has(postId)
  },

  listBookmarkedPosts(userId: string): Post[] {
    const ids = bookmarksFor(userId)
    return db.posts
      .filter((post) => ids.has(post.id))
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .map((item) => clone(item))
  },

  listCommentsByPost(postId: string): Comment[] {
    return db.comments
      .filter((item) => item.postId === postId)
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((item) => clone(item))
  },

  createComment(input: CommentInput): Comment | undefined {
    const post = db.posts.find((item) => item.id === input.postId)
    if (!post) return undefined

    const comment: Comment = {
      id: createId('cm'),
      postId: input.postId,
      authorId: input.authorId,
      content: input.content.trim(),
      parentId: input.parentId ?? null,
      likeCount: 0,
      createdAt: nowIso(),
    }
    db.comments.push(comment)
    post.commentCount += 1
    post.updatedAt = nowIso()

    const actor = db.users.find((u) => u.id === input.authorId)
    if (input.parentId) {
      const parent = db.comments.find((item) => item.id === input.parentId)
      if (parent && parent.authorId !== input.authorId) {
        pushNotification({
          userId: parent.authorId,
          type: 'reply',
          title: '收到新回复',
          body: `${actor?.displayName ?? '有人'} 回复了你的评论`,
          postId: post.id,
          actorId: input.authorId,
        })
      }
    } else if (input.authorId !== post.authorId) {
      pushNotification({
        userId: post.authorId,
        type: 'comment',
        title: '收到新评论',
        body: `${actor?.displayName ?? '有人'} 评论了你的帖子「${post.title}」`,
        postId: post.id,
        actorId: input.authorId,
      })
    }

    return clone(comment)
  },

  toggleCommentLike(
    commentId: string,
    actorId?: string | null,
  ): { comment: Comment; liked: boolean } | undefined {
    const comment = db.comments.find((item) => item.id === commentId)
    if (!comment) return undefined

    if (db.likedCommentIds.has(commentId)) {
      db.likedCommentIds.delete(commentId)
      comment.likeCount = Math.max(0, comment.likeCount - 1)
      return { comment: clone(comment), liked: false }
    }

    db.likedCommentIds.add(commentId)
    comment.likeCount += 1

    if (actorId && actorId !== comment.authorId) {
      const actor = db.users.find((u) => u.id === actorId)
      const post = db.posts.find((p) => p.id === comment.postId)
      pushNotification({
        userId: comment.authorId,
        type: 'like',
        title: '评论被点赞',
        body: `${actor?.displayName ?? '有人'} 赞了你在「${post?.title ?? '帖子'}」下的评论`,
        postId: comment.postId,
        actorId,
      })
    }

    return { comment: clone(comment), liked: true }
  },

  isCommentLiked(commentId: string): boolean {
    return db.likedCommentIds.has(commentId)
  },

  listNotifications(userId: string): Notification[] {
    return db.notifications
      .filter((item) => item.userId === userId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((item) => clone(item))
  },

  countUnreadNotifications(userId: string): number {
    return db.notifications.filter((item) => item.userId === userId && !item.read)
      .length
  },

  markNotificationRead(userId: string, id: string): Notification | undefined {
    const item = db.notifications.find((n) => n.id === id && n.userId === userId)
    if (!item) return undefined
    item.read = true
    return clone(item)
  },

  markAllNotificationsRead(userId: string): number {
    let count = 0
    db.notifications.forEach((item) => {
      if (item.userId === userId && !item.read) {
        item.read = true
        count += 1
      }
    })
    return count
  },
}
