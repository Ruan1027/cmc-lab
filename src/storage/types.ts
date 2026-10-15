/**
 * 存储适配器接口
 *
 * 把所有「数据存哪儿、怎么存」的细节收口到这一个接口后面。
 * 上层（store）只认接口，不认实现，因此：
 *   - localStorage → IndexedDB 的迁移只是换一个实现，业务零改动
 *   - 将来接云端后端（CloudAdapter）也只需再挂一个实现
 *
 * 两种实现见 localAdapter.ts（file:// 与回退）与 indexedDbAdapter.ts（在线/App）。
 */
import type { PersistedState } from './repository';

/** localStorage 与 IndexedDB 迁移共用的遗留键名（旧版本写入 localStorage） */
export const STORAGE_KEY = 'cmc_lab_state_v1';

export interface StorageAdapter {
  /**
   * 读取持久化状态。
   * - 无数据或读取失败 → 返回 null（调用方回落到 emptyState）
   * - 成功 → 返回已归一化的 PersistedState
   */
  load(): Promise<PersistedState | null>;

  /**
   * 写入完整状态，返回是否成功。
   * 配额超限 / 存储不可用时返回 false，让上层有机会提示用户导出备份。
   */
  save(state: PersistedState): Promise<boolean>;

  /** 清空全部持久化数据（重置数据用） */
  clear(): Promise<void>;
}
