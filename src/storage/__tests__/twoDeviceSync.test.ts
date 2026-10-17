/**
 * 双设备真场景回归：一台有数据、一台空的设备轮流登录，数据不许丢。
 *
 * 这些用例复现的是线上真实事故（2026-10-16）：用户在电脑设了备考时间，
 * 手机登录后看不到，电脑再登录连本地的备考时间也没了 —— 原因是整包 LWW
 * 让「后写入的空数据」赢了「先写入的有效数据」。
 */
import { describe, it, expect } from 'vitest';
import {
  toSyncedPayload,
  mergePayloads,
  applyPayload,
  buildBuiltinIndex,
  fingerprintPayload,
  type RemoteRecord,
  type SyncedPayload,
} from '../remote';
import { emptyState, type PersistedState } from '../repository';
import { DEFAULT_SETTINGS } from '../defaults';
import type { Problem, Settings, HistoryEntry } from '../../types';

function mkProblem(id: string, source = `src-${id}`): Problem {
  return {
    id,
    source,
    group: '非数学A类',
    type: 'fill',
    stem: `题${id}`,
    answer: '1',
    knowledge: ['极限'],
    difficulty: 3,
    score: 10,
    hint: '',
    pitfall: '',
    options: [],
    answerAlt: [],
    solution: '',
  };
}

function mkState(patch: Partial<PersistedState> = {}): PersistedState {
  return { ...emptyState(), ...patch };
}

function mkSettings(patch: Partial<Settings> = {}): Settings {
  return { ...DEFAULT_SETTINGS, ...patch };
}

const BUILTIN = [mkProblem('b1'), mkProblem('b2')];
const INDEX = buildBuiltinIndex(BUILTIN);

function payloadOf(s: PersistedState): SyncedPayload {
  return toSyncedPayload(s, INDEX);
}

/** 一台「用了很久」的设备：有备考时间、有错题、有历史、有统计 */
function richState(): PersistedState {
  return mkState({
    settings: mkSettings({ examDate: '2027-03-20', dailyGoal: 20 }),
    wrongBook: { b1: { count: 2, lastWrong: 1000, mastered: false } },
    history: [{ id: 'b1', result: 'wrong', ts: 1000 }],
    flags: { b2: 'star' },
    stats: {
      ...emptyState().stats,
      attempts: 10,
      correct: 7,
      byKnowledge: { 极限: { attempts: 10, correct: 7 } },
    },
  });
}

describe('双设备同步：空设备不许把有数据的设备清空', () => {
  it('空设备登录后与云端合并，仍能看到另一台的备考时间与错题', () => {
    const remote = payloadOf(richState());
    const local = payloadOf(mkState()); // 新设备，全是默认值

    const merged = mergePayloads(local, remote, 0);

    expect(merged.settings.examDate).toBe('2027-03-20');
    expect(merged.settings.dailyGoal).toBe(20);
    expect(merged.wrongBook.b1?.count).toBe(2);
    expect(merged.history).toHaveLength(1);
    expect(merged.flags.b2).toBe('star');
    expect(merged.stats.attempts).toBe(10);
  });

  it('有数据的设备与「被空设备写过的云端」合并，自己的数据仍在（不被回退）', () => {
    // 手机把空数据推上云端之后，电脑再次打开页面
    const remote = payloadOf(mkState());
    const local = payloadOf(richState());

    const merged = mergePayloads(local, remote, 0);

    expect(merged.settings.examDate).toBe('2027-03-20');
    expect(merged.wrongBook.b1?.count).toBe(2);
    expect(merged.history).toHaveLength(1);
    expect(merged.stats.attempts).toBe(10);
  });

  it('两侧都有内容时取并集，不是互相覆盖', () => {
    const a = payloadOf(
      mkState({
        settings: mkSettings({ examDate: '2027-03-20' }),
        history: [{ id: 'b1', result: 'wrong', ts: 1000 }],
        wrongBook: { b1: { count: 1, lastWrong: 1000, mastered: false } },
      }),
    );
    const b = payloadOf(
      mkState({
        settings: mkSettings({ dailyGoal: 30 }),
        history: [{ id: 'b2', result: 'correct', ts: 2000 }],
        wrongBook: { b2: { count: 3, lastWrong: 2000, mastered: false } },
      }),
    );

    const merged = mergePayloads(a, b, 0);

    expect(merged.history).toHaveLength(2);
    expect(Object.keys(merged.wrongBook).sort()).toEqual(['b1', 'b2']);
    // 设置按字段取：一边有考试日期、一边有每日目标，两个都要
    expect(merged.settings.examDate).toBe('2027-03-20');
    expect(merged.settings.dailyGoal).toBe(30);
  });

  it('统计不会倒退：云端 attempts 更大时不被本地的 0 拉平', () => {
    const local = payloadOf(mkState());
    const remote = payloadOf(
      mkState({ stats: { ...emptyState().stats, attempts: 42, correct: 30 } }),
    );
    expect(mergePayloads(local, remote, 0).stats.attempts).toBe(42);

    const local2 = payloadOf(
      mkState({ stats: { ...emptyState().stats, attempts: 42, correct: 30 } }),
    );
    const remote2 = payloadOf(mkState());
    expect(mergePayloads(local2, remote2, 0).stats.attempts).toBe(42);
  });
});

describe('删除语义：本机删掉的错题不会每次同步都复活', () => {
  it('已同步过的设备：本地删掉、云端还在 → 不复活', () => {
    const remote = payloadOf(
      mkState({ wrongBook: { b1: { count: 1, lastWrong: 500, mastered: false } } }),
    );
    const local = payloadOf(mkState({ wrongBook: {} }));
    // lastSyncAt 晚于云端条目的 lastWrong → 说明这条是本地同步之后主动删的
    const merged = mergePayloads(local, remote, 9000);
    expect(merged.wrongBook.b1).toBeUndefined();
  });

  it('本机没同步过（新设备）：云端条目要照单全收', () => {
    const remote = payloadOf(
      mkState({ wrongBook: { b1: { count: 1, lastWrong: 500, mastered: false } } }),
    );
    const local = payloadOf(mkState({ wrongBook: {} }));
    const merged = mergePayloads(local, remote, 0);
    expect(merged.wrongBook.b1?.count).toBe(1);
  });

  it('另一台设备新增的错题（晚于上次同步）要同步过来', () => {
    const remote = payloadOf(
      mkState({ wrongBook: { b2: { count: 1, lastWrong: 99999, mastered: false } } }),
    );
    const local = payloadOf(mkState({ wrongBook: {} }));
    const merged = mergePayloads(local, remote, 9000);
    expect(merged.wrongBook.b2?.count).toBe(1);
  });
});

describe('幂等：合并结果稳定，不会来回抖', () => {
  it('同一份数据合并自身 → 结果指纹不变', () => {
    const p = payloadOf(richState());
    const merged = mergePayloads(p, p, 5000);
    expect(fingerprintPayload(merged)).toBe(fingerprintPayload(p));
  });

  it('合并后再与其中一侧合并，仍收敛（不产生重复历史）', () => {
    const a = payloadOf(mkState({ history: [{ id: 'b1', result: 'wrong', ts: 1000 }] }));
    const b = payloadOf(mkState({ history: [{ id: 'b2', result: 'correct', ts: 2000 }] }));
    const m1 = mergePayloads(a, b, 0);
    const m2 = mergePayloads(m1, b, 0);
    expect(m2.history).toHaveLength(2);
    expect(fingerprintPayload(m1)).toBe(fingerprintPayload(m2));
  });

  it('历史按 id+ts 去重，同一条不会被记两次', () => {
    const h: HistoryEntry[] = [{ id: 'b1', result: 'wrong', ts: 1000 }];
    const a = payloadOf(mkState({ history: h }));
    const b = payloadOf(mkState({ history: h.slice() }));
    expect(mergePayloads(a, b, 0).history).toHaveLength(1);
  });
});

describe('内置题不会经由合并泄漏进同步子集', () => {
  it('云端混着内置题时，合并结果里也不该有它们', () => {
    const dirty: SyncedPayload = {
      ...payloadOf(mkState()),
      importedProblems: [mkProblem('b1'), mkProblem('b2'), mkProblem('imp1')],
    };
    const merged = mergePayloads(payloadOf(mkState()), dirty, 0, INDEX);
    expect(merged.importedProblems.map((p) => p.id)).toEqual(['imp1']);
  });
});

describe('端到端：合并结果能直接落到本地状态上', () => {
  it('applyPayload 后题库仍是内置题 + 导入题，不翻倍', () => {
    const remote: RemoteRecord = {
      payload: payloadOf(richState()),
      updated_at: new Date().toISOString(),
    };
    const state = applyPayload(mkState({ problems: BUILTIN }), remote.payload, BUILTIN);
    expect(state.problems).toHaveLength(2);
    expect(state.settings.examDate).toBe('2027-03-20');
  });
});

describe('登录语义：云端优先（大众用户预期，2026-10-17 修正）', () => {
  it('本机退出后改了备考时间，再登录不覆盖云端已存的备考时间', () => {
    // 云端（主设备）存了 2027-03-20，本机退出后随手改成了 2027-06-01
    const remote = payloadOf(mkState({ settings: mkSettings({ examDate: '2027-03-20' }) }));
    const local = payloadOf(mkState({ settings: mkSettings({ examDate: '2027-06-01' }) }));
    const merged = mergePayloads(local, remote, 0);
    expect(merged.settings.examDate).toBe('2027-03-20'); // 云端胜出，不被重置
  });

  it('云端没设过某设置而本机设过 → 保留本机（老用户注册 / 忘登录补救不丢）', () => {
    const remote = payloadOf(mkState()); // 云端全默认
    const local = payloadOf(mkState({ settings: mkSettings({ examDate: '2027-09-09' }) }));
    expect(mergePayloads(local, remote, 0).settings.examDate).toBe('2027-09-09');
  });

  it('清缓存的空设备登录 → 云端进度（设置 + 错题 + 历史）完整恢复', () => {
    const remote: RemoteRecord = {
      payload: payloadOf(richState()),
      updated_at: new Date().toISOString(),
    };
    const local = payloadOf(mkState()); // 空设备
    const merged = mergePayloads(local, remote.payload, 0);
    expect(merged.settings.examDate).toBe('2027-03-20');
    expect(merged.wrongBook.b1?.count).toBe(2);
    expect(merged.history).toHaveLength(1);
  });
});
