<script setup lang="ts">
/**
 * Mock 登录页
 *
 * 从种子用户中选择身份写入 auth store，无密码校验。
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import { fetchUsers } from '@/services/userService'
import AppIcon from '@/components/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()

const loading = ref(true)
const users = ref<User[]>([])
const selectedUserId = ref<string | null>(auth.currentUserId)

onMounted(async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
    if (!selectedUserId.value && users.value[0]) {
      selectedUserId.value = users.value[0].id
    }
  } finally {
    loading.value = false
  }
})

function confirmLogin() {
  if (!selectedUserId.value) {
    toast.add({
      severity: 'warn',
      summary: '请选择用户',
      life: 2000,
    })
    return
  }
  auth.login(selectedUserId.value)
  toast.add({
    severity: 'success',
    summary: '登录成功',
    detail: `当前身份：${auth.currentUser?.displayName ?? selectedUserId.value}`,
    life: 2000,
  })
  router.push({ name: 'home' })
}

function logout() {
  auth.logout()
  toast.add({
    severity: 'info',
    summary: '已退出登录',
    life: 1800,
  })
}
</script>

<template>
  <section class="stack-md">
    <header class="page-title">
      <h1>登录</h1>
    </header>

    <Message severity="info" :closable="false">
      登录状态保存在 localStorage（键名 pickcat.currentUserId），刷新后仍然有效。
    </Message>

    <Card>
      <template #title>选择身份</template>
      <template #content>
        <div v-if="loading" class="stack-sm">
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
        </div>
        <div v-else class="stack-md">
          <Select
            v-model="selectedUserId"
            :options="users"
            option-label="displayName"
            option-value="id"
            placeholder="选择用户"
            style="width: 100%"
          >
            <template #option="{ option }">
              <div class="row">
                <Avatar
                  :label="option.displayName.slice(0, 1)"
                  shape="circle"
                  size="small"
                />
                <div class="stack-sm" style="gap: 0.15rem">
                  <span>{{ option.displayName }}</span>
                  <span class="muted">@{{ option.username }} · {{ option.bio }}</span>
                </div>
              </div>
            </template>
          </Select>

          <div class="row-wrap">
            <Button label="确认登录" @click="confirmLogin">
              <template #icon="{ class: iconClass }">
                <AppIcon name="signIn" :class="iconClass" :size="16" />
              </template>
            </Button>
            <Button
              v-if="auth.currentUser"
              label="退出登录"
              severity="secondary"
              outlined
              @click="logout"
            >
              <template #icon="{ class: iconClass }">
                <AppIcon name="signOut" :class="iconClass" :size="16" />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>
