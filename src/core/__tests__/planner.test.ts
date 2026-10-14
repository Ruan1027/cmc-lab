import { describe, expect, it } from 'vitest';
import { buildTodayPlan, daysToExam } from '../planner';
import { gradeExam, scoreOf } from '../exam';
import { moduleProgress, streakDays } from '../stats';
import type { Problem, Stats } from '../../types';
import { DEFAULT_SETTINGS } from '../../storage/defaults';

function statsOf(): Stats {
  return { attempts: 0, correct: 0, byKnowledge: {}, byType: {}, byDifficulty: {}, bySource: {} };
}

function prob(id: string, knowledge: string[]): Problem {
  return {
    id,
    source: `2024 第十六届CMC预赛 非数学A类 填空1 ${id}`,
    type: 'fill',
    knowledge,
    difficulty: 3,
    score: null,
    group: '',
    hint: '',
    pitfall: '',
    stem: 'x',
    options: [],
    answer: '1',
    answerAlt: [],
    solution: 's',
  };
}

describe('daysToExam', () => {
  it('未设置返回 null', () => {
    expect(daysToExam('')).toBeNull();
  });

  it('按自然日计算', () => {
    const today = new Date('2026-10-14T10:00:00');
    expect(daysToExam('2026-10-24', today)).toBe(10);
    expect(daysToExam('2026-10-04', today)).toBe(-10);
  });
});

describe('buildTodayPlan', () => {
  const problems = [prob('1', ['极限']), prob('2', ['极限']), prob('3', ['积分'])];

  it('无历史时全部按新题安排', () => {
    const plan = buildTodayPlan(problems, statsOf(), [], {}, { ...DEFAULT_SETTINGS, dailyGoal: 2 });
    expect(plan.undone).toBe(3);
    expect(plan.tasks.reduce((s, t) => s + t.ids.length, 0)).toBe(2);
  });

  it('错题优先出现在任务最前', () => {
    const plan = buildTodayPlan(
      problems,
      statsOf(),
      [],
      { '3': { count: 1, lastWrong: Date.now(), mastered: false } },
      { ...DEFAULT_SETTINGS, dailyGoal: 3 },
    );
    expect(plan.tasks[0].ids).toContain('3');
    expect(plan.tasks[0].label).toContain('错题');
  });

  it('已掌握错题不再享受「错题优先」，但仍会作为未做题出现', () => {
    const plan = buildTodayPlan(
      problems,
      statsOf(),
      [],
      { '3': { count: 1, lastWrong: Date.now(), mastered: true } },
      { ...DEFAULT_SETTINGS, dailyGoal: 3 },
    );
    // 不会再生成「重做错题」这一项
    expect(plan.tasks.every((t) => !t.label.includes('错题'))).toBe(true);
    // 但它本身没做过，仍应作为新题被练到
    expect(plan.tasks.some((t) => t.ids.includes('3'))).toBe(true);
  });
});

describe('模考评卷', () => {
  const ps = [prob('1', ['极限']), prob('2', ['积分'])];

  it('未标注分值时按标准卷计分（填空 6 分）', () => {
    expect(scoreOf(ps[0])).toBe(6);
  });

  it('全对得满分，未答记 0', () => {
    const res = gradeExam(ps, { '1': { kind: 'fill', text: '1' } });
    expect(res.right).toBe(1);
    expect(res.blank).toBe(1);
    expect(res.score).toBe(6);
    expect(res.total).toBe(12);
  });

  it('部分正确按半分计', () => {
    const res = gradeExam(ps, {
      '1': { kind: 'self', grade: 'partial' },
      '2': { kind: 'self', grade: 'correct' },
    });
    expect(res.score).toBe(3 + 6);
  });
});

describe('统计', () => {
  it('模块进度按域聚合且去重同题', () => {
    const ps = [prob('1', ['极限', '等价无穷小'])];
    const mods = moduleProgress(ps, statsOf(), []);
    const limit = mods.find((m) => m.domain === '极限与连续');
    expect(limit?.total).toBe(1);
  });

  it('连续打卡今天没做题时从昨天起算', () => {
    const today = new Date();
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const history = [{ id: '1', result: 'correct' as const, ts: y.getTime() }];
    expect(streakDays(history)).toBe(1);
  });
});
