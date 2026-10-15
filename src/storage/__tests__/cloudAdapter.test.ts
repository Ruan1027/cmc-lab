import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toSyncedPayload,
  applyPayload,
  mergeLWW,
  type RemoteBackend,
  type RemoteRecord,
  type SyncedPayload,
} from '../remote';
import { CloudAdapter } from '../cloudAdapter';
import { createSupabaseBackend } from '../supabaseBackend';
import type { StorageAdapter } from '../types';
import { emptyState, type PersistedState } from '../repository';
import type { Problem } from '../../types';
import { loadBuiltinProblems } from '../../data/bank';
import { useAuthStore } from '../../auth/useAuthStore';

function mkProblem(id: string): Problem {
  return {
    id,
    source: `src-${id}`,
    type: 'fill',
    knowledge: [],
    difficulty: 1,
    score: 5,
    group: '非数学A类',
    hint: '',
    pitfall: '',
    stem: 'x',
    options: [],
    answer: '1',
    answerAlt: [],
    solution: '',
  };
}

function mkState(over: Partial<PersistedState> = {}): PersistedState {
  return { ...emptyState(), ...over };
}

function mkPayload(over: Partial<SyncedPayload> = {}): SyncedPayload {
  return {
    version: 1,
    wrongBook: {},
    stats: { attempts: 0, correct: 0, byKnowledge: {}, byType: {}, byDifficulty: {}, bySource: {} },
    history: [],
    exams: [],
    settings: emptyState().settings,
    flags: {},
    importedProblems: [],
    ...over,
  };
}

function memAdapter() {
  let store: PersistedState | null = null;
  const adapter: StorageAdapter = {
    async load() {
      return store;
    },
    async save(s) {
      store = s;
      return true;
    },
    async clear() {
      store = null;
    },
  };
  return { adapter, get: () => store };
}

function makeRemote() {
  const calls = { load: 0, save: 0, clear: 0, saved: [] as Array<{ userId: string; payload: SyncedPayload; updatedAt: string }> };
  let record: RemoteRecord | null = null;
  const remote: RemoteBackend = {
    async load(_userId) {
      calls.load++;
      return record;
    },
    async save(userId, payload, updatedAt) {
      calls.save++;
      calls.saved.push({ userId, payload, updatedAt });
      record = { payload, updated_at: updatedAt };
    },
    async clear(_userId) {
      calls.clear++;
      record = null;
    },
  };
  return { remote, calls, setRecord: (r: RemoteRecord | null) => (record = r) };
}

beforeEach(() => {
  useAuthStore.setState({ user: null, session: null, ready: true, syncStatus: 'idle', lastSyncAt: null, error: null });
});

describe('remote 纯逻辑', () => {
  it('toSyncedPayload 剥离内置题，只留导入题', () => {
    const builtinIds = new Set(['b1', 'b2']);
    const state = mkState({ problems: [mkProblem('b1'), mkProblem('b2'), mkProblem('imp1')] });
    const p = toSyncedPayload(state, builtinIds);
    expect(p.importedProblems.map((x) => x.id)).toEqual(['imp1']);
    expect(p.stats).toBe(state.stats);
  });

  it('applyPayload 合并内置题 + 导入题', () => {
    const builtin = [mkProblem('b1')];
    const payload: SyncedPayload = {
      version: 1,
      wrongBook: {},
      stats: { attempts: 3, correct: 2, byKnowledge: {}, byType: {}, byDifficulty: {}, bySource: {} },
      history: [],
      exams: [],
      settings: emptyState().settings,
      flags: {},
      importedProblems: [mkProblem('imp1')],
    };
    const merged = applyPayload(null, payload, builtin);
    expect(merged.problems.map((x) => x.id).sort()).toEqual(['b1', 'imp1']);
  });

  it('mergeLWW：云端更新则采用云端', () => {
    const remote: RemoteRecord = {
      payload: mkPayload({ wrongBook: { x: { count: 1, lastWrong: 1, mastered: false } } }),
      updated_at: new Date(Date.now() + 1000).toISOString(),
    };
    const { state, adoptedRemote } = mergeLWW(mkState(), remote, 0, [mkProblem('b1')]);
    expect(adoptedRemote).toBe(true);
    expect(state.wrongBook.x).toBeDefined();
  });

  it('mergeLWW：云端不比本地新则保留本地', () => {
    const old = new Date(Date.now() - 100000).toISOString();
    const remote: RemoteRecord = { payload: mkPayload(), updated_at: old };
    const local = mkState({ history: [{ id: 'a', result: 'correct', ts: 1 }] });
    const { state, adoptedRemote } = mergeLWW(local, remote, Date.now(), [mkProblem('b1')]);
    expect(adoptedRemote).toBe(false);
    expect(state.history.length).toBe(1);
  });
});

describe('CloudAdapter', () => {
  it('未登录时只走本地，不触网', async () => {
    const { remote, calls } = makeRemote();
    const { adapter } = memAdapter();
    const ca = new CloudAdapter({ local: adapter, remote, getUserId: () => null, debounceMs: 50 });
    const localState = mkState({ problems: [mkProblem('b1')] });
    await adapter.save(localState);
    const loaded = await ca.load();
    expect(calls.load).toBe(0);
    expect(loaded?.problems[0].id).toBe('b1');
  });

  it('已登录且云端更新 → 采用云端并写回本地', async () => {
    const { remote, calls, setRecord } = makeRemote();
    const { adapter, get } = memAdapter();
    setRecord({
      payload: mkPayload({ wrongBook: { x: { count: 2, lastWrong: 1, mastered: false } } }),
      updated_at: new Date(Date.now() + 5000).toISOString(),
    });
    const ca = new CloudAdapter({ local: adapter, remote, getUserId: () => 'u1', debounceMs: 50 });
    const loaded = await ca.load();
    expect(calls.load).toBe(1);
    expect(loaded?.wrongBook.x).toBeDefined();
    // 本地被写回合并结果
    expect(get()?.wrongBook.x).toBeDefined();
    expect(useAuthStore.getState().syncStatus).toBe('synced');
  });

  it('已登录但云端报错 → 退回本地并标记 offline', async () => {
    const faulty: RemoteBackend = {
      async load() {
        throw new Error('network');
      },
      async save() {},
      async clear() {},
    };
    const { adapter } = memAdapter();
    const ca = new CloudAdapter({ local: adapter, remote: faulty, getUserId: () => 'u1', debounceMs: 50 });
    const localState = mkState({ problems: [mkProblem('b1')] });
    await adapter.save(localState);
    const loaded = await ca.load();
    expect(loaded?.problems[0].id).toBe('b1');
    expect(useAuthStore.getState().syncStatus).toBe('offline');
  });

  it('save 后防抖上传，且不同步内置题', async () => {
    vi.useFakeTimers();
    const { remote, calls } = makeRemote();
    const { adapter } = memAdapter();
    const ca = new CloudAdapter({ local: adapter, remote, getUserId: () => 'u1', debounceMs: 100 });
    // 用真实内置题 id（来自题库）验证它会被剥离，仅导入题进入同步子集
    const realBuiltin = loadBuiltinProblems()[0].id;
    await ca.save(mkState({ problems: [mkProblem(realBuiltin), mkProblem('imp1')] }));
    expect(calls.save).toBe(0); // 尚未到防抖时间
    await vi.advanceTimersByTimeAsync(150);
    expect(calls.save).toBe(1);
    expect(calls.saved[0].userId).toBe('u1');
    expect(calls.saved[0].payload.importedProblems.map((p) => p.id)).toEqual(['imp1']);
    vi.useRealTimers();
  });

  it('clear 同时清本地与云端', async () => {
    const { remote, calls } = makeRemote();
    const { adapter } = memAdapter();
    const ca = new CloudAdapter({ local: adapter, remote, getUserId: () => 'u1', debounceMs: 50 });
    await ca.clear();
    expect(calls.clear).toBe(1);
  });
});

describe('createSupabaseBackend（fetch mock）', () => {
  it('load / save / clear 调用正确端点', async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (String(url).includes('/user_state?')) {
        return new Response(JSON.stringify([{ payload: mkPayload(), updated_at: new Date().toISOString() }]), {
          status: 200,
        });
      }
      return new Response('{}', { status: 200 });
    });
    const backend = createSupabaseBackend(
      { url: 'https://x.supabase.co', anonKey: 'k' },
      () => 'tok',
      fetchMock as unknown as typeof fetch,
    );
    const rec = await backend.load('u1');
    expect(rec).not.toBeNull();
    await backend.save('u1', mkPayload(), new Date().toISOString());
    expect(
      fetchMock.mock.calls.some(
        (c) => c[0].toString().includes('/rest/v1/user_state') && c[1]?.method === 'POST',
      ),
    ).toBe(true);
    await backend.clear('u1');
    expect(fetchMock.mock.calls.some((c) => c[1]?.method === 'DELETE')).toBe(true);
  });
});
