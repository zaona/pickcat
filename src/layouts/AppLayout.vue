<script setup lang="ts">
/**
 * 应用布局：顶栏导航 + 主内容区
 *
 * 使用 PrimeVue Menubar / Avatar / Button，不自定义业务外观。
 * 右侧用户区读取 auth store；未登录时引导至登录页。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const items = computed(() => [
  {
    label: '首页',
    icon: 'pi pi-home',
    command: () => router.push({ name: 'home' }),
  },
  {
    label: '发帖',
    icon: 'pi pi-pencil',
    command: () => router.push({ name: 'post-create' }),
  },
])

function goLogin() {
  router.push({ name: 'login' })
}

function goProfile() {
  if (auth.currentUser) {
    router.push({ name: 'user', params: { id: auth.currentUser.id } })
  }
}
</script>

<template>
  <div class="layout-root">
    <Menubar :model="items">
      <template #start>
        <Button
          label="PickCat"
          text
          @click="router.push({ name: 'home' })"
        />
      </template>
      <template #end>
        <div class="row">
          <template v-if="auth.currentUser">
            <Button
              text
              severity="secondary"
              @click="goProfile"
            >
              <span class="row">
                <Avatar
                  :label="auth.currentUser.displayName.slice(0, 1)"
                  shape="circle"
                  size="small"
                />
                <span>{{ auth.currentUser.displayName }}</span>
              </span>
            </Button>
          </template>
          <Button
            v-else
            label="登录"
            icon="pi pi-sign-in"
            size="small"
            @click="goLogin"
          />
        </div>
      </template>
    </Menubar>

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>
