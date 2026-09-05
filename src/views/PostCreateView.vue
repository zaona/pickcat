<script setup lang="ts">
/**
 * 发帖页
 *
 * 依赖 Mock 登录态；提交成功后跳转详情页。
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import { fetchCategories } from '@/services/categoryService'
import { createPost } from '@/services/postService'
import { useAuthStore } from '@/stores/auth'
import type { Category } from '@/types'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()

const loadingMeta = ref(true)
const submitting = ref(false)
const categories = ref<Category[]>([])

const title = ref('')
const content = ref('')
const categoryId = ref<string | null>(null)

const canSubmit = computed(
  () =>
    Boolean(auth.currentUser) &&
    title.value.trim().length > 0 &&
    content.value.trim().length > 0 &&
    Boolean(categoryId.value),
)

onMounted(async () => {
  loadingMeta.value = true
  try {
    categories.value = await fetchCategories()
    categoryId.value = categories.value[0]?.id ?? null
  } finally {
    loadingMeta.value = false
  }
})

async function submit() {
  if (!auth.currentUser) {
    toast.add({
      severity: 'warn',
      summary: '请先登录',
      detail: '发帖前需要选择 Mock 用户身份。',
      life: 2500,
    })
    router.push({ name: 'login' })
    return
  }

  if (!canSubmit.value || !categoryId.value) {
    toast.add({
      severity: 'warn',
      summary: '请完善表单',
      detail: '标题、分类与正文均为必填。',
      life: 2200,
    })
    return
  }

  submitting.value = true
  try {
    const post = await createPost({
      title: title.value,
      content: content.value,
      categoryId: categoryId.value,
      authorId: auth.currentUser.id,
    })
    toast.add({
      severity: 'success',
      summary: '发布成功',
      life: 1800,
    })
    router.push({ name: 'post-detail', params: { id: post.id } })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="stack-md">
    <header class="stack-sm">
      <h1>发布帖子</h1>
      <p class="muted">分享你的想法或问题。</p>
    </header>

    <div v-if="!auth.currentUser" class="stack-sm">
      <Message severity="warn" :closable="false">当前未登录，发帖前请先选择身份。</Message>
      <Button label="去登录" icon="pi pi-sign-in" @click="router.push({ name: 'login' })" />
    </div>

    <Card>
      <template #title>新帖子</template>
      <template #content>
        <div v-if="loadingMeta" class="stack-sm">
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
          <Skeleton height="8rem" />
        </div>
        <div v-else class="stack-md">
          <div class="stack-sm">
            <label for="post-title">标题</label>
            <InputText
              id="post-title"
              v-model="title"
              placeholder="请输入标题"
              style="width: 100%"
            />
          </div>

          <div class="stack-sm">
            <label for="post-category">分类</label>
            <Select
              id="post-category"
              v-model="categoryId"
              :options="categories"
              option-label="name"
              option-value="id"
              placeholder="选择分类"
              style="width: 100%"
            />
          </div>

          <div class="stack-sm">
            <label for="post-content">正文</label>
            <Textarea
              id="post-content"
              v-model="content"
              rows="10"
              auto-resize
              placeholder="支持纯文本，换行会被保留。"
              style="width: 100%"
            />
          </div>

          <div class="row">
            <div class="grow" />
            <Button
              label="发布"
              icon="pi pi-check"
              :loading="submitting"
              :disabled="!auth.currentUser"
              @click="submit"
            />
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>
