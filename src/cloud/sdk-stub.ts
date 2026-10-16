/**
 * 云 SDK 的**单文件离线版替身**（只在 `npm run build:single` 时通过 vite alias 生效）
 *
 * 单文件版定位是纯本地匿名：配置被强制注入为 null、协议是 file:，
 * `getCloud()` 在任何情况下都不会走到真正初始化，所以整包后端代码（约 290KB）
 * 打进 HTML 纯属浪费 —— Release 附件是要让人下载下来双击就用的。
 *
 * 这里只保留被静态 import 到的那个工厂函数；类型检查仍走真实包
 * （tsconfig / vitest 不做这个替换），因此类型安全不受影响。
 */
export function createWorkBuddyCloud(): never {
  throw new Error('单文件离线版不包含云服务客户端');
}
