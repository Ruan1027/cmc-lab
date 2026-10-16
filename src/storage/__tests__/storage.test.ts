import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Node 环境下没有 localStorage，提供一个内存实现供 LocalStorageAdapter 与迁移测试使用
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.has(k) ? (this.m.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, String(v));
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
  clear(): void {
    this.m.clear();
  }
  key(i: number): string | null {
    return Array.from(this.m.keys())[i] ?? null;
  }
  get length(): number {
    return this.m.size;
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemStorage }).localStorage = new MemStorage();
});

import {
  normalizeState,
  emptyState,
  parseBackup,
  exportBackup,
  reconcileBuiltins,
  type PersistedState,
} from '../repository';
import { LocalStorageAdapter } from '../localAdapter';
import { IndexedDBAdapter } from '../indexedDbAdapter';
import { selectAdapter } from '../index';
import { CloudAdapter } from '../cloudAdapter';
import { STORAGE_KEY } from '../types';
import type { Problem } from '../../types';

// 可切换的云服务配置 mock：默认 null（纯本地语义），个别用例再打开
const cfgState = vi.hoisted(() => ({
  config: null as { endpoint: string; publishableKey: string } | null,
}));
vi.mock('../../cloud/cloudConfig', () => ({
  getCloudConfig: () => cfgState.config,
  cloudEnabled: () => cfgState.config !== null,
  isFileProtocol: () => false,
}));

function fullState(): PersistedState {
  return { ...emptyState(), problems: [{ id: 'p1', type: 'fill', source: 't', stem: 's' }] as PersistedState['problems'] };
}

describe('normalizeState', () => {
  it('null 输入返回空状态形状', () => {
    const s = normalizeState(null);
    expect(s.version).toBe(1);
    expect(s.problems).toEqual([]);
    expect(s.stats.attempts).toBe(0);
  });
  it('非法组别回落默认', () => {
    const s = normalizeState({ settings: { group: '乱写的组' } } as unknown as Partial<PersistedState>);
    expect(s.settings.group).toBe('非数学A类');
  });
  it('缺字段用默认值补齐', () => {
    const s = normalizeState({ problems: [{ id: 'x' }] } as unknown as Partial<PersistedState>);
    expect(s.problems).toHaveLength(1);
    expect(s.flags).toEqual({});
  });
});

describe('LocalStorageAdapter', () => {
  it('save 后 load 能取回', async () => {
    const a = new LocalStorageAdapter();
    expect(await a.save(fullState())).toBe(true);
    const loaded = await a.load();
    expect(loaded?.problems).toHaveLength(1);
  });
  it('clear 后 load 返回 null', async () => {
    const a = new LocalStorageAdapter();
    await a.save(fullState());
    await a.clear();
    expect(await a.load()).toBeNull();
  });
  it('写入抛错时返回 false（配额超限）', async () => {
    const a = new LocalStorageAdapter();
    const orig = localStorage.setItem.bind(localStorage);
    (localStorage as unknown as { setItem: (k: string, v: string) => void }).setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(await a.save(fullState())).toBe(false);
    (localStorage as unknown as { setItem: (k: string, v: string) => void }).setItem = orig;
  });
});

describe('selectAdapter（环境选择，file:// 强约束）', () => {
  it('file:// 始终用 LocalStorageAdapter', () => {
    expect(selectAdapter({ protocol: 'file:', hasIndexedDB: true })).toBeInstanceOf(
      LocalStorageAdapter,
    );
  });
  it('http + 有 IndexedDB → IndexedDBAdapter', () => {
    expect(selectAdapter({ protocol: 'http:', hasIndexedDB: true })).toBeInstanceOf(
      IndexedDBAdapter,
    );
  });
  it('http + 无 IndexedDB → 回退 LocalStorageAdapter', () => {
    expect(selectAdapter({ protocol: 'https:', hasIndexedDB: false })).toBeInstanceOf(
      LocalStorageAdapter,
    );
  });
  it('http + 配置了云端 → CloudAdapter 包装（含本地回退能力）', () => {
    cfgState.config = { endpoint: 'https://cmc-lab.app.workbuddy.host', publishableKey: 'wbpk_x' };
    try {
      expect(selectAdapter({ protocol: 'http:', hasIndexedDB: true })).toBeInstanceOf(
        CloudAdapter,
      );
    } finally {
      cfgState.config = null;
    }
  });
});

describe('IndexedDBAdapter', () => {
  beforeEach(async () => {
    await new IndexedDBAdapter().clear();
  });
  it('save 后 load 取回', async () => {
    const a = new IndexedDBAdapter();
    expect(await a.save(fullState())).toBe(true);
    const loaded = await a.load();
    expect(loaded?.problems).toHaveLength(1);
  });
  it('首次从旧 localStorage 迁移并清理遗留键', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState()));
    const loaded = await new IndexedDBAdapter().load();
    expect(loaded?.problems).toHaveLength(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
  it('clear 同时清理遗留 localStorage，防止重置后复活', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState()));
    const a = new IndexedDBAdapter();
    await a.clear();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(await a.load()).toBeNull();
  });
});

describe('备份解析', () => {
  it('导出→导入 往返保持题目数', () => {
    const s = parseBackup(exportBackup(fullState()));
    expect(s.problems).toHaveLength(1);
  });
  it('非法 JSON 抛错并带可提示信息', () => {
    expect(() => parseBackup('not json')).toThrow(/JSON/);
  });
});

function mkP(id: string, source: string): Problem {
  return {
    id,
    source,
    type: 'fill',
    knowledge: [],
    difficulty: 3,
    score: null,
    group: '',
    hint: '',
    pitfall: '',
    stem: 'x',
    options: [],
    answer: '1',
    answerAlt: [],
    solution: '',
  };
}

/**
 * 老数据修复：早期题目 id 是随机的（每次开页面都变），而错题本 / 标记 / 历史 /
 * 模考明细全部以 id 为键 —— 不按来源标题对齐一次，用户的学习记录就全是孤儿键。
 */
describe('reconcileBuiltins（老数据按来源对齐）', () => {
  const builtin = [mkP('q_a', 'A'), mkP('q_b', 'B')];

  it('换掉旧 id，并把错题本 / 标记 / 历史 / 模考明细一起重映射', () => {
    const legacy: PersistedState = {
      ...emptyState(),
      problems: [mkP('old_a', 'A'), mkP('old_b', 'B'), mkP('imp', '我自己导入的题')],
      wrongBook: { old_a: { count: 2, lastWrong: 1, mastered: false } },
      flags: { old_b: 'star' },
      history: [{ id: 'old_a', result: 'wrong', ts: 1 }],
      exams: [
        {
          ts: 1,
          source: 's',
          minutes: 10,
          used: 5,
          score: 5,
          total: 10,
          right: 0,
          partial: 0,
          wrong: 1,
          blank: 0,
          auto: false,
          detail: [{ id: 'old_b', source: 'B', result: 'wrong', sc: 0 }],
        },
      ],
    };

    const { state, changed } = reconcileBuiltins(legacy, builtin);

    expect(changed).toBe(true);
    expect(state.problems.map((p) => p.id)).toEqual(['q_a', 'q_b', 'imp']); // 内置题在前
    expect(state.wrongBook.q_a).toBeDefined();
    expect(state.wrongBook.old_a).toBeUndefined();
    expect(state.flags.q_b).toBe('star');
    expect(state.history[0].id).toBe('q_a');
    expect(state.exams[0].detail[0].id).toBe('q_b');
  });

  it('本地只剩一部分内置题时补全', () => {
    const partial: PersistedState = { ...emptyState(), problems: [mkP('q_a', 'A')] };
    const { changed, state } = reconcileBuiltins(partial, builtin);
    expect(changed).toBe(true);
    expect(state.problems.map((p) => p.id)).toEqual(['q_a', 'q_b']);
  });

  it('已经是干净数据 → changed=false，且不产生新对象（避免每次开页面都落一次盘）', () => {
    const clean: PersistedState = {
      ...emptyState(),
      problems: [mkP('q_a', 'A'), mkP('q_b', 'B')],
    };
    const { changed, state } = reconcileBuiltins(clean, builtin);
    expect(changed).toBe(false);
    expect(state).toBe(clean);
  });
});
