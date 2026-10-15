import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';

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
  type PersistedState,
} from '../repository';
import { LocalStorageAdapter } from '../localAdapter';
import { IndexedDBAdapter } from '../indexedDbAdapter';
import { selectAdapter } from '../index';
import { STORAGE_KEY } from '../types';

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
