/**
 * 适配器选择与环境入口
 *
 * 选择规则（核心约束：保护 file:// 单文件模式）：
 *   - file://  → LocalStorageAdapter（IndexedDB 在 file:// 下不可靠，且单文件本就离线）
 *   - 其它（http/https/capacitor）→ 优先 IndexedDBAdapter；若环境无 IndexedDB 则回退 localStorage
 *
 * getAdapter() 返回进程内单例，避免每次 persist 都 new 一个新对象。
 */
import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localAdapter';
import { IndexedDBAdapter } from './indexedDbAdapter';

export interface AdapterEnv {
  protocol: string;
  hasIndexedDB: boolean;
}

/** 纯函数：根据环境决定用哪个适配器，便于单测 */
export function selectAdapter(env: AdapterEnv): StorageAdapter {
  if (env.protocol === 'file:') return new LocalStorageAdapter();
  if (env.hasIndexedDB) return new IndexedDBAdapter();
  return new LocalStorageAdapter();
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
