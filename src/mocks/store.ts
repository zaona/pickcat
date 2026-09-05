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
  seedPosts,
  seedUsers,
} from '@/mocks/data'
import type {
  Category,
  Comment,
  CommentInput,
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

/** 会话级可变状态 */
const db = {
  users: clone(seedUsers),
  categories: clone(seedCategories),
  posts: clone(seedPosts),
  comments: clone(seedComments),
  /** 当前用户已点赞的帖子 id 集合 */
  likedPostIds: new Set<string>(),
}

export const mockStore = {
  listUsers(): User[] {
    return clone(db.users)
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

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

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
  toggleLike(postId: string): { post: Post; liked: boolean } | undefined {
    const post = db.posts.find((item) => item.id === postId)
    if (!post) return undefined

    if (db.likedPostIds.has(postId)) {
      db.likedPostIds.delete(postId)
      post.likeCount = Math.max(0, post.likeCount - 1)
      return { post: clone(post), liked: false }
    }

    db.likedPostIds.add(postId)
    post.likeCount += 1
    return { post: clone(post), liked: true }
  },

  isLiked(postId: string): boolean {
    return db.likedPostIds.has(postId)
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
      createdAt: nowIso(),
    }
    db.comments.push(comment)
    post.commentCount += 1
    post.updatedAt = nowIso()
    return clone(comment)
  },
}
