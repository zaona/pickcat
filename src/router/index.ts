/**
 * 路由定义
 *
 * 所有业务页嵌套在 AppLayout 下，保证顶栏一致。
 */
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'posts/new',
          name: 'post-create',
          component: () => import('@/views/PostCreateView.vue'),
          meta: { title: '发帖' },
        },
        {
          path: 'posts/:id',
          name: 'post-detail',
          component: () => import('@/views/PostDetailView.vue'),
          meta: { title: '帖子详情' },
        },
        {
          path: 'users/:id',
          name: 'user',
          component: () => import('@/views/UserProfileView.vue'),
          meta: { title: '用户主页' },
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginView.vue'),
          meta: { title: '登录' },
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'PickCat'
  document.title = `${title} · PickCat 社区`
})
