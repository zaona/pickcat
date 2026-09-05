<script setup lang="ts">
/**
 * 帖子详情页
 *
 * 展示正文、点赞、评论树与发表评论表单。
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CommentThread from '@/components/CommentThread.vue'
import { usePostDetail } from '@/composables/usePostDetail'

const route = useRoute()
const router = useRouter()

const postId = computed(() => String(route.params.id ?? ''))

const {
  loading,
  submitting,
  liking,
  post,
  author,
  category,
  liked,
  draft,
  commentTree,
  toggleLike,
  submitComment,
} = usePostDetail(() => postId.value)

const createdLabel = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.createdAt).toLocaleString('zh-CN')
})

function openAuthor() {
  if (!author.value) return
  router.push({ name: 'user', params: { id: author.value.id } })
}
</script>

<template>
  <section class="stack-md">
    <div v-if="loading" class="stack-md">
      <Skeleton width="70%" height="2rem" />
      <Skeleton width="40%" height="1rem" />
      <Skeleton width="100%" height="8rem" />
    </div>

    <div v-else-if="!post" class="stack-sm">
      <Message severity="error" :closable="false">
        未找到该帖子，可能已被删除或 ID 无效。
      </Message>
      <Button
        label="返回首页"
        icon="pi pi-home"
        @click="router.push({ name: 'home' })"
      />
    </div>

    <template v-else>
      <header class="stack-sm">
        <div class="row-wrap">
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            rounded
            aria-label="返回"
            @click="router.back()"
          />
          <Tag v-if="category" :value="category.name" severity="info" />
        </div>
        <h1 style="margin: 0">{{ post.title }}</h1>
        <div class="row-wrap">
          <Button
            v-if="author"
            :label="author.displayName"
            link
            @click="openAuthor"
          />
          <span class="muted">{{ createdLabel }}</span>
        </div>
      </header>

      <Card>
        <template #content>
          <p style="white-space: pre-wrap; margin: 0; line-height: 1.7">
            {{ post.content }}
          </p>
        </template>
        <template #footer>
          <div class="row-wrap">
            <Button
              :label="liked ? `已赞 ${post.likeCount}` : `点赞 ${post.likeCount}`"
              :icon="liked ? 'pi pi-heart-fill' : 'pi pi-heart'"
              :loading="liking"
              :severity="liked ? 'danger' : 'secondary'"
              outlined
              @click="toggleLike"
            />
            <span class="muted">
              <i class="pi pi-comments" /> {{ post.commentCount }} 条评论
            </span>
          </div>
        </template>
      </Card>

      <Divider />

      <section class="stack-md">
        <h2 style="margin: 0; font-size: 1.25rem">评论</h2>

        <Card>
          <template #title>发表评论</template>
          <template #content>
            <div class="stack-sm">
              <Textarea
                v-model="draft"
                rows="4"
                auto-resize
                placeholder="友善发言，理性讨论…"
                style="width: 100%"
              />
              <div class="row">
                <div class="grow" />
                <Button
                  label="提交评论"
                  icon="pi pi-send"
                  :loading="submitting"
                  @click="submitComment"
                />
              </div>
            </div>
          </template>
        </Card>

        <Message
          v-if="commentTree.length === 0"
          severity="secondary"
          :closable="false"
        >
          还没有评论，来抢沙发吧。
        </Message>

        <div v-else class="stack-md">
          <CommentThread
            v-for="node in commentTree"
            :key="node.id"
            :node="node"
          />
        </div>
      </section>
    </template>
  </section>
</template>
