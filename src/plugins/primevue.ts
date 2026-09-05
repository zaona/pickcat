/**
 * PrimeVue 插件注册
 *
 * - 使用 Aura 主题预设（@primeuix/themes），业务侧不自定义主题色板
 * - 使用 MIT 许可的 PrimeVue 4.x（无需 PrimeUI License Key）
 * - 按需全局注册常用组件，页面可直接使用标签而无需重复 import
 * - 注册 Toast / Confirm 等服务组件所需的插件
 */
import type { App } from 'vue'

import Aura from '@primeuix/themes/aura'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import DataTable from 'primevue/datatable'
import DataView from 'primevue/dataview'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Paginator from 'primevue/paginator'
import PrimeVue from 'primevue/config'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Toolbar from 'primevue/toolbar'

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false,
      },
    },
    ripple: true,
  })

  app.use(ToastService)
  app.use(ConfirmationService)

  // 常用组件按需全局注册
  app.component('Avatar', Avatar)
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Column', Column)
  app.component('ConfirmDialog', ConfirmDialog)
  app.component('DataTable', DataTable)
  app.component('DataView', DataView)
  app.component('Dialog', Dialog)
  app.component('Divider', Divider)
  app.component('InputText', InputText)
  app.component('Menubar', Menubar)
  app.component('Message', Message)
  app.component('Paginator', Paginator)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('Select', Select)
  app.component('Skeleton', Skeleton)
  app.component('Tag', Tag)
  app.component('Textarea', Textarea)
  app.component('Toast', Toast)
  app.component('Toolbar', Toolbar)
}
