/**
 * 评论服务
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import type { Comment, CommentInput } from '@/types'

export async function fetchCommentsByPost(postId: string): Promise<Comment[]> {
  await delay()
  return mockStore.listCommentsByPost(postId)
}

export async function createComment(input: CommentInput): Promise<Comment | null> {
  await delay()
  return mockStore.createComment(input) ?? null
}
