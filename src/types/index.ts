/**
 * 领域类型定义
 *
 * 与 Mock / services 层共享；接入真实后端时，请保持字段语义兼容。
 */

/** 社区用户 */
export interface User {
  id: string
  /** 登录名 / 唯一句柄 */
  username: string
  /** 展示名 */
  displayName: string
  /** 一句话简介 */
  bio: string
  /** 头像文案回退（无图片 URL 时用首字） */
  avatarUrl?: string
  createdAt: string
}

/** 帖子分类 */
export interface Category {
  id: string
  name: string
  description: string
}

/** 帖子 */
export interface Post {
  id: string
  title: string
  content: string
  categoryId: string
  authorId: string
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

/** 评论（支持一层 parentId 回复） */
export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  parentId: string | null
  createdAt: string
}

/** 列表查询参数 */
export interface PostListQuery {
  categoryId?: string | null
  keyword?: string
  page?: number
  pageSize?: number
  authorId?: string
}

/** 分页结果 */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 发帖 / 编辑载荷 */
export interface PostInput {
  title: string
  content: string
  categoryId: string
  authorId: string
}

/** 评论载荷 */
export interface CommentInput {
  postId: string
  authorId: string
  content: string
  parentId?: string | null
}
