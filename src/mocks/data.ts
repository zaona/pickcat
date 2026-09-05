/**
 * Mock 种子数据
 *
 * 仅作为内存 Store 的初始快照；运行期变更不会写回本文件。
 * 扩展数据时请保持 id 唯一，时间字段使用 ISO 8601。
 */
import type { Category, Comment, Post, User } from '@/types'

export const seedUsers: User[] = [
  {
    id: 'u1',
    username: 'alice',
    displayName: 'Alice',
    bio: '喜欢分享前端实践与工具推荐。',
    createdAt: '2025-11-01T08:00:00.000Z',
  },
  {
    id: 'u2',
    username: 'bob',
    displayName: 'Bob',
    bio: '后端工程师，偶尔写社区帖。',
    createdAt: '2025-12-12T10:30:00.000Z',
  },
  {
    id: 'u3',
    username: 'cara',
    displayName: 'Cara',
    bio: '产品与设计交叉话题爱好者。',
    createdAt: '2026-01-20T14:15:00.000Z',
  },
  {
    id: 'u4',
    username: 'dan',
    displayName: 'Dan',
    bio: '开源贡献者，关注 Vue 生态。',
    createdAt: '2026-02-08T09:45:00.000Z',
  },
]

export const seedCategories: Category[] = [
  {
    id: 'c1',
    name: '技术讨论',
    description: '框架、工程化、性能等技术话题',
  },
  {
    id: 'c2',
    name: '经验分享',
    description: '踩坑记录、最佳实践与学习路径',
  },
  {
    id: 'c3',
    name: '闲聊水贴',
    description: '轻松交流、提问与灌水',
  },
  {
    id: 'c4',
    name: '求职招聘',
    description: '岗位信息、面试经验与求职互助',
  },
]

export const seedPosts: Post[] = [
  {
    id: 'p1',
    title: 'Vue 3 + PrimeVue 搭建社区前端的心得',
    content:
      '最近用 Vue 3 和 PrimeVue（Aura）搭了一个社区 MVP。\n\n体会：\n1. 优先用组件库能力，少写自定义样式；\n2. 服务层先用 Mock，接口形状与真实 API 对齐；\n3. 布局用 Menubar + 页面容器即可。\n\n欢迎补充你们的实践。',
    categoryId: 'c1',
    authorId: 'u1',
    likeCount: 12,
    commentCount: 3,
    createdAt: '2026-08-20T03:00:00.000Z',
    updatedAt: '2026-08-20T03:00:00.000Z',
  },
  {
    id: 'p2',
    title: '如何组织 Mock 数据层才方便以后换 API？',
    content:
      '建议把「种子数据 / 内存 CRUD / service 异步接口」拆开。\n页面只依赖 services，将来把 services 内部换成 fetch/axios 即可。',
    categoryId: 'c2',
    authorId: 'u2',
    likeCount: 8,
    commentCount: 2,
    createdAt: '2026-08-22T06:20:00.000Z',
    updatedAt: '2026-08-22T06:20:00.000Z',
  },
  {
    id: 'p3',
    title: '周末有人一起讨论社区产品功能优先级吗？',
    content: '信息流、详情评论、发帖、用户页这四个我觉得是 MVP 刚需，通知和关注可以后置。你们怎么看？',
    categoryId: 'c3',
    authorId: 'u3',
    likeCount: 5,
    commentCount: 1,
    createdAt: '2026-08-25T11:10:00.000Z',
    updatedAt: '2026-08-25T11:10:00.000Z',
  },
  {
    id: 'p4',
    title: '前端岗位面试：会问哪些 Vue 生态问题？',
    content:
      '最近面试被问到 Composition API、路由守卫、状态管理边界。\n有没有朋友分享高频题单？',
    categoryId: 'c4',
    authorId: 'u4',
    likeCount: 15,
    commentCount: 2,
    createdAt: '2026-08-28T02:40:00.000Z',
    updatedAt: '2026-08-28T02:40:00.000Z',
  },
  {
    id: 'p5',
    title: 'PrimeVue DataView 做信息流的小技巧',
    content:
      '列表页用 DataView + Paginator，加载态用 Skeleton，空态用 Message。\n筛选用 Select + InputText 组合就够用。',
    categoryId: 'c1',
    authorId: 'u1',
    likeCount: 9,
    commentCount: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'p6',
    title: '从零写文档比事后补更省时间',
    content: 'README + mock-data 说明 + 文件头注释，能显著降低协作成本。建议一开始就写。',
    categoryId: 'c2',
    authorId: 'u2',
    likeCount: 4,
    commentCount: 1,
    createdAt: '2026-09-02T09:30:00.000Z',
    updatedAt: '2026-09-02T09:30:00.000Z',
  },
  {
    id: 'p7',
    title: '今天天气不错，适合重构一下目录结构',
    content: '开个水贴：你们重构时最怕动哪一层？我最怕 services 与页面耦合。',
    categoryId: 'c3',
    authorId: 'u3',
    likeCount: 2,
    commentCount: 0,
    createdAt: '2026-09-03T01:15:00.000Z',
    updatedAt: '2026-09-03T01:15:00.000Z',
  },
  {
    id: 'p8',
    title: '内推：寻找熟悉 Vue3 的同学',
    content: '某团队招前端，远程可选。熟悉 Vue3 / TypeScript 优先。有意私信（本帖仅 Mock）。',
    categoryId: 'c4',
    authorId: 'u4',
    likeCount: 6,
    commentCount: 1,
    createdAt: '2026-09-04T04:50:00.000Z',
    updatedAt: '2026-09-04T04:50:00.000Z',
  },
]

export const seedComments: Comment[] = [
  {
    id: 'cm1',
    postId: 'p1',
    authorId: 'u2',
    content: '同意，服务层抽象很关键。',
    parentId: null,
    createdAt: '2026-08-20T04:00:00.000Z',
  },
  {
    id: 'cm2',
    postId: 'p1',
    authorId: 'u3',
    content: 'Aura 主题默认观感已经够用了。',
    parentId: null,
    createdAt: '2026-08-20T05:10:00.000Z',
  },
  {
    id: 'cm3',
    postId: 'p1',
    authorId: 'u1',
    content: '是的，后续再考虑主题定制。',
    parentId: 'cm2',
    createdAt: '2026-08-20T05:30:00.000Z',
  },
  {
    id: 'cm4',
    postId: 'p2',
    authorId: 'u1',
    content: '我们也是这么拆的，迁移成本很低。',
    parentId: null,
    createdAt: '2026-08-22T07:00:00.000Z',
  },
  {
    id: 'cm5',
    postId: 'p2',
    authorId: 'u4',
    content: '再加一层 DTO 映射会更稳。',
    parentId: null,
    createdAt: '2026-08-22T08:20:00.000Z',
  },
  {
    id: 'cm6',
    postId: 'p3',
    authorId: 'u4',
    content: 'MVP 范围认同，通知可以放到第二期。',
    parentId: null,
    createdAt: '2026-08-25T12:00:00.000Z',
  },
  {
    id: 'cm7',
    postId: 'p4',
    authorId: 'u1',
    content: '还可以问 pinia 与 provide/inject 的取舍。',
    parentId: null,
    createdAt: '2026-08-28T03:10:00.000Z',
  },
  {
    id: 'cm8',
    postId: 'p4',
    authorId: 'u2',
    content: '性能相关：v-memo、异步组件也常问。',
    parentId: null,
    createdAt: '2026-08-28T03:40:00.000Z',
  },
  {
    id: 'cm9',
    postId: 'p6',
    authorId: 'u3',
    content: '文档先行 +1',
    parentId: null,
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'cm10',
    postId: 'p8',
    authorId: 'u1',
    content: '已收藏，感谢分享。',
    parentId: null,
    createdAt: '2026-09-04T05:20:00.000Z',
  },
]
