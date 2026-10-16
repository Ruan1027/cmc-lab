/**
 * 适配器选择与环境入口
 *
 * 选择规则（核心约束：保护 file:// 单文件模式，且不接后端）：
 *   - file://  → LocalStorageAdapter（IndexedDB 在 file:// 下不可靠，且单文件本就离线）
 *   - 其它（http/https/capacitor）：优先本地适配器（IndexedDB 或回退 localStorage）；
 *     若构建期注入了云服务公开配置，则在外层包一个 CloudAdapter —— 它内部按「登录态」
 *     动态决定是否真正推拉云端：未登录 / 未配置 / 离线 → 退化为纯本地，
 *     登录且联网 → 双向同步。
 *
 * getAdapter() 返回进程内单例（CloudAdapter 需要保持防抖/待推送状态，不能每次新建）。
 */
import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localAdapter';
import { IndexedDBAdapter } from './indexedDbAdapter';
import { CloudAdapter } from './cloudAdapter';
import { createCloudBackend } from './cloudBackend';
import { getCloudConfig } from '../cloud/cloudConfig';
import { useAuthStore } from '../auth/useAuthStore';

export interface AdapterEnv {
  protocol: string;
  hasIndexedDB: boolean;
}

/** 纯函数：根据环境决定用哪个适配器，便于单测 */
export function selectAdapter(env: AdapterEnv): StorageAdapter {
  if (env.protocol === 'file:') return new LocalStorageAdapter();
  const local: StorageAdapter = env.hasIndexedDB
    ? new IndexedDBAdapter()
    : new LocalStorageAdapter();
  // 只看「有没有配置」：file:// 已经在上一行拦掉，这里不需要再读 location
  if (!getCloudConfig()) return local;
  return new CloudAdapter({
    local,
    remote: createCloudBackend(),
    getUserId: () => useAuthStore.getState().getUserId(),
  });
}

let adapter: StorageAdapter | null = null;

export function getAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = selectAdapter({
      protocol: typeof location !== 'undefined' ? location.protocol : 'http:',
      hasIndexedDB: typeof indexedDB !== 'undefined',
    });
  }
  return adapter;
}

/** 取出 CloudAdapter 单例（非云端环境返回 null），供 UI 触发上传 / 落盘等 */
export function getCloudAdapter(): CloudAdapter | null {
  const a = getAdapter();
  return a instanceof CloudAdapter ? a : null;
}
