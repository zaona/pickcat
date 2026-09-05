<script setup lang="ts">
/**
 * 帖子详情页
 *
 * 桌面：左正文/评论，右上作者信息 + 右下文章目录
 * 移动端：作者信息在标题下，正文与评论通栏（无侧栏目录）
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CommentThread from '@/components/CommentThread.vue'
import AppIcon from '@/components/AppIcon.vue'
import { commentSortOptions, usePostDetail } from '@/composables/usePostDetail'

interface TocItem {
  id: string
  label: string
}

const route = useRoute()
const router = useRouter()

const postId = computed(() => String(route.params.id ?? ''))

const {
  loading,
  submitting,
  liking,
  bookmarking,
  sharing,
  likingCommentIds,
  post,
  author,
  category,
  liked,
  bookmarked,
  draft,
  commentSort,
  commentTree,
  replyTarget,
  toggleLike,
  toggleBookmark,
  sharePost,
  startReply,
  cancelReply,
  toggleCommentLike,
  submitComment,
} = usePostDetail(() => postId.value)

const createdLabel = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.createdAt).toLocaleString('zh-CN')
})

const joinedLabel = computed(() => {
  if (!author.value) return ''
  return new Date(author.value.createdAt).toLocaleDateString('zh-CN')
})

/** 按空行切分正文段落，供渲染与目录锚点 */
const contentBlocks = computed(() => {
  if (!post.value) return [] as string[]
  const blocks = post.value.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
  return blocks.length > 0 ? blocks : [post.value.content]
})

/** 文章目录：正文段落摘要 + 评论（不再单独放「正文」，避免与首段重复） */
const tocItems = computed<TocItem[]>(() => {
  const items: TocItem[] = contentBlocks.value.map((block, index) => {
    const plain = block.replace(/\s+/g, ' ')
    const label = plain.length > 20 ? `${plain.slice(0, 20)}…` : plain
    return { id: `sec-${index + 1}`, label }
  })
  items.push({ id: 'post-comments', label: '评论' })
  return items
})

function openAuthor() {
  if (!author.value) return
  router.push({ name: 'user', params: { id: author.value.id } })
}

/** 锚点跳转：先 blur，避免 sticky 侧栏内焦点元素抢滚动导致跳动 */
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const active = document.activeElement
  if (active instanceof HTMLElement) active.blur()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="stack-md">
    <div v-if="loading" class="post-layout">
      <div class="post-main stack-md">
        <!-- 移动端作者卡骨架 -->
        <div class="mobile-only">
          <Card>
            <template #content>
              <div class="row">
                <Skeleton shape="circle" size="3rem" />
                <div class="stack-sm grow" style="gap: 0.4rem">
                  <Skeleton width="8rem" height="1rem" />
                  <Skeleton width="5rem" height="0.85rem" />
                </div>
              </div>
            </template>
          </Card>
        </div>

        <Card>
          <template #title>
            <Skeleton width="70%" height="1.75rem" />
          </template>
          <template #subtitle>
            <div class="stack-sm" style="gap: 0.5rem">
              <Skeleton width="10rem" height="0.9rem" />
              <Skeleton width="4.5rem" height="1.5rem" border-radius="1rem" />
            </div>
          </template>
          <template #content>
            <div class="stack-sm">
              <Skeleton width="100%" height="1rem" />
              <Skeleton width="95%" height="1rem" />
              <Skeleton width="88%" height="1rem" />
              <Skeleton width="100%" height="1rem" />
              <Skeleton width="72%" height="1rem" />
            </div>
          </template>
          <template #footer>
            <div class="row-wrap">
              <Skeleton width="7rem" height="2.5rem" border-radius="0.75rem" />
              <Skeleton width="6rem" height="1rem" />
            </div>
          </template>
        </Card>

        <Skeleton width="4rem" height="1.5rem" />

        <Card>
          <template #title>
            <Skeleton width="6rem" height="1.25rem" />
          </template>
          <template #content>
            <Skeleton width="100%" height="6rem" border-radius="0.75rem" />
          </template>
        </Card>
      </div>

      <!-- 桌面侧栏骨架：desktop-only 与 flex 布局拆开，避免显隐被盖住 -->
      <aside class="desktop-only post-aside">
        <Card>
          <template #content>
            <div class="stack-sm">
              <Skeleton shape="circle" size="4rem" />
              <Skeleton width="70%" height="1.1rem" />
              <Skeleton width="50%" height="0.9rem" />
              <Skeleton width="100%" height="3rem" />
            </div>
          </template>
        </Card>
        <Card>
          <template #title>
            <Skeleton width="5rem" height="1.1rem" />
          </template>
          <template #content>
            <div class="stack-sm" style="gap: 0.5rem">
              <Skeleton width="100%" height="1rem" />
              <Skeleton width="90%" height="1rem" />
              <Skeleton width="80%" height="1rem" />
            </div>
          </template>
        </Card>
      </aside>
    </div>

    <div v-else-if="!post" class="stack-sm">
      <Message severity="error" :closable="false">
        未找到该帖子，可能已被删除或 ID 无效。
      </Message>
      <Button label="返回首页" @click="router.push({ name: 'home' })">
        <template #icon="{ class: iconClass }">
          <AppIcon name="home" :class="iconClass" :size="16" />
        </template>
      </Button>
    </div>

    <div v-else class="post-layout">
      <!-- 左：标题 + 正文 + 评论 -->
      <div class="post-main stack-md">
        <!-- 移动端作者信息 -->
        <div v-if="author" class="mobile-only">
          <Card class="author-card" @click="openAuthor">
            <template #content>
              <div class="row">
                <Avatar
                  :label="author.displayName.slice(0, 1)"
                  shape="circle"
                  size="large"
                />
                <div class="stack-sm" style="gap: 0.15rem">
                  <strong>{{ author.displayName }}</strong>
                  <span class="muted">@{{ author.username }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <Card>
          <template #title>
            <h1 class="post-title">{{ post.title }}</h1>
          </template>
          <template #subtitle>
            <div class="stack-sm" style="gap: 0.5rem">
              <span class="muted">{{ createdLabel }}</span>
              <div v-if="category">
                <Tag :value="category.name" severity="info" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="stack-sm">
              <p
                v-for="(block, index) in contentBlocks"
                :id="`sec-${index + 1}`"
                :key="index"
                class="content-block"
              >
                {{ block }}
              </p>
            </div>
          </template>
          <template #footer>
            <div class="row-wrap">
              <Button
                :label="liked ? `已赞 ${post.likeCount}` : `点赞 ${post.likeCount}`"
                :loading="liking"
                :severity="liked ? 'danger' : 'secondary'"
                outlined
                @click="toggleLike"
              >
                <template #icon="{ class: iconClass }">
                  <AppIcon
                    :name="liked ? 'heartFilled' : 'heart'"
                    :class="iconClass"
                    :size="16"
                  />
                </template>
              </Button>
              <Button
                :label="
                  bookmarked
                    ? `已收藏 ${post.bookmarkCount}`
                    : `收藏 ${post.bookmarkCount}`
                "
                :loading="bookmarking"
                :severity="bookmarked ? 'warn' : 'secondary'"
                outlined
                @click="toggleBookmark"
              >
                <template #icon="{ class: iconClass }">
                  <AppIcon
                    :name="bookmarked ? 'bookmarkFilled' : 'bookmark'"
                    :class="iconClass"
                    :size="16"
                  />
                </template>
              </Button>
              <Button
                label="分享"
                :loading="sharing"
                severity="secondary"
                outlined
                @click="sharePost"
              >
                <template #icon="{ class: iconClass }">
                  <AppIcon name="share" :class="iconClass" :size="16" />
                </template>
              </Button>
              <span class="muted comment-count">
                <AppIcon name="eye" :size="14" /> {{ post.viewCount }} 次浏览
              </span>
              <span class="muted comment-count">
                <AppIcon name="comments" :size="14" /> {{ post.commentCount }}
                条评论
              </span>
            </div>
          </template>
        </Card>

        <Divider />

        <section id="post-comments" class="stack-md">
          <div class="comments-heading row-wrap">
            <h2 class="comments-title">评论</h2>
            <SelectButton
              v-model="commentSort"
              :options="commentSortOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
            />
          </div>

          <Card id="comment-composer">
            <template #title>
              {{ replyTarget ? `回复 @${replyTarget.displayName}` : '发表评论' }}
            </template>
            <template #content>
              <div class="stack-sm">
                <div v-if="replyTarget" class="row-wrap">
                  <Tag
                    :value="`回复 ${replyTarget.displayName}`"
                    severity="info"
                  />
                  <Button
                    label="取消回复"
                    link
                    size="small"
                    @click="cancelReply"
                  />
                </div>
                <Textarea
                  v-model="draft"
                  rows="4"
                  auto-resize
                  :placeholder="
                    replyTarget
                      ? `回复 @${replyTarget.displayName}…`
                      : '友善发言，理性讨论…'
                  "
                  style="width: 100%"
                />
                <div class="row">
                  <div class="grow" />
                  <Button
                    :label="replyTarget ? '提交回复' : '提交评论'"
                    :loading="submitting"
                    @click="submitComment"
                  >
                    <template #icon="{ class: iconClass }">
                      <AppIcon name="send" :class="iconClass" :size="16" />
                    </template>
                  </Button>
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
              :liking-ids="likingCommentIds"
              @like="toggleCommentLike"
              @reply="startReply"
            />
          </div>
        </section>
      </div>

      <!-- 右：作者 + 目录 -->
      <aside class="desktop-only post-aside">
        <Card v-if="author" class="author-card" @click="openAuthor">
          <template #title>
            <div class="stack-sm" style="align-items: flex-start">
              <Avatar
                :label="author.displayName.slice(0, 1)"
                shape="circle"
                size="xlarge"
              />
              <div class="stack-sm" style="gap: 0.25rem">
                <span>{{ author.displayName }}</span>
                <span class="muted">@{{ author.username }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <p style="margin: 0 0 0.75rem">{{ author.bio }}</p>
            <p class="muted" style="margin: 0">加入于 {{ joinedLabel }}</p>
          </template>
        </Card>

        <Card>
          <template #title>文章目录</template>
          <template #content>
            <nav class="toc-list" aria-label="文章目录">
              <a
                v-for="item in tocItems"
                :key="item.id"
                class="toc-item"
                :href="`#${item.id}`"
                @click.prevent="scrollToSection(item.id)"
              >
                {{ item.label }}
              </a>
            </nav>
          </template>
        </Card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.author-card {
  cursor: pointer;
}

.comment-count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.comments-heading {
  justify-content: space-between;
}

.comments-title {
  margin: 0;
  font-size: 1.25rem;
  /* 与下方 Card 标题左右内边距对齐 */
  padding-inline-start: 1.125rem;
}

.post-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.35;
}

/* 避开常驻顶栏，锚点跳转不被遮挡 */
.content-block,
#post-comments {
  scroll-margin-top: 5rem;
}

.content-block {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
}

.toc-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.15rem;
}

.toc-item {
  display: block;
  padding: 0.4rem 0.5rem;
  margin-inline: -0.5rem;
  border-radius: var(--p-content-border-radius);
  color: var(--p-text-muted-color);
  text-align: left;
  line-height: 1.4;
  transition: color 0.15s ease, background 0.15s ease;
}

.toc-item:hover {
  color: var(--p-primary-color);
  background: var(--p-content-hover-background);
}

.toc-item:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 1px;
}
</style>
