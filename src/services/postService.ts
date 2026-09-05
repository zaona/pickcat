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
  return mockStore.getPost(id) ?? null
}

export async function createPost(input: PostInput): Promise<Post> {
  await delay()
  return mockStore.createPost(input)
}

export async function togglePostLike(
  postId: string,
): Promise<{ post: Post; liked: boolean } | null> {
  await delay(160)
  return mockStore.toggleLike(postId) ?? null
}

export async function fetchPostLiked(postId: string): Promise<boolean> {
  await delay(80)
  return mockStore.isLiked(postId)
}
