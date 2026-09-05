import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

/** 与 src/icons/registry.ts 保持同步，避免开发态按需发现图标时触发重优化导致预览白屏 */
const mingcuteIcons = [
  '@mingcute/vue/core-regular/add',
  '@mingcute/vue/core-regular/book-2',
  '@mingcute/vue/core-regular/bookmark',
  '@mingcute/vue/core-regular/briefcase',
  '@mingcute/vue/core-regular/check',
  '@mingcute/vue/core-regular/code',
  '@mingcute/vue/core-regular/corner-up-left',
  '@mingcute/vue/core-regular/down',
  '@mingcute/vue/core-regular/entrance',
  '@mingcute/vue/core-regular/exit-door',
  '@mingcute/vue/core-regular/eye-2',
  '@mingcute/vue/core-regular/grid',
  '@mingcute/vue/core-regular/heart',
  '@mingcute/vue/core-regular/home-1',
  '@mingcute/vue/core-regular/information',
  '@mingcute/vue/core-regular/message-2',
  '@mingcute/vue/core-regular/notification',
  '@mingcute/vue/core-regular/search-2',
  '@mingcute/vue/core-regular/send-plane',
  '@mingcute/vue/core-regular/share-2',
  '@mingcute/vue/core-regular/user-2',
  '@mingcute/vue/core-regular/user-add',
  '@mingcute/vue/core-regular/user-follow',
  '@mingcute/vue/core-regular/user-remove',
  '@mingcute/vue/core-filled/add',
  '@mingcute/vue/core-filled/bookmark',
  '@mingcute/vue/core-filled/entrance',
  '@mingcute/vue/core-filled/heart',
  '@mingcute/vue/core-filled/home-1',
  '@mingcute/vue/core-filled/user-2',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['@mingcute/vue', ...mingcuteIcons],
  },
  server: {
    warmup: {
      clientFiles: ['./src/icons/registry.ts', './src/main.ts'],
    },
  },
})
