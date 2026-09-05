# Mock 数据说明

本文档说明 PICKCAT 社区前端的本地 Mock 方案，以及如何扩展 / 替换为真实 API。

## 设计目标

1. **页面不直接碰数据实现**：视图与 composable 只调用 `src/services/*`
2. **服务层接口稳定**：方法均为 `async`，返回 Promise，形状接近真实 HTTP API
3. **内存可变**：点赞、发帖、评论在当前浏览器会话内生效（刷新后种子数据重置；登录用户 id 除外，见 auth store）

## 目录

| 路径 | 职责 |
| --- | --- |
| [`src/types/index.ts`](../src/types/index.ts) | 领域类型：`User` / `Category` / `Post` / `Comment` 等 |
| [`src/mocks/data.ts`](../src/mocks/data.ts) | 种子数据（只读快照） |
| [`src/mocks/store.ts`](../src/mocks/store.ts) | 内存 CRUD（会话级可变） |
| [`src/services/*.ts`](../src/services) | 对外异步 API + 模拟延迟 |

## 核心实体

### User

- `id` / `username` / `displayName` / `bio` / `createdAt`
- 可选 `avatarUrl`（未提供时 UI 用展示名首字）

### Category

- `id` / `name` / `description`
- `icon`：MingCute `IconName`（如 `code`），见 `src/icons/registry.ts`，用于侧栏展示

### Post

- `title` / `content` / `categoryId` / `authorId`
- 计数：`likeCount` / `commentCount` / `bookmarkCount` / `viewCount`
- 时间：`createdAt` / `updatedAt`
- 进入详情（`fetchPostById`）时 Mock 会递增 `viewCount`

### Comment

- 归属：`postId` / `authorId`
- `parentId`：`null` 为一级评论，非空表示回复某条评论（MVP 展示为一层回复）

### FollowEdge（关注关系）

- `followerId` / `followingId` / `createdAt`
- 种子见 `seedFollows`；会话内 `toggleFollow` 可增删

### UserProfileDetail（个人主页聚合）

由 `fetchUserProfile(userId)` / `mockStore.getUserProfile` 计算返回：

- `stats`：`postCount`、`likeReceivedCount`（帖子赞+评论赞）、`followerCount`、`followingCount`
- `following`：当前登录用户是否已关注该主页用户
- `heatmap`：近约一年按日活跃计数（发帖、评论、关注各 +1；获赞按实体创建日有限叠加）
- `activities`：动态时间线（发帖 / 评论 / 获赞摘要 / 关注他人）

## 常用服务方法

```ts
import { fetchPosts, fetchPostById, createPost, togglePostLike } from '@/services'
import { fetchCommentsByPost, createComment } from '@/services'
import {
  fetchUsers,
  fetchUserById,
  fetchUserProfile,
  toggleFollow,
  fetchFollowers,
  fetchFollowing,
} from '@/services'
import { fetchCategories } from '@/services'
```

- `fetchPosts({ categoryId, keyword, page, pageSize, authorId })` → 分页列表
- `togglePostLike(postId)` → `{ post, liked }`，同一帖再次调用取消赞
- `createComment({ postId, authorId, content, parentId? })` → 新建评论并递增帖子 `commentCount`
- `fetchUserProfile(userId)` → 个人中心聚合（含热力图与动态）
- `toggleFollow(targetUserId)` → 关注/取消关注（需登录）
- `fetchFollowers` / `fetchFollowing` → 粉丝与正在关注列表

## 如何扩展种子数据

1. 编辑 `src/mocks/data.ts`，追加对象
2. 保证各类 `id` 全局唯一
3. 时间字段使用 ISO 8601（例如 `2026-09-05T02:00:00.000Z`）
4. 帖子的 `commentCount` 应与该帖在 `seedComments` 中的条数一致
5. 关注边追加到 `seedFollows`，勿出现自己关注自己

## 如何替换为真实 API

1. 保持 `src/services/*` 的**函数名与返回类型**不变
2. 将函数内部从 `mockStore` 改为 `fetch` / `axios`
3. 删除或停用 `src/mocks/*`（可选保留给本地演示）
4. 错误处理可在 service 内统一抛出，由页面 Toast 提示

## 登录态说明

Mock 登录不校验密码：在登录页选择用户后，`auth` store 将 `userId` 写入 `localStorage`（键名 `pickcat.currentUserId`）。  
用户资料仍从 Mock 用户表解析。
