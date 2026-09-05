/**
 * 领域类型定义
 *
 * 与 Mock / services 层共享；接入真实后端时，请保持字段语义兼容。
 */

import type { IconName } from '@/icons/registry'

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
  /** MingCute IconName，见 src/icons/registry.ts */
  icon: IconName
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
  bookmarkCount: number
  /** 浏览量 */
  viewCount: number
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
  likeCount: number
  createdAt: string
}

/** 通知类型 */
export type NotificationType = 'comment' | 'reply' | 'like' | 'system'

/** 消息中心通知 */
export interface Notification {
  id: string
  /** 接收者 */
  userId: string
  type: NotificationType
  title: string
  body: string
  postId?: string | null
  actorId?: string | null
  read: boolean
  createdAt: string
}

/** 列表排序：最新 / 最热 */
export type FeedSort = 'latest' | 'hot'

/** 列表查询参数 */
export interface PostListQuery {
  categoryId?: string | null
  keyword?: string
  page?: number
  pageSize?: number
  authorId?: string
  /** 默认 latest */
  sort?: FeedSort
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

/** 个人主页统计 */
export interface UserProfileStats {
  postCount: number
  /** 帖子赞 + 评论赞 */
  likeReceivedCount: number
  followerCount: number
  followingCount: number
}

/** 个人动态类型 */
export type UserActivityType = 'post' | 'comment' | 'like_received' | 'follow'

/** 个人动态条目 */
export interface UserActivity {
  id: string
  userId: string
  type: UserActivityType
  createdAt: string
  title: string
  body?: string
  postId?: string | null
  targetUserId?: string | null
}

/** 热力图按日计数 */
export interface HeatmapDay {
  date: string
  count: number
}

/** 关注关系边 */
export interface FollowEdge {
  followerId: string
  followingId: string
  createdAt: string
}

/** 个人主页聚合详情 */
export interface UserProfileDetail {
  user: User
  stats: UserProfileStats
  /** 当前登录用户是否已关注该主页用户 */
  following: boolean
  heatmap: HeatmapDay[]
  activities: UserActivity[]
}
