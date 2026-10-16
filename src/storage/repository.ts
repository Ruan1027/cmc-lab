/**
 * 持久化层 —— 纯逻辑部分
 *
 * 这里只放「与存储介质无关」的代码：状态形状、默认值、归一化、备份序列化。
 * 真正的读写（localStorage / IndexedDB / 将来云端）都收口在 storage/ 下的适配器里，
 * 见 localAdapter.ts 与 indexedDbAdapter.ts，以及 index.ts 的环境选择。
 */
import type {
  ExamGroup,
  ExamRecord,
  HistoryEntry,
  Problem,
  Settings,
  Stats,
  WrongEntry,
} from '../types';
import { DEFAULT_SETTINGS } from './defaults';
import { GROUP_OPTIONS } from '../core/groups';
import { STORAGE_KEY } from './types';

export interface PracticeSnapshot {
  queue: string[];
  idx: number;
  marks: Record<string, string>;
  setupHidden: boolean;
}

export interface PersistedState {
  version: number;
  problems: Problem[];
  wrongBook: Record<string, WrongEntry>;
  stats: Stats;
  history: HistoryEntry[];
  flags: Record<string, string>;
  settings: Settings;
  exams: ExamRecord[];
  practice: PracticeSnapshot | null;
}

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY_LEGACY = STORAGE_KEY;
const HISTORY_MAX = 2000;

export function emptyState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    problems: [],
    wrongBook: {},
    stats: { attempts: 0, correct: 0, byKnowledge: {}, byType: {}, byDifficulty: {}, bySource: {} },
    history: [],
    flags: {},
    settings: { ...DEFAULT_SETTINGS },
    exams: [],
    practice: null,
  };
}

/**
 * 把任意（可能残缺 / 来自旧版本）的输入归一化为完整、可信的 PersistedState。
 *
 * 这是数据完整性的唯一闸门：缺字段用默认值补、非法组别回落默认，避免旧数据
 * 残留无效值导致页面空白或崩溃。被各适配器在读取后统一调用。
 */
export function normalizeState(input: Partial<PersistedState> | null | undefined): PersistedState {
  const base = emptyState();
  const parsed = input || {};
  const settings = { ...base.settings, ...(parsed.settings || {}) };
  // 校验组别：以 GROUP_OPTIONS 为准，避免旧数据残留无效值后出现空白页
  const validGroups = GROUP_OPTIONS.map((o) => o.value);
  if (!validGroups.includes(settings.group)) {
    settings.group = DEFAULT_SETTINGS.group as ExamGroup;
  }
  return {
    version: SCHEMA_VERSION,
    problems: parsed.problems || [],
    wrongBook: parsed.wrongBook || {},
    stats: { ...base.stats, ...(parsed.stats || {}) },
    history: parsed.history || [],
    flags: parsed.flags || {},
    settings,
    exams: parsed.exams || [],
    practice: parsed.practice || null,
  };
}

/** 备份落盘前对历史/模考记录做上限裁剪，避免无限膨胀撑爆存储 */
export function trimForPersist(state: PersistedState): PersistedState {
  return {
    ...state,
    history: state.history.slice(-HISTORY_MAX),
    exams: state.exams.slice(-50),
  };
}

export function exportBackup(state: PersistedState): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

/** 解析备份，失败时抛出可直接展示给用户的错误信息 */
export function parseBackup(text: string): PersistedState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('不是合法的 JSON 文件，解析失败');
  }
  if (!data || typeof data !== 'object') throw new Error('备份格式不对：内容不是对象');
  const obj = data as Partial<PersistedState>;
  if (!Array.isArray(obj.problems)) throw new Error('备份格式不对：缺少 problems 字段');
  return normalizeState(obj);
}

/**
 * 一次性数据修复：把本地存的内置题对齐到当前代码包里的版本，并重映射「以题目 id 为键」的数据。
 *
 * 为什么需要：早期版本的题目 id 由 `uid()`（时间戳 + 随机）生成，而内置题库**每次打开
 * 页面都会重新解析** —— 同一道题在每个会话里 id 都不同。后果有三重：
 *   1. 错题本 / 标记 / 练习历史 / 模考明细全部以 id 为键，刷新一次就全部对不上号
 *      （表现为「刚做的题、刚设的进度，重开就没了」）
 *   2. 同步时内置题剥离不掉，被当成「用户导入题」整批上传云端（实测涨到 202 条）
 *   3. 多端同题不同 id，云端合并出重复题
 *
 * 现在 id 已改为由来源标题派生的确定性值（见 core/parser.ts 的 stableId），
 * 老数据靠这里按 source 对齐一次，把用户的学习记录接回正确的题上。
 *
 * 返回 changed=false 表示本地已经是干净状态（不必写回，避免每次开页面都落一次盘）。
 */
export function reconcileBuiltins(
  state: PersistedState,
  builtin: Problem[],
): { state: PersistedState; changed: boolean } {
  const bySource = new Map(builtin.map((p) => [p.source, p]));
  const idMap = new Map<string, string>();
  const imported: Problem[] = [];

  for (const p of state.problems) {
    const b = bySource.get(p.source);
    if (!b) {
      imported.push(p); // 用户导入题，原样保留
      continue;
    }
    if (p.id !== b.id) idMap.set(p.id, b.id);
  }

  // 内置题永远以代码包为准（题干 / 解析可能也更新过），用户导入题排在后面
  const problems = [...builtin, ...imported];
  const alreadyClean =
    idMap.size === 0 &&
    state.problems.length === problems.length &&
    problems.every((p, i) => state.problems[i].id === p.id && state.problems[i].source === p.source);
  if (alreadyClean) return { state, changed: false };

  const mapId = (id: string): string => idMap.get(id) ?? id;

  const wrongBook: Record<string, WrongEntry> = {};
  for (const [k, v] of Object.entries(state.wrongBook)) wrongBook[mapId(k)] = v;

  const flags: Record<string, string> = {};
  for (const [k, v] of Object.entries(state.flags)) flags[mapId(k)] = v;

  const history = state.history.map((h) => (idMap.has(h.id) ? { ...h, id: mapId(h.id) } : h));

  const exams = state.exams.map((e) =>
    e.detail.some((d) => idMap.has(d.id))
      ? { ...e, detail: e.detail.map((d) => (idMap.has(d.id) ? { ...d, id: mapId(d.id) } : d)) }
      : e,
  );

  return { state: { ...state, problems, wrongBook, flags, history, exams }, changed: true };
}
