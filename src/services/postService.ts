/**
 * 帖子服务
 *
 * 页面 / composable 只依赖本文件导出的方法。
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import type { Paginated, Post, PostInput, PostListQuery } from '@/types'

export async function fetchPosts(query: PostListQuery = {}): Promise<Paginated<Post>> {
  await delay()
  return mockStore.listPosts(query)
}

export async function fetchPostById(id: string): Promise<Post | null> {
  await delay()
  // 进入详情即计一次浏览（Mock 会话内累加）
  return mockStore.recordPostView(id) ?? null
}

export async function createPost(input: PostInput): Promise<Post> {
  await delay()
  return mockStore.createPost(input)
}

export async function togglePostLike(
  postId: string,
  actorId?: string | null,
): Promise<{ post: Post; liked: boolean } | null> {
  await delay(160)
  return mockStore.toggleLike(postId, actorId) ?? null
}

export async function fetchPostLiked(postId: string): Promise<boolean> {
  await delay(80)
  return mockStore.isLiked(postId)
}

export async function togglePostBookmark(
  userId: string,
  postId: string,
): Promise<{ post: Post; bookmarked: boolean } | null> {
  await delay(160)
  return mockStore.toggleBookmark(userId, postId) ?? null
}

export async function fetchPostBookmarked(
  userId: string,
  postId: string,
): Promise<boolean> {
  await delay(80)
  return mockStore.isBookmarked(userId, postId)
}

export async function fetchBookmarkedPosts(userId: string): Promise<Post[]> {
  await delay()
  return mockStore.listBookmarkedPosts(userId)
}
