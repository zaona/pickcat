# PickCat 社区前端

基于 **Vue 3 + Vite + TypeScript + PrimeVue（Aura）** 的社区前端 MVP。  
全部数据走本地 Mock，服务层接口与真实 API 对齐，便于后续替换。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| 路由 | Vue Router 4 |
| 状态 | Pinia |
| UI | [PrimeVue](https://primevue.org/) + Aura 主题 + PrimeIcons |
| 数据 | 内存 Mock（`src/mocks` + `src/services`） |

## 快速开始

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

## 功能一览（MVP）

- 首页信息流：分类筛选、关键词搜索、分页
- 帖子详情：正文、点赞、评论树、发表评论
- 发帖：标题 / 分类 / 正文
- 用户主页：资料 + 其发帖列表
- Mock 登录：选择演示用户，无真实鉴权

建议体验路径：打开首页 → 登录选择用户 → 浏览/点赞/评论 → 发帖 → 查看用户主页。

## 目录说明

```text
src/
  layouts/       # 应用壳（顶栏等）
  views/         # 页面视图
  components/    # 可复用业务组件（内部使用 PrimeVue）
  composables/   # 组合式逻辑
  services/      # 数据访问层（可替换为真实 HTTP）
  mocks/         # Mock 种子数据与内存 Store
  stores/        # Pinia 全局状态（如当前用户）
  types/         # 领域类型
  router/        # 路由定义
  plugins/       # 第三方库装配（PrimeVue 等）
docs/            # 补充文档（Mock 结构等）
```

## 样式约定

- 业务 UI 优先使用 PrimeVue 组件与 Aura 主题 token
- 仅允许极少量布局级 spacing（见 `src/style.css`）
- 不要手写一套覆盖组件库的按钮/卡片样式

## Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)，描述使用中文，例如：

```text
feat: 实现首页帖子信息流
fix: 修复评论提交后列表未刷新
docs: 完善 Mock 数据说明
chore: 初始化 Vue3 + PrimeVue 项目脚手架
```

## 相关文档

- [Mock 数据说明](./docs/mock-data.md)
