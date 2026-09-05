/**
 * 模拟网络延迟，让 UI 能演示加载态。
 * 接入真实 API 后可删除对本工具的调用。
 */
export function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
