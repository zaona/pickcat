/**
 * PrimeVue 插件注册
 *
 * - Aura 预设 + primary 映射为 blue（PrimeUI 蓝色系）
 * - 使用 MIT 许可的 PrimeVue 4.x（无需 PrimeUI License Key）
 * - 按需全局注册常用组件；图标使用 PrimeIcons（pi pi-*）
 */
import type { App } from 'vue'

import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import DataTable from 'primevue/datatable'
import DataView from 'primevue/dataview'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import Listbox from 'primevue/listbox'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import OverlayBadge from 'primevue/overlaybadge'
import Paginator from 'primevue/paginator'
import PrimeVue from 'primevue/config'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Skeleton from 'primevue/skeleton'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabMenu from 'primevue/tabmenu'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Toolbar from 'primevue/toolbar'

/**
 * Aura + blue primary。
 * Card / Listbox：去掉投影与描边，靠页面 surface-50 与内容底色区分层级。
 */
const PickCatPreset = definePreset(Aura, {
  primitive: {
    // 全局加大圆角阶梯（默认 xs2/sm4/md6/lg8/xl12）
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
  },
  semantic: {
    // 品牌主色 #3266FC，由 palette 生成完整色阶
    primary: palette('#3266FC'),
    // 全局字号加大（默认 0.875rem），菜单/按钮/表单等一起变大
    typography: {
      fontSize: '1rem',
    },
    navigation: {
      item: {
        padding: '0.625rem 1rem',
        label: {
          fontSize: '1.25rem',
        },
        icon: {
          size: '1.25rem',
        },
      },
    },
    formField: {
      fontSize: '1rem',
      paddingX: '0.875rem',
      paddingY: '0.5rem',
      sm: {
        fontSize: '0.875rem',
      },
      lg: {
        fontSize: '1.125rem',
        paddingX: '1rem',
        paddingY: '0.625rem',
      },
    },
  },
  components: {
    card: {
      root: {
        // 无阴影、无描边；页面为 surface-50，卡片为 content.background(白)，靠底色分层
        shadow: 'none',
      },
    },
    listbox: {
      root: {
        // 侧栏分类列表：去掉表单控件默认投影与边框
        shadow: 'none',
        borderColor: 'transparent',
        background: 'transparent',
      },
    },
    paginator: {
      root: {
        background: 'transparent',
      },
    },
    menubar: {
      root: {
        // 桌面顶栏加高；描边与毛玻璃由外层 host 控制
        padding: '0.75rem 1rem',
        borderRadius: '0',
        borderColor: 'transparent',
        background: 'transparent',
      },
      item: {
        label: {
          // 顶栏「首页」等导航文字加大（不跟默认 0.875→1rem 走）
          fontSize: '1.25rem',
        },
        padding: '0.625rem 1rem',
      },
    },
    toolbar: {
      root: {
        // 移动端顶栏加高；描边与毛玻璃由外层 host 控制
        padding: '0.875rem 1rem',
        borderRadius: '0',
        borderColor: 'transparent',
        background: 'transparent',
      },
    },
    tabs: {
      tablist: {
        background: 'transparent',
      },
      tabpanel: {
        background: 'transparent',
      },
    },
  },
})

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    theme: {
      preset: PickCatPreset,
      options: {
        darkModeSelector: false,
      },
    },
    ripple: true,
  })

  app.use(ToastService)
  app.use(ConfirmationService)

  app.component('Avatar', Avatar)
  app.component('Badge', Badge)
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Column', Column)
  app.component('ConfirmDialog', ConfirmDialog)
  app.component('DataTable', DataTable)
  app.component('DataView', DataView)
  app.component('Dialog', Dialog)
  app.component('Divider', Divider)
  app.component('InputGroup', InputGroup)
  app.component('InputGroupAddon', InputGroupAddon)
  app.component('InputIcon', InputIcon)
  app.component('InputText', InputText)
  app.component('IconField', IconField)
  app.component('Listbox', Listbox)
  app.component('Menu', Menu)
  app.component('Menubar', Menubar)
  app.component('Message', Message)
  app.component('OverlayBadge', OverlayBadge)
  app.component('Paginator', Paginator)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('Select', Select)
  app.component('SelectButton', SelectButton)
  app.component('Skeleton', Skeleton)
  app.component('Tab', Tab)
  app.component('TabList', TabList)
  app.component('TabMenu', TabMenu)
  app.component('TabPanel', TabPanel)
  app.component('TabPanels', TabPanels)
  app.component('Tabs', Tabs)
  app.component('Tag', Tag)
  app.component('Textarea', Textarea)
  app.component('Toast', Toast)
  app.component('Toolbar', Toolbar)
}
