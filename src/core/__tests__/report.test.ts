import { describe, it, expect } from 'vitest';
import { buildReport, reportToMarkdown } from '../report';
import type {
  ExamRecord,
  HistoryEntry,
  Problem,
  Settings,
  Stats,
  WrongEntry,
} from '../../types';

const NOW = Date.parse('2026-10-15T20:00:00');

function makeProblem(id: string, knowledge = '极限'): Problem {
  return {
    id,
    source: `卷-${id}`,
    type: 'choice',
    knowledge: [knowledge],
    difficulty: 3,
    score: 6,
    group: '非数学A类',
    hint: '',
    pitfall: '',
    stem: '题',
    options: [],
    answer: 'A',
    answerAlt: [],
    solution: '解',
  };
}

function emptyStats(): Stats {
  return {
    attempts: 0,
    correct: 0,
    byKnowledge: {},
    byType: {},
    byDifficulty: {},
    bySource: {},
  };
}

function settings(over: Partial<Settings> = {}): Settings {
  return {
    group: '非数学A类',
    examDate: '2026-11-01',
    dailyGoal: 10,
    examMinutes: 150,
    ...over,
  };
}

describe('buildReport / reportToMarkdown', () => {
  it('空数据不崩溃，且给出「尚未打卡」式建议', () => {
    const r = buildReport({
      problems: [],
      stats: emptyStats(),
      history: [],
      wrongBook: {},
      settings: settings({ examDate: '' }),
      exams: [],
      now: NOW,
    });
    expect(r.overview.totalAttempts).toBe(0);
    expect(r.overview.overallRate).toBeNull();
    expect(r.modules).toEqual([]);
    expect(r.suggestions.length).toBeGreaterThan(0);
    const md = reportToMarkdown(r);
    expect(md).toContain('# CMC Lab 学习报告');
    expect(md).toContain('## 一、总览');
    expect(md).toContain('（暂无数据）');
  });

  it('正常数据：正确率、模块、维度、近期轨迹正确计算', () => {
    const p = makeProblem('p1');
    const stats = emptyStats();
    stats.attempts = 1;
    stats.correct = 1;
    stats.byType = { choice: { attempts: 1, correct: 1 } };
    stats.byKnowledge = { '极限与连续': { attempts: 1, correct: 1 } };
    stats.byDifficulty = { '3': { attempts: 1, correct: 1 } };
    stats.bySource = { 卷: { attempts: 1, correct: 1 } };
    const history: HistoryEntry[] = [
      { id: 'p1', result: 'correct', ts: NOW - 1000 },
    ];
    const r = buildReport({
      problems: [p],
      stats,
      history,
      wrongBook: {},
      settings: settings(),
      exams: [],
      now: NOW,
    });
    expect(r.overview.totalAttempts).toBe(1);
    expect(r.overview.overallRate).toBe(100);
    expect(r.modules).toHaveLength(1);
    expect(r.modules[0].domain).toBe('极限与连续');
    expect(r.byType[0].label).toBe('选择题');
    expect(r.byType[0].rate).toBe(100);
    expect(r.recent).toHaveLength(1);
    expect(r.recent[0].source).toBe('卷-p1');
    expect(r.overview.daysToExam).toBe(16); // 2026-10-15 20:00 → 2026-11-01 00:00 ≈ 16.17 天
  });

  it('薄弱知识点（正确率<60%）进入 weak 与建议', () => {
    const p = makeProblem('p2');
    const stats = emptyStats();
    stats.attempts = 3;
    stats.correct = 1;
    stats.byKnowledge = { 微分中值定理: { attempts: 3, correct: 1 } };
    stats.byType = { proof: { attempts: 3, correct: 1 } };
    const r = buildReport({
      problems: [p],
      stats,
      history: [],
      wrongBook: {},
      settings: settings(),
      exams: [],
      now: NOW,
    });
    expect(r.weak).toHaveLength(1);
    expect(r.weak[0].k).toBe('微分中值定理');
    expect(r.weak[0].rate).toBe(33);
    expect(r.suggestions.some((s) => s.includes('微分中值定理'))).toBe(true);
  });

  it('到期错题进入 dueList 且 dueReviews > 0', () => {
    const p = makeProblem('p3');
    const stats = emptyStats();
    stats.attempts = 1;
    stats.correct = 0;
    const wrongBook: Record<string, WrongEntry> = {
      p3: {
        count: 2,
        lastWrong: NOW - 5000,
        mastered: false,
        dueDate: NOW - 1000, // 已到期
        interval: 6,
        easiness: 2.2,
        reps: 2,
      },
    };
    const r = buildReport({
      problems: [p],
      stats,
      history: [{ id: 'p3', result: 'wrong', ts: NOW - 5000 }],
      wrongBook,
      settings: settings(),
      exams: [],
      now: NOW,
    });
    expect(r.overview.dueReviews).toBe(1);
    expect(r.dueList).toHaveLength(1);
    expect(r.dueList[0].source).toBe('卷-p3');
    expect(r.suggestions.some((s) => s.includes('待复习'))).toBe(true);
  });

  it('模考记录按时间倒序取最近 10 次', () => {
    const p = makeProblem('p4');
    const exams: ExamRecord[] = Array.from({ length: 12 }, (_, i) => ({
      ts: NOW - i * 86400000,
      source: `卷${i}`,
      minutes: 150,
      used: 150,
      score: 80 + i,
      total: 100,
      right: 8,
      partial: 1,
      wrong: 1,
      blank: 0,
      auto: false,
      detail: [],
    }));
    const r = buildReport({
      problems: [p],
      stats: emptyStats(),
      history: [],
      wrongBook: {},
      settings: settings(),
      exams,
      now: NOW,
    });
    expect(r.exams).toHaveLength(10);
    // 最新的在最前
    expect(r.exams[0].ts).toContain('2026-10-15');
    expect(r.exams[0].source).toBe('卷0');
  });

  it('Markdown 含各章节标题与表格行数合理', () => {
    const r = buildReport({
      problems: [makeProblem('p1')],
      stats: {
        attempts: 1,
        correct: 1,
        byType: { choice: { attempts: 1, correct: 1 } },
        byKnowledge: {},
        byDifficulty: {},
        bySource: {},
      },
      history: [{ id: 'p1', result: 'correct', ts: NOW }],
      wrongBook: {},
      settings: settings(),
      exams: [],
      now: NOW,
    });
    const md = reportToMarkdown(r);
    ['## 一、总览', '## 二、知识模块进度', '## 三、各维度正确率', '## 八、备考建议'].forEach(
      (h) => expect(md).toContain(h),
    );
    // 总览表有 8 行数据 + 表头 + 分隔
    expect(md).toContain('| 总作答次数 | 1 |');
  });
});
