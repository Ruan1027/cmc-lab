/**
 * 全局状态
 *
 * 用 Zustand：体积小、无 Provider 嵌套、 select 精确订阅。
 * 所有持久化字段集中在这里，save 由各 action 显式调用，避免写扩散。
 */
import { create } from 'zustand';
import type {
  AnswerResult, ExamGroup, ExamRecord, HistoryEntry, Problem, Settings, Stats, StatsBucket, WrongEntry,
} from '../types';
import {
  clearState, emptyState, exportBackup, loadState, parseBackup, saveState,
  type PersistedState, type PracticeSnapshot,
} from '../storage/repository';
import { loadBuiltinProblems } from '../data/bank';
import { parseMarkdown } from '../core/parser';
import { sourceGroup } from '../core/knowledge';

type Bag = Record<string, StatsBucket>;

function bump(bag: Bag, key: string, result: AnswerResult): void {
  const b = (bag[key] ||= { attempts: 0, correct: 0 });
  b.attempts += 1;
  if (result === 'correct') b.correct += 1;
  else if (result === 'partial') b.correct += 0.5;
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
}

export interface AppState extends Omit<PersistedState, 'practice'> {
  hydrated: boolean;
  session: Session;
  toast: string | null;
  notify: (msg: string) => void;
}

export const useAppStore = create<AppState & Actions>()((set, get) => {
  /** 把当前持久字段落盘 */
  const persist = () => {
    const s = get();
    saveState({
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

    hydrate: () => {
      const saved = loadState();
      const problems = saved.problems.length ? saved.problems : loadBuiltinProblems();
      set({
        ...saved,
        problems,
        hydrated: true,
        session: {
          queue: saved.practice?.queue || [],
          idx: saved.practice?.idx || 0,
          marks: (saved.practice?.marks || {}) as Record<string, AnswerResult>,
          setupHidden: !!saved.practice?.setupHidden,
          resumed: !!saved.practice?.queue?.length,
        },
      });
      if (!saved.problems.length) persist();
    },

    importMarkdown: (text) => {
      const list = parseMarkdown(text);
      const existing = get().problems;
      let added = 0;
      let skipped = 0;
      list.forEach((p) => {
        const dup = existing.find((x) => x.source === p.source && x.stem === p.stem);
        if (dup) {
          skipped += 1;
          return;
        }
        existing.push(p);
        added += 1;
      });
      set({ problems: [...existing] });
      persist();
      return { added, skipped, total: list.length };
    },

    recordResult: (p, result, userAnswer = '', reason) => {
      const s = get();
      const stats: Stats = {
        attempts: s.stats.attempts,
        correct: s.stats.correct,
        byKnowledge: { ...s.stats.byKnowledge },
        byType: { ...s.stats.byType },
        byDifficulty: { ...s.stats.byDifficulty },
        bySource: { ...s.stats.bySource },
      };
      const wrongBook: Record<string, WrongEntry> = { ...s.wrongBook };

      // 跳过不计入统计
      if (result !== 'skipped') {
        stats.attempts += 1;
        if (result === 'correct') stats.correct += 1;
        else if (result === 'partial') stats.correct += 0.5;

        bump(stats.byType as Bag, p.type, result);
        bump(stats.byDifficulty as Bag, String(p.difficulty), result);
        bump(stats.bySource as Bag, sourceGroup(p.source), result);
        (p.knowledge || []).forEach((k) => bump(stats.byKnowledge as Bag, k, result));

        const entry: HistoryEntry = { id: p.id, result, ts: Date.now(), ua: userAnswer };
        const history = [...s.history, entry];

        if (result === 'correct') {
          if (wrongBook[p.id]) {
            wrongBook[p.id] = { ...wrongBook[p.id], mastered: true, lastResult: result };
          }
        } else {
          const prev = wrongBook[p.id] || { count: 0, lastWrong: 0, mastered: false, reasons: {} };
          const reasons = { ...(prev.reasons || {}) };
          if (reason) reasons[reason] = (reasons[reason] || 0) + 1;
          wrongBook[p.id] = {
            count: prev.count + 1,
            lastWrong: Date.now(),
            mastered: false,
            lastResult: result,
            reasons,
          };
        }

        set({ stats, history, wrongBook });
      }

      set({
        session: {
          ...get().session,
          marks: { ...get().session.marks, [p.id]: result },
        },
      });
      persist();
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
      clearState();
      const fresh = emptyState();
      const { practice: _practice, ...rest } = fresh;
      set({
        ...rest,
        problems: loadBuiltinProblems(),
        session: { queue: [], idx: 0, marks: {}, setupHidden: false, resumed: false },
      });
      persist();
    },
  };
});
