/**
 * 分类服务
 */
import { mockStore } from '@/mocks/store'
import { delay } from '@/services/http'
import type { Category } from '@/types'

export async function fetchCategories(): Promise<Category[]> {
  await delay()
  return mockStore.listCategories()
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  await delay(120)
  return mockStore.getCategory(id) ?? null
}
