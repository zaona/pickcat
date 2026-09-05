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
  seedFollows,
  seedNotifications,
  seedPosts,
  seedUsers,
} from '@/mocks/data'
import type {
  Category,
  Comment,
  CommentInput,
  FollowEdge,
  HeatmapDay,
  Notification,
  Paginated,
  Post,
  PostInput,
  PostListQuery,
  User,
  UserActivity,
  UserProfileDetail,
  UserProfileStats,
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
  follows: clone(seedFollows) as FollowEdge[],
  /** 当前会话已点赞的帖子 id（Mock 简化：不按用户分区） */
  likedPostIds: new Set<string>(),
  /** 当前会话已点赞的评论 id */
  likedCommentIds: new Set<string>(),
  /** 用户收藏：userId -> postId 集合 */
  bookmarkedByUser: new Map<string, Set<string>>(),
}

function toDateKey(iso: string) {
  return iso.slice(0, 10)
}

function buildHeatmapForUser(userId: string): HeatmapDay[] {
  const counts = new Map<string, number>()

  const bump = (iso: string, amount = 1) => {
    const key = toDateKey(iso)
    counts.set(key, (counts.get(key) ?? 0) + amount)
  }

  db.posts
    .filter((post) => post.authorId === userId)
    .forEach((post) => {
      bump(post.createdAt, 1)
      if (post.likeCount > 0) bump(post.createdAt, Math.min(post.likeCount, 8))
    })

  db.comments
    .filter((comment) => comment.authorId === userId)
    .forEach((comment) => {
      bump(comment.createdAt, 1)
      if (comment.likeCount > 0) {
        bump(comment.createdAt, Math.min(comment.likeCount, 5))
      }
    })

  db.follows
    .filter((edge) => edge.followerId === userId)
    .forEach((edge) => bump(edge.createdAt, 1))

  const days: HeatmapDay[] = []
  const end = new Date()
  end.setHours(12, 0, 0, 0)
  // 对齐到本周周日结束的约 53 周格子（含今天）
  const endDay = end.getDay()
  const start = new Date(end)
  start.setDate(start.getDate() - endDay - 52 * 7)

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10)
    days.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return days
}

function buildActivitiesForUser(userId: string): UserActivity[] {
  const activities: UserActivity[] = []

  db.posts
    .filter((post) => post.authorId === userId)
    .forEach((post) => {
      activities.push({
        id: `act_post_${post.id}`,
        userId,
        type: 'post',
        createdAt: post.createdAt,
        title: '发布了帖子',
        body: post.title,
        postId: post.id,
      })
      if (post.likeCount > 0) {
        activities.push({
          id: `act_like_post_${post.id}`,
          userId,
          type: 'like_received',
          createdAt: post.updatedAt,
          title: `帖子获得 ${post.likeCount} 个赞`,
          body: post.title,
          postId: post.id,
        })
      }
    })

  db.comments
    .filter((comment) => comment.authorId === userId)
    .forEach((comment) => {
      const post = db.posts.find((item) => item.id === comment.postId)
      activities.push({
        id: `act_cm_${comment.id}`,
        userId,
        type: 'comment',
        createdAt: comment.createdAt,
        title: comment.parentId ? '回复了评论' : '发表了评论',
        body: comment.content.slice(0, 80),
        postId: comment.postId,
      })
      if (comment.likeCount > 0) {
        activities.push({
          id: `act_like_cm_${comment.id}`,
          userId,
          type: 'like_received',
          createdAt: comment.createdAt,
          title: `评论获得 ${comment.likeCount} 个赞`,
          body: post ? `在「${post.title}」下` : comment.content.slice(0, 60),
          postId: comment.postId,
        })
      }
    })

  db.follows
    .filter((edge) => edge.followerId === userId)
    .forEach((edge) => {
      const target = db.users.find((user) => user.id === edge.followingId)
      activities.push({
        id: `act_follow_${edge.followerId}_${edge.followingId}_${edge.createdAt}`,
        userId,
        type: 'follow',
        createdAt: edge.createdAt,
        title: '关注了用户',
        body: target ? `${target.displayName} @${target.username}` : edge.followingId,
        targetUserId: edge.followingId,
      })
    })

  return activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

function statsForUser(userId: string): UserProfileStats {
  const posts = db.posts.filter((post) => post.authorId === userId)
  const comments = db.comments.filter((comment) => comment.authorId === userId)
  const likeReceivedCount =
    posts.reduce((sum, post) => sum + post.likeCount, 0) +
    comments.reduce((sum, comment) => sum + comment.likeCount, 0)

  return {
    postCount: posts.length,
    likeReceivedCount,
    followerCount: db.follows.filter((edge) => edge.followingId === userId).length,
    followingCount: db.follows.filter((edge) => edge.followerId === userId).length,
  }
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

  getUserProfile(
    userId: string,
    viewerId?: string | null,
  ): UserProfileDetail | undefined {
    const user = db.users.find((item) => item.id === userId)
    if (!user) return undefined

    const following = Boolean(
      viewerId &&
        viewerId !== userId &&
        db.follows.some(
          (edge) => edge.followerId === viewerId && edge.followingId === userId,
        ),
    )

    return {
      user: clone(user),
      stats: statsForUser(userId),
      following,
      heatmap: buildHeatmapForUser(userId),
      activities: buildActivitiesForUser(userId),
    }
  },

  isFollowing(followerId: string, followingId: string): boolean {
    return db.follows.some(
      (edge) =>
        edge.followerId === followerId && edge.followingId === followingId,
    )
  },

  toggleFollow(
    actorId: string,
    targetId: string,
  ): { following: boolean; stats: UserProfileStats } | undefined {
    if (actorId === targetId) return undefined
    const target = db.users.find((user) => user.id === targetId)
    const actor = db.users.find((user) => user.id === actorId)
    if (!target || !actor) return undefined

    const index = db.follows.findIndex(
      (edge) => edge.followerId === actorId && edge.followingId === targetId,
    )

    if (index >= 0) {
      db.follows.splice(index, 1)
      return { following: false, stats: statsForUser(targetId) }
    }

    db.follows.push({
      followerId: actorId,
      followingId: targetId,
      createdAt: nowIso(),
    })

    pushNotification({
      userId: targetId,
      type: 'system',
      title: '新增关注',
      body: `${actor.displayName} 关注了你`,
      actorId,
    })

    return { following: true, stats: statsForUser(targetId) }
  },

  listFollowers(userId: string): User[] {
    const ids = db.follows
      .filter((edge) => edge.followingId === userId)
      .map((edge) => edge.followerId)
    return db.users.filter((user) => ids.includes(user.id)).map((user) => clone(user))
  },

  listFollowing(userId: string): User[] {
    const ids = db.follows
      .filter((edge) => edge.followerId === userId)
      .map((edge) => edge.followingId)
    return db.users.filter((user) => ids.includes(user.id)).map((user) => clone(user))
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
        if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount
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

  /** 记录一次浏览并返回更新后的帖子 */
  recordPostView(id: string): Post | undefined {
    const post = db.posts.find((item) => item.id === id)
    if (!post) return undefined
    post.viewCount += 1
    return clone(post)
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
      viewCount: 0,
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
