/**
 * 远端后端抽象 + 同步子集（学习数据）的纯逻辑
 *
 * 这一层不依赖任何具体后端（云服务 / 自建都行），只定义契约。
 * 关键设计：云端只存「学习数据 + 用户导入题」，内置 101 题永远本地重建，
 * 既避免每个用户重复上传相同内容，也避免多端合并时互相覆盖。
 */
import type { ExamRecord, HistoryEntry, Problem, Settings, Stats, WrongEntry } from '../types';
import { emptyState, type PersistedState } from './repository';
import { DEFAULT_SETTINGS } from './defaults';

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
 * 规范化序列化：对象键按字典序、数组保持原序。
 *
 * 必须做：**合并会重排对象的键插入顺序**（先远端后本地），而 JSON.stringify
 * 对键顺序敏感。不规范化的话，内容完全相同的两份数据会算出不同指纹，
 * 于是每次打开页面都判定「内容变了」并白白重推一次云端。
 */
function canonicalize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonicalize);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = canonicalize((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

/**
 * 同步子集的廉价指纹（FNV-1a 32 位 + 长度）。
 *
 * 只用来回答一个问题：「和上次与云端一致时相比，内容变了吗」——不需要抗碰撞，
 * 但**必须**对键顺序不敏感（见 canonicalize）。
 */
export function fingerprintPayload(payload: SyncedPayload): string {
  const s = JSON.stringify(canonicalize(payload));
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${h.toString(16)}-${s.length}`;
}

/* -------------------------------------------------------------------------- */
/* 合并                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 为什么不是「整包 LWW」
 *
 * 最初的实现是：谁的时间戳新，整包覆盖另一方。看着简单，实际会在最常见的
 * 场景里丢数据 —— 用户先在电脑用了很久，然后拿手机登录：手机本地是空的，
 * 它一登录就把「空数据」推上云端，电脑下次打开时云端更新，于是**电脑的备考时间、
 * 错题、历史全被空数据覆盖**。时间戳越新越好，前提是「新」等于「更完整」，
 * 而对学习数据来说这个前提不成立：一台刚装的设备永远最新，也永远最空。
 *
 * 所以改成**按字段取并集**：学习记录只增不减，谁有算谁的。
 */
function bucket(a: { attempts: number; correct: number } | undefined, b: typeof a) {
  if (!a) return b;
  if (!b) return a;
  return { attempts: Math.max(a.attempts, b.attempts), correct: Math.max(a.correct, b.correct) };
}

/** 逐键取较大值：统计是累计量，任何一侧的 0 都不该把另一侧拉平 */
function mergeBucketRecord(
  a: Record<string, { attempts: number; correct: number }>,
  b: typeof a,
): typeof a {
  const out: typeof a = {};
  for (const k of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) {
    const m = bucket(a?.[k], b?.[k]);
    if (m) out[k] = m;
  }
  return out;
}

function mergeStats(a: Stats, b: Stats): Stats {
  return {
    attempts: Math.max(a?.attempts ?? 0, b?.attempts ?? 0),
    correct: Math.max(a?.correct ?? 0, b?.correct ?? 0),
    byKnowledge: mergeBucketRecord(a?.byKnowledge ?? {}, b?.byKnowledge ?? {}),
    byType: mergeBucketRecord(a?.byType ?? {}, b?.byType ?? {}),
    byDifficulty: mergeBucketRecord(a?.byDifficulty ?? {}, b?.byDifficulty ?? {}),
    bySource: mergeBucketRecord(a?.bySource ?? {}, b?.bySource ?? {}),
  };
}

/**
 * 设置合并：**云端优先**（b = 远端），仅在「云端该字段仍是默认值、而本机设过」时退而取本机。
 *
 * 为什么不能本机优先：用户的主流预期是「登录 = 把我云端已保存的进度拉下来」。
 * 如果本机优先，就会出现用户退出后在本机随手改了备考时间、再登录把云端真进度覆盖掉的
 * 「重置账号」事故（2026-10-17 用户指出）。云端优先后：
 *   - 换设备 / 清缓存后登录 → 云端进度原样恢复（大众用户预期）
 *   - 云端没设过某字段而本机设过（老用户首次注册、忘登录补救）→ 保留本机，不丢
 *   - 错题 / 历史 / 模考仍是并集，本机登录前做的新题照常补上去
 */
function mergeSettings(a: Settings, b: Settings): Settings {
  const pick = <K extends keyof Settings>(key: K, whenDefault: (v: Settings[K]) => boolean) =>
    whenDefault(b?.[key]) && !whenDefault(a?.[key]) ? a[key] : b?.[key];
  return {
    group: b?.group ?? a?.group,
    examDate: pick('examDate', (v) => !v),
    dailyGoal: pick('dailyGoal', (v) => v === DEFAULT_SETTINGS.dailyGoal),
    examMinutes: pick('examMinutes', (v) => v === DEFAULT_SETTINGS.examMinutes),
  };
}

/**
 * 错题条目合并：以「最后答错」那次为基础，计数取大，掌握状态取更保守。
 *
 * 注意只在**有值**时才挂上可选字段：合并两侧都没用过的字段如果写成 `{}` / undefined，
 * 会让结果与原始条目不等价（指纹对不上，于是每次开页面都判定内容变了、白白重推云端）。
 */
function mergeWrongEntry(a: WrongEntry, b: WrongEntry): WrongEntry {
  const base = (b.lastWrong ?? 0) > (a.lastWrong ?? 0) ? b : a;
  const other = base === a ? b : a;
  const out: WrongEntry = {
    ...base,
    count: Math.max(a.count ?? 0, b.count ?? 0),
    lastWrong: Math.max(a.lastWrong ?? 0, b.lastWrong ?? 0),
    mastered: !!a.mastered && !!b.mastered,
  };
  const reasons = mergeNumberRecord(a.reasons ?? {}, b.reasons ?? {});
  if (Object.keys(reasons).length) out.reasons = reasons;
  // SM-2 调度字段：跟着「最后一次答错」那一侧走，否则复习间隔会乱
  if (base.easiness !== undefined) out.easiness = base.easiness;
  else if (other.easiness !== undefined) out.easiness = other.easiness;
  if (base.interval !== undefined) out.interval = base.interval;
  else if (other.interval !== undefined) out.interval = other.interval;
  if (base.dueDate !== undefined) out.dueDate = base.dueDate;
  else if (other.dueDate !== undefined) out.dueDate = other.dueDate;
  if (base.lastResult !== undefined) out.lastResult = base.lastResult;
  else if (other.lastResult !== undefined) out.lastResult = other.lastResult;
  return out;
}

function mergeNumberRecord(a: Record<string, number>, b: typeof a): typeof a {
  const out: typeof a = {};
  for (const k of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) {
    out[k] = Math.max(a?.[k] ?? 0, b?.[k] ?? 0);
  }
  return out;
}

/**
 * 两侧同步子集合并成一份（并集语义）。
 *
 * @param lastSyncAt 本机上次与云端对齐的时间戳，用来区分
 *   「本机主动删掉的」和「另一台设备新加的」—— 只有晚于 lastSyncAt 的远端条目
 *   才会补进来，否则删除操作会在每次同步时复活。传 0 表示本机从未同步过
 *   （新设备首次登录），此时云端内容照单全收。
 */
export function mergePayloads(
  local: SyncedPayload,
  remote: SyncedPayload,
  lastSyncAt = 0,
  builtin?: BuiltinIndex,
): SyncedPayload {
  const neverSynced = !lastSyncAt;
  // 云端可能混着内置题（旧版本 id 漂移留下的脏数据），合并时一并滤掉，
  // 否则它们会随着每次合并越积越多（题库翻倍就是这么来的）
  const notBuiltin = (p: Problem) => !builtin || !isBuiltinProblem(p, builtin);

  // 历史：id + 时间唯一，只增
  const history = new Map<string, HistoryEntry>();
  for (const h of [...(remote?.history ?? []), ...(local?.history ?? [])]) {
    if (h?.id) history.set(`${h.id}@${h.ts}`, h);
  }

  // 模考记录：同一次模考的时间戳与来源一致
  const exams = new Map<string, ExamRecord>();
  for (const e of [...(remote?.exams ?? []), ...(local?.exams ?? [])]) {
    if (e) exams.set(`${e.ts}|${e.source}|${e.score}`, e);
  }

  // 错题本：键级合并；本机删掉的（且云端条目不比上次同步新）不复活
  const wrongBook: Record<string, WrongEntry> = { ...(local?.wrongBook ?? {}) };
  for (const [k, v] of Object.entries(remote?.wrongBook ?? {})) {
    if (!v) continue;
    const mine = wrongBook[k];
    if (mine) {
      wrongBook[k] = mergeWrongEntry(mine, v);
    } else if (neverSynced || (v.lastWrong ?? 0) > lastSyncAt) {
      wrongBook[k] = v;
    }
  }

  // 标记：同上，本机删掉的不复活
  const flags: Record<string, string> = { ...(remote?.flags ?? {}) };
  if (!neverSynced) {
    for (const k of Object.keys(flags)) {
      if (!(k in (local?.flags ?? {}))) delete flags[k];
    }
  }
  Object.assign(flags, local?.flags ?? {});

  // 导入题：按 id 去重，本地优先（本地是用户亲手导的）；顺序按 id 稳定下来，
  // 免得「先远端后本地」的插入顺序让每次合并的指纹都不一样
  const imported = new Map<string, Problem>();
  for (const p of [...(remote?.importedProblems ?? []), ...(local?.importedProblems ?? [])]) {
    if (p?.id && notBuiltin(p)) imported.set(p.id, p);
  }

  return {
    version: Math.max(local?.version ?? 1, remote?.version ?? 1),
    wrongBook,
    stats: mergeStats(local?.stats ?? emptyState().stats, remote?.stats ?? emptyState().stats),
    history: [...history.values()].sort((x, y) => x.ts - y.ts),
    exams: [...exams.values()].sort((x, y) => x.ts - y.ts),
    settings: mergeSettings(local?.settings ?? DEFAULT_SETTINGS, remote?.settings ?? DEFAULT_SETTINGS),
    flags,
    importedProblems: [...imported.values()].sort((x, y) => (x.id < y.id ? -1 : 1)),
  };
}

/** 把合并后的同步子集落到「本地完整状态」上（内置题以本地代码包为准） */
export function mergeIntoState(
  local: PersistedState | null,
  merged: SyncedPayload,
  builtin: Problem[],
): PersistedState {
  return applyPayload(local, merged, builtin);
}
