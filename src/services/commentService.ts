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

export async function toggleCommentLike(
  commentId: string,
  actorId?: string | null,
): Promise<{ comment: Comment; liked: boolean } | null> {
  await delay(140)
  return mockStore.toggleCommentLike(commentId, actorId) ?? null
}

export async function fetchCommentLiked(commentId: string): Promise<boolean> {
  await delay(40)
  return mockStore.isCommentLiked(commentId)
}
