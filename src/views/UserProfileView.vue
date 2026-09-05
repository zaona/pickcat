<script setup lang="ts">
/**
 * 用户主页 / 个人中心
 *
 * 左：资料、统计、关注、热力图；右：帖子 / 动态 / 关注关系 Tabs
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import ActivityHeatmap from '@/components/ActivityHeatmap.vue'
import AppIcon from '@/components/AppIcon.vue'
import PostListItem from '@/components/PostListItem.vue'
import UserActivityItem from '@/components/UserActivityItem.vue'
import { fetchCategories } from '@/services/categoryService'
import { fetchPosts } from '@/services/postService'
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserProfile,
  toggleFollow,
} from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import type {
  Category,
  Post,
  User,
  UserProfileDetail,
} from '@/types'

type ProfileTab = 'posts' | 'activities' | 'social'
type SocialTab = 'followers' | 'following'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const auth = useAuthStore()

const loading = ref(true)
const followingBusy = ref(false)
const profile = ref<UserProfileDetail | null>(null)
const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const followers = ref<User[]>([])
const followingUsers = ref<User[]>([])

const activeTab = ref<ProfileTab>('posts')
const socialTab = ref<SocialTab>('followers')

const userId = computed(() => String(route.params.id ?? ''))

const isSelf = computed(
  () => Boolean(auth.currentUser && auth.currentUser.id === userId.value),
)

const categoryMap = computed(() => {
  const map = new Map<string, Category>()
  categories.value.forEach((item) => map.set(item.id, item))
  return map
})

const joinedLabel = computed(() => {
  if (!profile.value) return ''
  return new Date(profile.value.user.createdAt).toLocaleDateString('zh-CN')
})

async function loadSocial(id: string) {
  const [followerList, followingList] = await Promise.all([
    fetchFollowers(id),
    fetchFollowing(id),
  ])
  followers.value = followerList
  followingUsers.value = followingList
}

async function load() {
  const id = userId.value
  if (!id) return

  loading.value = true
  activeTab.value = 'posts'
  socialTab.value = 'followers'
  try {
    const [profileData, categoryList, postPage] = await Promise.all([
      fetchUserProfile(id),
      fetchCategories(),
      fetchPosts({ authorId: id, page: 1, pageSize: 50 }),
    ])
    profile.value = profileData
    categories.value = categoryList
    posts.value = postPage.items
    if (profileData) {
      await loadSocial(id)
    } else {
      followers.value = []
      followingUsers.value = []
    }
  } finally {
    loading.value = false
  }
}

function openUser(id: string) {
  router.push({ name: 'user', params: { id } })
}

function goStat(kind: 'posts' | 'followers' | 'following') {
  if (kind === 'posts') {
    activeTab.value = 'posts'
    return
  }
  activeTab.value = 'social'
  socialTab.value = kind
}

async function onToggleFollow() {
  if (!profile.value) return
  if (!auth.currentUser) {
    toast.add({
      severity: 'warn',
      summary: '请先登录',
      detail: '关注前需要选择 Mock 用户身份。',
      life: 2500,
    })
    router.push({ name: 'login' })
    return
  }

  followingBusy.value = true
  try {
    const result = await toggleFollow(profile.value.user.id)
    if (!result) return
    const refreshed = await fetchUserProfile(profile.value.user.id)
    if (refreshed) profile.value = refreshed
    await loadSocial(userId.value)
    toast.add({
      severity: 'success',
      summary: result.following ? '已关注' : '已取消关注',
      life: 1600,
    })
  } finally {
    followingBusy.value = false
  }
}

watch(userId, () => void load(), { immediate: true })

watch(
  () => auth.currentUserId,
  () => {
    if (userId.value) void load()
  },
)
</script>

<template>
  <section class="stack-md">
    <div v-if="loading" class="profile-layout">
      <div class="profile-aside stack-sm">
        <Skeleton width="100%" height="14rem" />
        <Skeleton width="100%" height="8rem" />
      </div>
      <div class="profile-main stack-md">
        <Skeleton width="100%" height="2.5rem" />
        <Skeleton width="100%" height="6rem" />
        <Skeleton width="100%" height="6rem" />
      </div>
    </div>

    <div v-else-if="!profile" class="stack-sm">
      <Message severity="error" :closable="false">未找到该用户。</Message>
      <Button label="返回首页" @click="router.push({ name: 'home' })">
        <template #icon="{ class: iconClass }">
          <AppIcon name="home" :class="iconClass" :size="16" />
        </template>
      </Button>
    </div>

    <div v-else class="profile-layout">
      <aside class="profile-aside stack-sm">
        <Card>
          <template #title>
            <div class="stack-sm" style="align-items: flex-start">
              <Avatar
                :label="profile.user.displayName.slice(0, 1)"
                shape="circle"
                size="xlarge"
              />
              <div class="stack-sm" style="gap: 0.25rem">
                <span>{{ profile.user.displayName }}</span>
                <span class="muted">@{{ profile.user.username }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <div class="stack-sm">
              <p style="margin: 0">{{ profile.user.bio }}</p>
              <p class="muted" style="margin: 0">加入于 {{ joinedLabel }}</p>

              <div class="profile-stats">
                <button
                  type="button"
                  class="stat-cell"
                  @click="goStat('posts')"
                >
                  <strong>{{ profile.stats.postCount }}</strong>
                  <span class="muted">帖子</span>
                </button>
                <div class="stat-cell">
                  <strong>{{ profile.stats.likeReceivedCount }}</strong>
                  <span class="muted">获赞</span>
                </div>
                <button
                  type="button"
                  class="stat-cell"
                  @click="goStat('followers')"
                >
                  <strong>{{ profile.stats.followerCount }}</strong>
                  <span class="muted">粉丝</span>
                </button>
                <button
                  type="button"
                  class="stat-cell"
                  @click="goStat('following')"
                >
                  <strong>{{ profile.stats.followingCount }}</strong>
                  <span class="muted">关注</span>
                </button>
              </div>

              <Button
                v-if="!isSelf"
                :label="profile.following ? '已关注' : '关注'"
                :severity="profile.following ? 'secondary' : undefined"
                :outlined="profile.following"
                :loading="followingBusy"
                fluid
                @click="onToggleFollow"
              >
                <template #icon="{ class: iconClass }">
                  <AppIcon
                    :name="profile.following ? 'userFollow' : 'userAdd'"
                    :class="iconClass"
                    :size="16"
                  />
                </template>
              </Button>

              <Button
                v-if="isSelf"
                label="我的收藏"
                severity="secondary"
                outlined
                fluid
                @click="router.push({ name: 'bookmarks' })"
              >
                <template #icon="{ class: iconClass }">
                  <AppIcon name="bookmark" :class="iconClass" :size="16" />
                </template>
              </Button>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>活跃热力图</template>
          <template #content>
            <ActivityHeatmap :days="profile.heatmap" />
          </template>
        </Card>
      </aside>

      <div class="profile-main">
        <Tabs v-model:value="activeTab">
          <TabList>
            <Tab value="posts">帖子（{{ profile.stats.postCount }}）</Tab>
            <Tab value="activities">动态（{{ profile.activities.length }}）</Tab>
            <Tab value="social">关注</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="posts">
              <div class="stack-sm">
                <Message
                  v-if="posts.length === 0"
                  severity="secondary"
                  :closable="false"
                >
                  还没有发布过帖子。
                </Message>
                <div v-else class="post-list">
                  <PostListItem
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    :author="profile.user"
                    :category="categoryMap.get(post.categoryId)"
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel value="activities">
              <div class="stack-sm">
                <Message
                  v-if="profile.activities.length === 0"
                  severity="secondary"
                  :closable="false"
                >
                  暂无动态。
                </Message>
                <UserActivityItem
                  v-for="item in profile.activities"
                  :key="item.id"
                  :activity="item"
                />
              </div>
            </TabPanel>

            <TabPanel value="social">
              <div class="stack-sm">
                <SelectButton
                  v-model="socialTab"
                  :options="[
                    {
                      label: `粉丝 ${profile.stats.followerCount}`,
                      value: 'followers',
                    },
                    {
                      label: `正在关注 ${profile.stats.followingCount}`,
                      value: 'following',
                    },
                  ]"
                  option-label="label"
                  option-value="value"
                  :allow-empty="false"
                />

                <template v-if="socialTab === 'followers'">
                  <Message
                    v-if="followers.length === 0"
                    severity="secondary"
                    :closable="false"
                  >
                    还没有粉丝。
                  </Message>
                  <Card
                    v-for="person in followers"
                    :key="person.id"
                    class="person-card"
                    @click="openUser(person.id)"
                  >
                    <template #content>
                      <div class="row">
                        <Avatar
                          :label="person.displayName.slice(0, 1)"
                          shape="circle"
                        />
                        <div class="stack-sm" style="gap: 0.15rem; min-width: 0">
                          <strong>{{ person.displayName }}</strong>
                          <span class="muted">@{{ person.username }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </template>

                <template v-else>
                  <Message
                    v-if="followingUsers.length === 0"
                    severity="secondary"
                    :closable="false"
                  >
                    还没有关注任何人。
                  </Message>
                  <Card
                    v-for="person in followingUsers"
                    :key="person.id"
                    class="person-card"
                    @click="openUser(person.id)"
                  >
                    <template #content>
                      <div class="row">
                        <Avatar
                          :label="person.displayName.slice(0, 1)"
                          shape="circle"
                        />
                        <div class="stack-sm" style="gap: 0.15rem; min-width: 0">
                          <strong>{{ person.displayName }}</strong>
                          <span class="muted">@{{ person.username }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </template>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.2rem;
  border: none;
  border-radius: var(--p-content-border-radius);
  background: color-mix(in srgb, var(--p-content-border-color) 35%, transparent);
  color: inherit;
  font: inherit;
  cursor: default;
}

button.stat-cell {
  cursor: pointer;
}

button.stat-cell:hover {
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
}

.stat-cell strong {
  font-size: 1rem;
  line-height: 1.2;
}

.stat-cell .muted {
  font-size: 0.7rem;
}

.person-card {
  cursor: pointer;
}

:deep(.p-tablist) {
  padding: 0;
}

:deep(.p-tab) {
  padding: 0.45rem 0.85rem;
}

:deep(.p-tabpanels),
:deep(.p-tabpanel) {
  padding: 0.5rem 0 0;
}
</style>
