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

/**
 * 内置题的「身份」索引：id 与来源标题**两者都用**。
 *
 * 为什么不用单一依据：id 曾经因为解析时用随机数而在每个会话漂移，结果内置题剥离
 * 全面失效、被当成用户导入题整批同步（题库翻倍）。现在 id 已是确定性值，
 * 但 source 作为第二道闸门留着 —— 判重的代价极低，而漏判的后果是用户数据被污染。
 */
export interface BuiltinIndex {
  ids: Set<string>;
  sources: Set<string>;
}

export function buildBuiltinIndex(builtin: Problem[]): BuiltinIndex {
  return {
    ids: new Set(builtin.map((p) => p.id)),
    sources: new Set(builtin.map((p) => p.source)),
  };
}

/** 这道题是不是内置题（id 命中或来源标题命中） */
export function isBuiltinProblem(p: Problem, index: BuiltinIndex): boolean {
  return index.ids.has(p.id) || index.sources.has(p.source);
}

/** 从完整状态中剥离出同步子集（去掉内置题） */
export function toSyncedPayload(state: PersistedState, builtin: BuiltinIndex): SyncedPayload {
  return {
    version: state.version,
    wrongBook: state.wrongBook,
    stats: state.stats,
    history: state.history,
    exams: state.exams,
    settings: state.settings,
    flags: state.flags,
    importedProblems: state.problems.filter((p) => !isBuiltinProblem(p, builtin)),
  };
}

/** 把一个同步子集合并回「本地完整状态」：内置题以本地代码包为准，叠加云端导入题 */
export function applyPayload(
  local: PersistedState | null,
  payload: SyncedPayload,
  builtin: Problem[],
): PersistedState {
  const base = local ?? emptyState();
  const index = buildBuiltinIndex(builtin);
  // 云端 payload 里可能混着内置题（旧版本的 id 漂移留下的脏数据），这里一并滤掉，
  // 否则合并后题库会翻倍
  const imported = (payload.importedProblems ?? []).filter((p) => !isBuiltinProblem(p, index));
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

/**
 * 同步子集的廉价指纹（FNV-1a 32 位 + 长度）。
 *
 * 只用来回答一个问题：「和上次与云端一致时相比，内容变了吗」——不需要抗碰撞。
 * 同一份本地数据多次 stringify 的键顺序是稳定的，所以可以直接对序列化结果求值。
 */
export function fingerprintPayload(payload: SyncedPayload): string {
  const s = JSON.stringify(payload);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${h.toString(16)}-${s.length}`;
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
