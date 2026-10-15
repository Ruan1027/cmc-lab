/**
 * localStorage 适配器
 *
 * 用于两种场景：
 *   1. file:// 单文件模式 —— IndexedDB 在 file:// 下不可靠（opaque origin），localStorage 才是稳的
 *   2. 在线环境但 IndexedDB 不可用（极少数老浏览器 / 隐私模式）—— 回退到这里
 *
 * 读写语义与原 MVP 实现完全一致，只是换了个收口位置。
 */
import type { StorageAdapter } from './types';
import { STORAGE_KEY } from './types';
import { normalizeState, trimForPersist, type PersistedState } from './repository';

export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<PersistedState | null> {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalizeState(JSON.parse(raw) as Partial<PersistedState>);
    } catch {
      return null;
    }
  }

  async save(state: PersistedState): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimForPersist(state)));
      return true;
    } catch {
      // 写满（QuotaExceededError）或隐私模式禁用时，数据没存上，必须让上层知道
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 忽略 */
    }
  }
}
