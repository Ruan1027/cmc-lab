import { describe, expect, it } from 'vitest';
import {
  dueCount,
  dueReviewIds,
  isDue,
  nextReviewText,
  nextSched,
  schedOf,
  type SchedState,
} from '../scheduler';
import type { Problem, WrongEntry } from '../../types';

const DAY = 86400000;
const NOW = 1_700_000_000_000;

function prob(id: string): Problem {
  return {
    id,
    source: `2024 第十六届CMC预赛 非数学A类 填空1 ${id}`,
    type: 'fill',
    knowledge: ['极限'],
    difficulty: 3,
    score: null,
    group: '非数学A类',
    hint: '',
    pitfall: '',
    stem: 'x',
    options: [],
    answer: '1',
    answerAlt: [],
    solution: 's',
  };
}

function wrong(over: Partial<WrongEntry> = {}): WrongEntry {
  return { count: 1, lastWrong: NOW, mastered: false, ...over };
}

describe('schedOf：旧数据兜底', () => {
  it('无调度字段的旧错题视为待复习的新卡片', () => {
    const s = schedOf(wrong());
    expect(s).toEqual({ easiness: 2.5, interval: 0, dueDate: 0, reps: 0 });
    expect(isDue(wrong())).toBe(true);
  });

  it('字段越界时收敛到合法区间', () => {
    expect(schedOf(wrong({ easiness: 99 })).easiness).toBe(2.5);
    expect(schedOf(wrong({ easiness: 0.1 })).easiness).toBe(1.3);
    expect(schedOf(wrong({ interval: -5 })).interval).toBe(0);
    expect(schedOf(wrong({ reps: -2 })).reps).toBe(0);
  });
});

describe('nextSched：SM-2 调度', () => {
  const fresh: SchedState = { easiness: 2.5, interval: 0, dueDate: 0, reps: 0 };

  it('首次答对：间隔 1 天，reps=1，当天+1 天到期', () => {
    const s = nextSched(fresh, 'correct', NOW);
    expect(s.interval).toBe(1);
    expect(s.reps).toBe(1);
    expect(s.dueDate).toBe(NOW + DAY);
  });

  it('连续答对间隔爬坡：1 → 6 → 15 → 38', () => {
    let s = nextSched(fresh, 'correct', NOW);
    expect(s.interval).toBe(1);
    s = nextSched(s, 'correct', NOW);
    expect(s.interval).toBe(6);
    s = nextSched(s, 'correct', NOW);
    expect(s.interval).toBe(15); // round(6 × 2.5)
    s = nextSched(s, 'correct', NOW);
    expect(s.interval).toBe(38); // round(15 × 2.5)
  });

  it('答错：间隔重置为 1 天、reps 归零、EF 下调', () => {
    const strong: SchedState = { easiness: 2.5, interval: 15, dueDate: 0, reps: 3 };
    const s = nextSched(strong, 'wrong', NOW);
    expect(s.interval).toBe(1);
    expect(s.reps).toBe(0);
    expect(s.easiness).toBeCloseTo(1.96, 5); // 2.5 - 0.54
  });

  it('部分正确：间隔仍增长，但 EF 下调（增速放缓）', () => {
    const s = nextSched({ easiness: 2.5, interval: 6, dueDate: 0, reps: 2 }, 'partial', NOW);
    expect(s.reps).toBe(3);
    expect(s.interval).toBe(14); // round(6 × 2.36)
    expect(s.easiness).toBeCloseTo(2.36, 5); // 2.5 - 0.14
  });

  it('EF 下限 1.3：连续答错也不会击穿', () => {
    let s: SchedState = { easiness: 1.35, interval: 1, dueDate: 0, reps: 0 };
    for (let i = 0; i < 5; i++) s = nextSched(s, 'wrong', NOW);
    expect(s.easiness).toBe(1.3);
  });

  it('间隔上限 365 天', () => {
    const s = nextSched({ easiness: 2.5, interval: 300, dueDate: 0, reps: 5 }, 'correct', NOW);
    expect(s.interval).toBe(365); // round(300 × 2.5) = 750，封顶
  });
});

describe('到期判定与队列', () => {
  const problems = [prob('1'), prob('2'), prob('3')];
  const wb: Record<string, WrongEntry> = {
    // 昨天到期（最紧急）
    '1': wrong({ dueDate: NOW - DAY, interval: 1, reps: 1 }),
    // 3 天后到期
    '2': wrong({ dueDate: NOW + 3 * DAY, interval: 3, reps: 3 }),
    // 今天到期
    '3': wrong({ dueDate: NOW, interval: 6, reps: 3, mastered: true }),
  };

  it('只返回到期且仍存在的题，按到期时间升序', () => {
    expect(dueReviewIds(wb, problems, NOW)).toEqual(['1', '3']);
  });

  it('已掌握的题到期也召回（长间隔复习）', () => {
    expect(dueReviewIds(wb, problems, NOW)).toContain('3');
  });

  it('limit 生效', () => {
    expect(dueReviewIds(wb, problems, NOW, 1)).toEqual(['1']);
  });

  it('dueCount 不限量', () => {
    expect(dueCount(wb, problems, NOW)).toBe(2);
  });

  it('题库里不存在的 id 被忽略', () => {
    const withGhost = { ...wb, '99': wrong({ dueDate: NOW - DAY }) };
    expect(dueReviewIds(withGhost, problems, NOW)).toEqual(['1', '3']);
  });
});

describe('nextReviewText', () => {
  it('已过期显示待复习', () => {
    expect(nextReviewText(wrong({ dueDate: NOW - DAY }), NOW)).toBe('待复习');
  });

  it('今天内到期显示待复习', () => {
    expect(nextReviewText(wrong({ dueDate: NOW }), NOW)).toBe('待复习');
  });

  it('明天 / N 天后 / 远期日期', () => {
    expect(nextReviewText(wrong({ dueDate: NOW + DAY }), NOW)).toBe('明天复习');
    expect(nextReviewText(wrong({ dueDate: NOW + 5 * DAY }), NOW)).toBe('5 天后复习');
    expect(nextReviewText(wrong({ dueDate: NOW + 60 * DAY }), NOW)).toMatch(/^\d+\/\d+ 复习$/);
  });

  it('旧数据（无 dueDate）显示待复习', () => {
    expect(nextReviewText(wrong(), NOW)).toBe('待复习');
  });
});
