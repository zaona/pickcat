/**
 * 路由入口（阶段 0 最小可用）
 *
 * 阶段 1 将补充完整页面路由与布局嵌套。
 */
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
    },
  ],
})
