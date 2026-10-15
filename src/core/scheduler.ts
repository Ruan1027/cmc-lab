/**
 * 间隔重复调度（SM-2 简化版）
 *
 * 算法源自 SuperMemo SM-2（Anki 早期同源）：按每次复习结果调整记忆难度
 * 系数（easiness）与复习间隔（interval），到期自动召回，把「凭感觉重做
 * 错题」升级为「按遗忘曲线安排复习」。
 *
 * 设计约束：
 * - 纯函数，不依赖 React / 浏览器 API，可单测
 * - 调度状态挂在 WrongEntry 上且字段全部可选，旧数据缺失时按新卡片兜底
 * - 上限保护：easiness 不高于 2.5、不低于 1.3；interval 不超过 365 天
 */
import type { AnswerResult, Problem, WrongEntry } from '../types';

/** 单道题的调度状态 */
export interface SchedState {
  /** 记忆难度系数，1.3（难）~ 2.5（容易） */
  easiness: number;
  /** 当前间隔（天）；0 表示还没开始复习 */
  interval: number;
  /** 下次复习时间（ms 时间戳）；0 表示立即到期 */
  dueDate: number;
  /** 连续答对次数，用于 1 → 6 → interval × EF 的爬坡阶梯 */
  reps: number;
}

export const DEFAULT_EASINESS = 2.5;
export const MIN_EASINESS = 1.3;
export const MAX_INTERVAL = 365;

const DAY = 86400000;

/** 作答结果 → SM-2 自评质量分 q（0-5） */
function qualityOf(result: AnswerResult): number {
  if (result === 'correct') return 5;
  if (result === 'partial') return 3;
  return 1; // wrong
}

function clampE(e: number): number {
  return Math.min(DEFAULT_EASINESS, Math.max(MIN_EASINESS, e));
}

/**
 * 从 WrongEntry 读取调度状态。
 * 旧数据（升级前保存的记录）没有调度字段，一律视为「待复习的新卡片」——
 * dueDate 为 0 会立即进入复习队列，这正是期望行为：从没被安排过复习的
 * 错题，先完整过一轮。
 */
export function schedOf(w: Partial<WrongEntry>): SchedState {
  return {
    easiness: clampE(typeof w.easiness === 'number' ? w.easiness : DEFAULT_EASINESS),
    interval: Math.max(0, Math.floor(w.interval || 0)),
    dueDate: w.dueDate || 0,
    reps: Math.max(0, Math.floor(w.reps || 0)),
  };
}

/**
 * 计算下一次调度状态。
 *
 * - correct（q=5）：EF 上调（封顶 2.5），间隔按 1 → 6 → round(interval × EF) 爬坡
 * - partial（q=3）：EF 下调，间隔仍增长，但增速变慢
 * - wrong（q=1）：间隔重置为 1 天、reps 归零，重新爬坡；EF 大幅下调
 */
export function nextSched(prev: SchedState, result: AnswerResult, now = Date.now()): SchedState {
  const q = qualityOf(result);
  const easiness = clampE(prev.easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  let reps = prev.reps;
  let interval: number;

  if (q < 3) {
    // 没答好：从头再来
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(prev.interval * easiness);
  }

  interval = Math.min(MAX_INTERVAL, Math.max(1, interval));
  return { easiness, interval, dueDate: now + interval * DAY, reps };
}

/** 是否到期该复习 */
export function isDue(w: Partial<WrongEntry>, now = Date.now()): boolean {
  return (w.dueDate || 0) <= now;
}

/**
 * 到期待复习的题 id，按到期时间升序（最早就期的先复习）。
 *
 * 包含已掌握的题：长间隔召回是间隔重复的核心——掌握不是终点，
 * 周期性回顾才能把短期记忆固化成长期记忆。
 */
export function dueReviewIds(
  wrongBook: Record<string, WrongEntry>,
  problems: Problem[],
  now = Date.now(),
  limit = 5,
): string[] {
  const exists = new Set(problems.map((p) => p.id));
  return Object.entries(wrongBook)
    .filter(([id, w]) => exists.has(id) && isDue(w, now))
    .sort((a, b) => (a[1].dueDate || 0) - (b[1].dueDate || 0))
    .slice(0, Math.max(0, limit))
    .map(([id]) => id);
}

/** 待复习总数（不限量，供统计展示） */
export function dueCount(
  wrongBook: Record<string, WrongEntry>,
  problems: Problem[],
  now = Date.now(),
): number {
  return dueReviewIds(wrongBook, problems, now, Number.MAX_SAFE_INTEGER).length;
}

/** 「下次复习」的人话描述：待复习 / 明天 / N 天后 / 具体日期 */
export function nextReviewText(w: Partial<WrongEntry>, now = Date.now()): string {
  const due = w.dueDate || 0;
  if (due <= now) return '待复习';
  const days = Math.ceil((due - now) / DAY);
  if (days <= 1) return '明天复习';
  if (days < 30) return `${days} 天后复习`;
  const d = new Date(due);
  return `${d.getMonth() + 1}/${d.getDate()} 复习`;
}
