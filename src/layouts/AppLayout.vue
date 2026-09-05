<script setup lang="ts">
/**
 * 应用布局
 *
 * - 桌面：顶栏 Menubar（搜索、消息、用户菜单）
 * - 移动端：顶栏（搜索 + 消息）+ 底部 TabMenu（首页 / 发帖 / 我的）
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuItem } from 'primevue/menuitem'
import type Menu from 'primevue/menu'

import { useUnreadNotifications } from '@/composables/useUnreadNotifications'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { unreadCount, refreshUnread } = useUnreadNotifications()

const userMenu = ref<InstanceType<typeof Menu> | null>(null)

const desktopItems = computed(() => [
  {
    label: '首页',
    command: () => router.push({ name: 'home' }),
  },
])

const userMenuItems = computed<MenuItem[]>(() => [
  {
    label: '我的主页',
    icon: 'pi pi-user',
    command: () => {
      if (auth.currentUser) {
        router.push({ name: 'user', params: { id: auth.currentUser.id } })
      }
    },
  },
  {
    label: '我的收藏',
    icon: 'pi pi-bookmark',
    command: () => router.push({ name: 'bookmarks' }),
  },
  { separator: true },
  {
    label: '退出登录',
    icon: 'pi pi-sign-out',
    command: () => auth.logout(),
  },
])

const mobileItems = computed(() => [
  {
    label: '首页',
    icon: 'pi pi-home',
    command: () => router.push({ name: 'home' }),
  },
  {
    label: '发帖',
    icon: 'pi pi-plus',
    class: 'mobile-compose-item',
    command: () => router.push({ name: 'post-create' }),
  },
  {
    label: auth.currentUser ? '我的' : '登录',
    icon: auth.currentUser ? 'pi pi-user' : 'pi pi-sign-in',
    command: () => {
      if (auth.currentUser) {
        router.push({ name: 'user', params: { id: auth.currentUser.id } })
      } else {
        router.push({ name: 'login' })
      }
    },
  },
])

const mobileActiveIndex = computed(() => {
  const name = route.name
  if (name === 'home' || name === 'post-detail' || name === 'search') return 0
  if (name === 'post-create') return 1
  if (name === 'login' || name === 'user' || name === 'bookmarks') return 2
  return 0
})

const unreadLabel = computed(() =>
  unreadCount.value > 99 ? '99+' : String(unreadCount.value),
)

function goSearch() {
  router.push({ name: 'search' })
}

function goNotifications() {
  router.push({ name: 'notifications' })
}

function goLogin() {
  router.push({ name: 'login' })
}

function toggleUserMenu(event: Event) {
  userMenu.value?.toggle(event)
}

watch(
  () => route.name,
  (name) => {
    if (name === 'notifications') void refreshUnread()
  },
)
</script>

<template>
  <div class="layout-root">
    <div class="desktop-only desktop-topbar-host">
      <Menubar :model="desktopItems">
        <template #start>
          <button
            type="button"
            class="brand-logo-btn"
            aria-label="PICKCAT 首页"
            @click="router.push({ name: 'home' })"
          >
            <img src="/logo.svg" alt="PICKCAT" class="brand-logo" />
          </button>
        </template>
        <template #end>
          <div class="row">
            <Button
              icon="pi pi-search"
              text
              rounded
              size="large"
              aria-label="搜索"
              @click="goSearch"
            />
            <span class="nav-bell">
              <Button
                icon="pi pi-bell"
                text
                rounded
                size="large"
                aria-label="消息中心"
                @click="goNotifications"
              />
              <Badge
                v-if="auth.currentUser && unreadCount > 0"
                :value="unreadLabel"
                severity="danger"
                class="nav-bell-badge"
              />
            </span>
            <template v-if="auth.currentUser">
              <Button
                text
                severity="secondary"
                aria-haspopup="true"
                aria-controls="user-menu"
                @click="toggleUserMenu"
              >
                <span class="row">
                  <Avatar
                    :label="auth.currentUser.displayName.slice(0, 1)"
                    shape="circle"
                  />
                  <span>{{ auth.currentUser.displayName }}</span>
                  <i class="pi pi-angle-down" />
                </span>
              </Button>
              <Menu
                id="user-menu"
                ref="userMenu"
                :model="userMenuItems"
                popup
              />
            </template>
            <Button
              v-else
              label="登录"
              icon="pi pi-sign-in"
              @click="goLogin"
            />
          </div>
        </template>
      </Menubar>
    </div>

    <div class="mobile-only mobile-topbar-host">
      <Toolbar class="mobile-topbar">
        <template #start>
          <button
            type="button"
            class="brand-logo-btn"
            aria-label="PICKCAT 首页"
            @click="router.push({ name: 'home' })"
          >
            <img src="/logo.svg" alt="PICKCAT" class="brand-logo" />
          </button>
        </template>
        <template #end>
          <div class="row">
            <Button
              icon="pi pi-search"
              text
              rounded
              size="large"
              aria-label="搜索"
              @click="goSearch"
            />
            <span class="nav-bell">
              <Button
                icon="pi pi-bell"
                text
                rounded
                size="large"
                aria-label="消息中心"
                @click="goNotifications"
              />
              <Badge
                v-if="auth.currentUser && unreadCount > 0"
                :value="unreadLabel"
                severity="danger"
                class="nav-bell-badge"
              />
            </span>
          </div>
        </template>
      </Toolbar>
    </div>

    <main class="page-container">
      <RouterView />
    </main>

    <nav class="mobile-only mobile-bottom-nav" aria-label="主导航">
      <TabMenu :model="mobileItems" :active-index="mobileActiveIndex" />
    </nav>
  </div>
</template>

<style scoped>
.brand-logo-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem 0.25rem 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.brand-logo {
  display: block;
  height: 1.25rem;
  width: auto;
}

/* 未读角标贴铃铛图标右上角，避免 OverlayBadge 跑到大按钮外缘 */
.nav-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-bell-badge {
  position: absolute;
  top: 0.45rem;
  right: 0.4rem;
  min-width: 1rem;
  height: 1rem;
  font-size: 0.65rem;
  line-height: 1rem;
  padding: 0 0.25rem;
  pointer-events: none;
}
</style>
