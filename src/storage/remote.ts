/**
 * 远端后端抽象 + 同步子集（学习数据）的纯逻辑
 *
 * 这一层不依赖任何具体后端（云服务 / 自建都行），只定义契约。
 * 关键设计：云端只存「学习数据 + 用户导入题」，内置 101 题永远本地重建，
 * 既避免每个用户重复上传相同内容，也避免多端合并时互相覆盖。
 */
import type { Problem } from '../types';
import { emptyState, type PersistedState } from './repository';

/** 真正同步到云端的子集（PersistedState 去掉内置题后的部分） */
export interface SyncedPayload {
  version: number;
  wrongBook: PersistedState['wrongBook'];
  stats: PersistedState['stats'];
  history: PersistedState['history'];
  exams: PersistedState['exams'];
  settings: PersistedState['settings'];
  flags: PersistedState['flags'];
  importedProblems: Problem[];
}

export interface RemoteRecord {
  payload: SyncedPayload;
  /** 云端记录的更新时间（ISO 字符串），用于 LWW 判新旧 */
  updated_at: string;
}

/** 远端后端契约：load / save / clear，全部以用户 id 为键 */
export interface RemoteBackend {
  load(userId: string): Promise<RemoteRecord | null>;
  save(userId: string, payload: SyncedPayload, updatedAt: string): Promise<void>;
  clear(userId: string): Promise<void>;
}

/** 从完整状态中剥离出同步子集（去掉内置题） */
export function toSyncedPayload(state: PersistedState, builtinIds: Set<string>): SyncedPayload {
  return {
    version: state.version,
    wrongBook: state.wrongBook,
    stats: state.stats,
    history: state.history,
    exams: state.exams,
    settings: state.settings,
    flags: state.flags,
    importedProblems: state.problems.filter((p) => !builtinIds.has(p.id)),
  };
}

/** 把一个同步子集合并回「本地完整状态」：内置题以本地代码包为准，叠加云端导入题 */
export function applyPayload(
  local: PersistedState | null,
  payload: SyncedPayload,
  builtin: Problem[],
): PersistedState {
  const base = local ?? emptyState();
  const seen = new Set(builtin.map((p) => p.id));
  const imported = (payload.importedProblems ?? []).filter((p) => !seen.has(p.id));
  return {
    ...base,
    version: payload.version,
    wrongBook: payload.wrongBook,
    stats: payload.stats,
    history: payload.history,
    exams: payload.exams,
    settings: payload.settings,
    flags: payload.flags,
    problems: builtin.concat(imported),
  };
}

export interface MergeResult {
  state: PersistedState;
  /** 是否采用了云端数据（用于决定是否写回本地 + 更新 lastSyncAt） */
  adoptedRemote: boolean;
}

/**
 * LWW（Last-Write-Wins）合并：比较云端 updated_at 与本地上次同步时间。
 * 云端更新 → 采用云端；否则保留本地（含本地离线期间的改动）。
 */
export function mergeLWW(
  local: PersistedState | null,
  remote: RemoteRecord | null,
  lastSyncAt: number,
  builtin: Problem[],
): MergeResult {
  if (!remote) return { state: local ?? emptyState(), adoptedRemote: false };
  const remoteMs = Date.parse(remote.updated_at);
  if (Number.isNaN(remoteMs) || remoteMs <= lastSyncAt) {
    return { state: local ?? emptyState(), adoptedRemote: false };
  }
  return { state: applyPayload(local, remote.payload, builtin), adoptedRemote: true };
}
