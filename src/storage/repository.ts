/**
 * 持久化层
 *
 * MVP 用 localStorage：零依赖、在 Capacitor（iOS/Android）环境下同样可用。
 * 抽象成接口是为了后续平滑替换到 IndexedDB（题库与作答记录增长后
 * localStorage 的 5MB 上限会成为瓶颈），届时只需换一个实现，上层不动。
 */
import type { ExamGroup, ExamRecord, HistoryEntry, Problem, Settings, Stats, WrongEntry } from '../types';
import { DEFAULT_SETTINGS } from './defaults';
import { GROUP_OPTIONS } from '../core/groups';

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
const KEY = 'cmc_lab_state_v1';
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

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const base = emptyState();
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
  } catch {
    return emptyState();
  }
}

/**
 * 写入持久化状态，返回是否成功。
 *
 * 返回布尔值而不是静默吞掉异常：localStorage 写满（QuotaExceededError）时
 * 数据其实没存上，若不告知用户，他会以为进度已保存，下次打开全没了——
 * 这是最伤用户的失败方式，必须让上层有机会提示导出备份。
 */
export function saveState(state: PersistedState): boolean {
  try {
    const trimmed: PersistedState = {
      ...state,
      history: state.history.slice(-HISTORY_MAX),
      exams: state.exams.slice(-50),
    };
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
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
  const base = emptyState();
  return {
    ...base,
    ...obj,
    stats: { ...base.stats, ...(obj.stats || {}) },
    settings: { ...base.settings, ...(obj.settings || {}) },
  };
}
