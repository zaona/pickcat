/**
 * 应用入口
 *
 * 装配顺序：Pinia → Router → PrimeVue → 根组件挂载
 */
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { setupPrimeVue } from './plugins/primevue'
import { router } from './router'
import 'primeicons/primeicons.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
setupPrimeVue(app)

app.mount('#app')
