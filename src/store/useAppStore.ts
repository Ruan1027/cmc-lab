/**
 * 全局状态
 *
 * 用 Zustand：体积小、无 Provider 嵌套、 select 精确订阅。
 * 所有持久化字段集中在这里，save 由各 action 显式调用，避免写扩散。
 */
import { create } from 'zustand';
import type {
  AnswerResult,
  ExamGroup,
  ExamRecord,
  HistoryEntry,
  Problem,
  Settings,
  Stats,
  StatsBucket,
  WrongEntry,
} from '../types';
import {
  emptyState,
  exportBackup,
  parseBackup,
  type PersistedState,
  type PracticeSnapshot,
} from '../storage/repository';
import { getAdapter, getCloudAdapter } from '../storage';
import { loadBuiltinProblems } from '../data/bank';
import { parseMarkdown } from '../core/parser';
import { sourceGroup } from '../core/knowledge';
import { nextSched, schedOf } from '../core/scheduler';

type Bag = Record<string, StatsBucket>;

function bump(bag: Bag, key: string, result: AnswerResult): void {
  const b = (bag[key] ||= { attempts: 0, correct: 0 });
  b.attempts += 1;
  if (result === 'correct') b.correct += 1;
  else if (result === 'partial') b.correct += 0.5;
}

/** 统计快照：recordResult 与 recordResults 共用 */
interface StatSlice {
  stats: Stats;
  history: HistoryEntry[];
  wrongBook: Record<string, WrongEntry>;
}

/**
 * 计算一次作答对统计与错题本的影响（纯函数，不写 store）。
 * 跳过（skipped）不计入任何统计，返回 null。
 */
function applyResult(
  s: StatSlice,
  p: Problem,
  result: AnswerResult,
  userAnswer = '',
  reason?: string,
): StatSlice | null {
  if (result === 'skipped') return null;

  const stats: Stats = {
    attempts: s.stats.attempts,
    correct: s.stats.correct,
    byKnowledge: { ...s.stats.byKnowledge },
    byType: { ...s.stats.byType },
    byDifficulty: { ...s.stats.byDifficulty },
    bySource: { ...s.stats.bySource },
  };
  const wrongBook: Record<string, WrongEntry> = { ...s.wrongBook };

  stats.attempts += 1;
  if (result === 'correct') stats.correct += 1;
  else if (result === 'partial') stats.correct += 0.5;

  bump(stats.byType as Bag, p.type, result);
  bump(stats.byDifficulty as Bag, String(p.difficulty), result);
  bump(stats.bySource as Bag, sourceGroup(p.source), result);
  (p.knowledge || []).forEach((k) => bump(stats.byKnowledge as Bag, k, result));

  const history = [...s.history, { id: p.id, result, ts: Date.now(), ua: userAnswer }];

  if (result === 'correct') {
    if (wrongBook[p.id]) {
      // 曾经错过：推进间隔重复调度。掌握不是终点，到期后仍会被召回复习
      const prev = wrongBook[p.id];
      const sc = nextSched(schedOf(prev), 'correct');
      wrongBook[p.id] = {
        ...prev,
        mastered: true,
        lastResult: result,
        easiness: sc.easiness,
        interval: sc.interval,
        dueDate: sc.dueDate,
        reps: sc.reps,
      };
    }
  } else {
    const prev = wrongBook[p.id] || { count: 0, lastWrong: 0, mastered: false, reasons: {} };
    const reasons = { ...(prev.reasons || {}) };
    if (reason) reasons[reason] = (reasons[reason] || 0) + 1;
    // 答错/部分正确：按 SM-2 重新调度（答错重置间隔，部分正确放缓增速）
    const sc = nextSched(schedOf(prev), result);
    wrongBook[p.id] = {
      count: prev.count + 1,
      lastWrong: Date.now(),
      mastered: false,
      lastResult: result,
      reasons,
      easiness: sc.easiness,
      interval: sc.interval,
      dueDate: sc.dueDate,
      reps: sc.reps,
    };
  }

  return { stats, history, wrongBook };
}

interface Session {
  queue: string[];
  idx: number;
  marks: Record<string, AnswerResult>;
  setupHidden: boolean;
  /** 是否来自「继续上次」 */
  resumed: boolean;
}

interface Actions {
  hydrate: () => void;
  importMarkdown: (text: string) => { added: number; skipped: number; total: number };
  recordResult: (p: Problem, result: AnswerResult, userAnswer?: string, reason?: string) => void;
  /** 整卷提交（模考交卷），只落盘一次 */
  recordResults: (
    entries: Array<{ p: Problem; result: AnswerResult; ua?: string; reason?: string }>,
  ) => void;
  markMastered: (id: string, mastered: boolean) => void;
  toggleStar: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setGroup: (group: ExamGroup) => void;
  addExamRecord: (rec: ExamRecord) => void;
  startSession: (ids: string[], hideSetup?: boolean) => void;
  goTo: (idx: number) => void;
  markSession: (id: string, result: AnswerResult) => void;
  endSession: () => void;
  restoreBackup: (text: string) => void;
  exportJSON: () => string;
  resetAll: () => void;
  /** 老用户迁移：把当前本地数据立即上传到云端 */
  uploadLocalData: () => void;
}

export interface AppState extends Omit<PersistedState, 'practice'> {
  hydrated: boolean;
  session: Session;
  toast: string | null;
  notify: (msg: string) => void;
}

export const useAppStore = create<AppState & Actions>()((set, get) => {
  /** 把当前持久字段落盘；失败时提示用户导出备份（异步、不阻塞交互） */
  const persist = () => {
    const s = get();
    const snapshot: PersistedState = {
      version: s.version,
      problems: s.problems,
      wrongBook: s.wrongBook,
      stats: s.stats,
      history: s.history,
      flags: s.flags,
      settings: s.settings,
      exams: s.exams,
      practice: {
        queue: s.session.queue,
        idx: s.session.idx,
        marks: s.session.marks,
        setupHidden: s.session.setupHidden,
      } as PracticeSnapshot,
    };
    void getAdapter()
      .save(snapshot)
      .then((ok) => {
        if (!ok) get().notify('保存失败：浏览器存储空间可能已满，请到「题库」页导出备份');
      });
  };

  return {
    ...((): Omit<PersistedState, 'practice'> => {
      const { practice: _practice, ...rest } = emptyState();
      return rest;
    })(),
    hydrated: false,
    session: { queue: [], idx: 0, marks: {}, setupHidden: false, resumed: false },
    toast: null,

    notify: (msg) => {
      set({ toast: msg });
      setTimeout(() => {
        if (get().toast === msg) set({ toast: null });
      }, 2600);
    },

    hydrate: async () => {
      const saved = await getAdapter().load();
      const base = saved ?? emptyState();
      const problems = base.problems.length ? base.problems : loadBuiltinProblems();
      const { practice, ...persisted } = base;
      set({
        ...persisted,
        problems,
        hydrated: true,
        session: {
          queue: practice?.queue || [],
          idx: practice?.idx || 0,
          marks: (practice?.marks || {}) as Record<string, AnswerResult>,
          setupHidden: !!practice?.setupHidden,
          resumed: !!practice?.queue?.length,
        },
      });
      if (!base.problems.length) persist();
    },

    importMarkdown: (text) => {
      const list = parseMarkdown(text);
      // 用新数组而不是往 state.problems 里 push：
      // 直接改原数组属于可变更新，Zustand 的浅比较可能判定「没变」而不触发渲染
      const merged = get().problems.slice();
      let added = 0;
      let skipped = 0;
      list.forEach((p) => {
        const dup = merged.some((x) => x.source === p.source && x.stem === p.stem);
        if (dup) {
          skipped += 1;
          return;
        }
        merged.push(p);
        added += 1;
      });
      set({ problems: merged });
      persist();
      return { added, skipped, total: list.length };
    },

    recordResult: (p, result, userAnswer = '', reason) => {
      const applied = applyResult(get(), p, result, userAnswer, reason);
      if (applied) set(applied);
      set({
        session: {
          ...get().session,
          marks: { ...get().session.marks, [p.id]: result },
        },
      });
      persist();
    },

    // 模考交卷时一次性提交整卷：逐题调用 recordResult 会写 10 次 localStorage，
    // 每次都要把全量状态序列化一遍，没必要
    recordResults: (entries) => {
      let cur = get();
      const marks = { ...cur.session.marks };
      let dirty = false;
      entries.forEach(({ p, result, ua = '', reason }) => {
        const applied = applyResult(cur, p, result, ua, reason);
        if (applied) {
          cur = { ...cur, ...applied };
          dirty = true;
        }
        marks[p.id] = result;
      });
      set({
        stats: cur.stats,
        history: cur.history,
        wrongBook: cur.wrongBook,
        session: { ...cur.session, marks },
      });
      if (dirty || entries.length) persist();
    },

    markMastered: (id, mastered) => {
      const wb = { ...get().wrongBook };
      if (!wb[id]) return;
      wb[id] = { ...wb[id], mastered };
      set({ wrongBook: wb });
      persist();
    },

    toggleStar: (id) => {
      const flags = { ...get().flags };
      if (flags[id]) delete flags[id];
      else flags[id] = 'star';
      set({ flags });
      persist();
    },

    updateSettings: (patch) => {
      set({ settings: { ...get().settings, ...patch } });
      persist();
    },

    setGroup: (group) => get().updateSettings({ group }),

    addExamRecord: (rec) => {
      set({ exams: [...get().exams, rec] });
      persist();
    },

    startSession: (ids, hideSetup = true) => {
      set({
        session: { queue: ids, idx: 0, marks: {}, setupHidden: hideSetup, resumed: false },
      });
      persist();
    },

    goTo: (idx) => {
      const s = get().session;
      set({ session: { ...s, idx: Math.max(0, Math.min(idx, s.queue.length - 1)) } });
      persist();
    },

    markSession: (id, result) => {
      const s = get().session;
      set({ session: { ...s, marks: { ...s.marks, [id]: result } } });
      persist();
    },

    endSession: () => {
      set({ session: { queue: [], idx: 0, marks: {}, setupHidden: false, resumed: false } });
      persist();
    },

    restoreBackup: (text) => {
      const data = parseBackup(text);
      set({
        problems: data.problems,
        wrongBook: data.wrongBook,
        stats: data.stats,
        history: data.history,
        flags: data.flags,
        settings: data.settings,
        exams: data.exams,
        session: { queue: [], idx: 0, marks: {}, setupHidden: false, resumed: false },
      });
      persist();
    },

    exportJSON: () => {
      const s = get();
      return exportBackup({
        version: s.version,
        problems: s.problems,
        wrongBook: s.wrongBook,
        stats: s.stats,
        history: s.history,
        flags: s.flags,
        settings: s.settings,
        exams: s.exams,
        practice: null,
      });
    },

    resetAll: () => {
      void getAdapter().clear();
      const fresh = emptyState();
      const { practice: _practice, ...rest } = fresh;
      set({
        ...rest,
        problems: loadBuiltinProblems(),
        session: { queue: [], idx: 0, marks: {}, setupHidden: false, resumed: false },
      });
      persist();
    },

    uploadLocalData: () => {
      const a = getCloudAdapter();
      if (!a) {
        get().notify('当前环境未启用云同步');
        return;
      }
      const s = get();
      const snapshot: PersistedState = {
        version: s.version,
        problems: s.problems,
        wrongBook: s.wrongBook,
        stats: s.stats,
        history: s.history,
        flags: s.flags,
        settings: s.settings,
        exams: s.exams,
        practice: null,
      };
      void a.uploadCurrent(snapshot);
      get().notify('已把本地数据上传到云端');
    },
  };
});
