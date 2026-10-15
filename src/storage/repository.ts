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
