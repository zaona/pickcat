/**
 * 全站 MingCute 图标注册表
 *
 * 浏览选型：https://www.mingcute.com/
 * 默认 Core Regular；激活态用 Core Filled。
 */
import type { FunctionalComponent } from 'vue'

import AddRegular from '@mingcute/vue/core-regular/add'
import Book2Regular from '@mingcute/vue/core-regular/book-2'
import BookmarkRegular from '@mingcute/vue/core-regular/bookmark'
import BriefcaseRegular from '@mingcute/vue/core-regular/briefcase'
import CheckRegular from '@mingcute/vue/core-regular/check'
import CodeRegular from '@mingcute/vue/core-regular/code'
import Message2Regular from '@mingcute/vue/core-regular/message-2'
import CornerUpLeftRegular from '@mingcute/vue/core-regular/corner-up-left'
import DownRegular from '@mingcute/vue/core-regular/down'
import EntranceRegular from '@mingcute/vue/core-regular/entrance'
import Eye2Regular from '@mingcute/vue/core-regular/eye-2'
import ExitDoorRegular from '@mingcute/vue/core-regular/exit-door'
import GridRegular from '@mingcute/vue/core-regular/grid'
import HeartRegular from '@mingcute/vue/core-regular/heart'
import Home1Regular from '@mingcute/vue/core-regular/home-1'
import InformationRegular from '@mingcute/vue/core-regular/information'
import NotificationRegular from '@mingcute/vue/core-regular/notification'
import Search2Regular from '@mingcute/vue/core-regular/search-2'
import SendPlaneRegular from '@mingcute/vue/core-regular/send-plane'
import Share2Regular from '@mingcute/vue/core-regular/share-2'
import User2Regular from '@mingcute/vue/core-regular/user-2'

import AddFilled from '@mingcute/vue/core-filled/add'
import BookmarkFilled from '@mingcute/vue/core-filled/bookmark'
import EntranceFilled from '@mingcute/vue/core-filled/entrance'
import HeartFilled from '@mingcute/vue/core-filled/heart'
import Home1Filled from '@mingcute/vue/core-filled/home-1'
import User2Filled from '@mingcute/vue/core-filled/user-2'

import type { IconProps } from '@mingcute/vue'

export type IconName =
  | 'home'
  | 'homeFilled'
  | 'search'
  | 'bell'
  | 'user'
  | 'userFilled'
  | 'plus'
  | 'plusFilled'
  | 'heart'
  | 'heartFilled'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'comment'
  | 'comments'
  | 'eye'
  | 'share'
  | 'send'
  | 'reply'
  | 'signIn'
  | 'signInFilled'
  | 'signOut'
  | 'check'
  | 'info'
  | 'chevronDown'
  | 'grid'
  | 'code'
  | 'book'
  | 'briefcase'

/** 底栏等场景：选中态对应的 Filled 图标 */
export const iconFilledMap: Partial<Record<IconName, IconName>> = {
  home: 'homeFilled',
  plus: 'plusFilled',
  user: 'userFilled',
  signIn: 'signInFilled',
  heart: 'heartFilled',
  bookmark: 'bookmarkFilled',
}

type IconComponent = FunctionalComponent<IconProps>

export const iconRegistry: Record<IconName, IconComponent> = {
  home: Home1Regular,
  homeFilled: Home1Filled,
  search: Search2Regular,
  bell: NotificationRegular,
  user: User2Regular,
  userFilled: User2Filled,
  plus: AddRegular,
  plusFilled: AddFilled,
  heart: HeartRegular,
  heartFilled: HeartFilled,
  bookmark: BookmarkRegular,
  bookmarkFilled: BookmarkFilled,
  comment: Message2Regular,
  comments: Message2Regular,
  eye: Eye2Regular,
  share: Share2Regular,
  send: SendPlaneRegular,
  reply: CornerUpLeftRegular,
  signIn: EntranceRegular,
  signInFilled: EntranceFilled,
  signOut: ExitDoorRegular,
  check: CheckRegular,
  info: InformationRegular,
  chevronDown: DownRegular,
  grid: GridRegular,
  code: CodeRegular,
  book: Book2Regular,
  briefcase: BriefcaseRegular,
}
