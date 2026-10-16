/**
 * 云 SDK 的**纯本地版替身**（vite alias 在「没有 cloud.config.json」或单文件构建时生效）
 *
 * 「没有云配置」就是纯本地版：配置被注入为 null，`getCloud()` 永远不会真正初始化，
 * 那么把整包后端代码（约 75 KB）打进产物纯属浪费 —— GitHub Pages / fork / Release
 * 都走这条路。
 *
 * 这里只保留被静态 import 到的那个工厂函数；类型检查仍走真实包
 * （tsconfig / vitest 不做这个替换），因此类型安全不受影响。
 */
export function createWorkBuddyCloud(): never {
  throw new Error('单文件离线版不包含云服务客户端');
}
