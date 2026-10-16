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
import { createCloudBackend } from '../cloudBackend';
import type { StorageAdapter } from '../types';
import { emptyState, type PersistedState } from '../repository';
import type { Problem } from '../../types';
import { loadBuiltinProblems } from '../../data/bank';
import { useAuthStore } from '../../auth/useAuthStore';

// 云端客户端 mock：默认 null（未接入云服务），需要时由用例注入假客户端
const sdkState = vi.hoisted(() => ({ cloud: null as unknown }));
vi.mock('../../cloud/sdk', () => ({ getCloud: () => sdkState.cloud }));

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
  sdkState.cloud = null;
  useAuthStore.setState({
    user: null,
    username: null,
    ready: true,
    syncStatus: 'idle',
    lastSyncAt: null,
    error: null,
  });
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

/**
 * 极简假客户端：只实现 cloudBackend 用到的那几条链
 * （from().select().maybeSingle() / from().upsert() / from().delete().eq()）
 */
function fakeCloud(res: {
  load?: { data: unknown; error: unknown };
  upsert?: { error: unknown };
  owner?: { data: unknown; error: unknown };
  remove?: { error: unknown };
}) {
  const ops: string[] = [];
  let lastUpsert: Record<string, unknown> | null = null;
  const cloud = {
    database: {
      from(table: string) {
        ops.push(`from:${table}`);
        return {
          select(cols: string) {
            ops.push(`select:${cols}`);
            const r = cols.includes('owner_id') ? res.owner : res.load;
            return { maybeSingle: async () => r ?? { data: null, error: null } };
          },
          upsert(values: Record<string, unknown>) {
            ops.push('upsert');
            lastUpsert = values;
            return Promise.resolve(res.upsert ?? { error: null });
          },
          delete() {
            ops.push('delete');
            return {
              eq: async (col: string, val: unknown) => {
                ops.push(`eq:${col}=${String(val)}`);
                return res.remove ?? { error: null };
              },
            };
          },
        };
      },
    },
  };
  return { cloud, ops, lastUpsert: () => lastUpsert };
}

describe('createCloudBackend（假客户端）', () => {
  const updatedAt = new Date().toISOString();

  it('load 读回 payload/updated_at，且不按 owner_id 过滤（交给 RLS）', async () => {
    const payload = mkPayload({ flags: { a: 'star' } });
    const { cloud, ops } = fakeCloud({ load: { data: { payload, updated_at: updatedAt }, error: null } });
    sdkState.cloud = cloud;
    const rec = await createCloudBackend().load('u1');
    expect(rec?.payload.flags).toEqual({ a: 'star' });
    expect(rec?.updated_at).toBe(updatedAt);
    expect(ops).toEqual(['from:user_state', 'select:payload, updated_at']);
    expect(ops.some((o) => o.startsWith('eq:'))).toBe(false);
  });

  it('云端无记录 → 返回 null', async () => {
    const { cloud } = fakeCloud({ load: { data: null, error: null } });
    sdkState.cloud = cloud;
    expect(await createCloudBackend().load('u1')).toBeNull();
  });

  it('save 走 upsert，且写入体里不带 owner_id（由 DEFAULT auth.uid() 填）', async () => {
    const { cloud, ops, lastUpsert } = fakeCloud({});
    sdkState.cloud = cloud;
    await createCloudBackend().save('u1', mkPayload({ version: 3 }), updatedAt);
    expect(ops).toContain('upsert');
    const body = lastUpsert() ?? {};
    expect(body).not.toHaveProperty('owner_id');
    expect(body.schema_version).toBe(3);
    expect(body.updated_at).toBe(updatedAt);
  });

  it('clear 先读回自己的 owner_id 再按它删（避免无 WHERE 的整表删除）', async () => {
    const { cloud, ops } = fakeCloud({ owner: { data: { owner_id: 'uid-9' }, error: null } });
    sdkState.cloud = cloud;
    await createCloudBackend().clear('u1');
    expect(ops).toContain('select:owner_id');
    expect(ops).toContain('eq:owner_id=uid-9');
  });

  it('云端没有记录时 clear 不发删除请求', async () => {
    const { cloud, ops } = fakeCloud({ owner: { data: null, error: null } });
    sdkState.cloud = cloud;
    await createCloudBackend().clear('u1');
    expect(ops).not.toContain('delete');
  });

  it('写失败（权限被拒 42501）抛出可识别错误', async () => {
    const { cloud } = fakeCloud({
      upsert: { error: { message: 'permission denied', code: '42501' } },
    });
    sdkState.cloud = cloud;
    await expect(createCloudBackend().save('u1', mkPayload(), updatedAt)).rejects.toThrow(/42501/);
  });

  it('未接入云服务时直接抛错，不静默成功', async () => {
    sdkState.cloud = null;
    await expect(createCloudBackend().load('u1')).rejects.toThrow(/未接入云服务/);
  });
});
