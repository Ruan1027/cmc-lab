/**
 * 学习路径规划
 *
 * 目标：把「题库还有 N 题」翻译成「今天该做什么」。
 * 优先级：重做错题 > 薄弱知识点新题 > 按顺序推进新题。
 */
import type { HistoryEntry, PlanTask, Problem, Settings, Stats, WrongEntry } from '../types';
import { weakKnowledgeList } from './stats';

/** 距离初赛还有几天；未设置或已过期分别返回 null / 负数 */
export function daysToExam(examDate: string, now = new Date()): number | null {
  if (!examDate) return null;
  const d = new Date(`${examDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export interface TodayPlan {
  tasks: PlanTask[];
  undone: number;
  wrong: number;
  weak: string[];
  /** 按剩余天数摊到的每日题量，未设置日期时为 0 */
  perDay: number;
}

export function buildTodayPlan(
  problems: Problem[],
  stats: Stats,
  history: HistoryEntry[],
  wrongBook: Record<string, WrongEntry>,
  settings: Settings,
): TodayPlan {
  const doneIds = new Set(history.map((h) => h.id));
  const goal = Math.max(1, settings.dailyGoal || 10);
  const weak = weakKnowledgeList(stats).map((w) => w.k);
  const wrongIds = Object.keys(wrongBook).filter(
    (id) => !wrongBook[id].mastered && problems.some((p) => p.id === id),
  );

  const tasks: PlanTask[] = [];

  // 1) 错题优先：趁印象还在先巩固
  if (wrongIds.length) {
    const ids = wrongIds.slice(0, Math.min(3, wrongIds.length));
    tasks.push({ label: `重做错题 ${ids.length} 道`, ids, why: '错题优先，趁印象还在先巩固' });
  }

  const undone = problems.filter((p) => !doneIds.has(p.id));
  const used = new Set<string>();
  tasks.forEach((t) => t.ids.forEach((i) => used.add(i)));

  // 2) 薄弱知识点的新题
  const weakPool = undone.filter(
    (p) => !used.has(p.id) && (p.knowledge || []).some((k) => weak.includes(k)),
  );
  if (weakPool.length) {
    const take = Math.max(0, goal - tasks.reduce((s, t) => s + t.ids.length, 0));
    const ids = weakPool.slice(0, take).map((p) => p.id);
    if (ids.length) {
      ids.forEach((i) => used.add(i));
      tasks.push({ label: `薄弱知识点新题 ${ids.length} 道`, ids, why: '优先补正确率低于 60% 的知识点' });
    }
  }

  // 3) 其余按顺序推进
  const restNeed = Math.max(0, goal - tasks.reduce((s, t) => s + t.ids.length, 0));
  if (restNeed > 0) {
    const rest = undone.filter((p) => !used.has(p.id)).slice(0, restNeed).map((p) => p.id);
    if (rest.length) {
      tasks.push({ label: `新题 ${rest.length} 道`, ids: rest, why: '按题库顺序推进，扩大覆盖面' });
    }
  }

  const left = daysToExam(settings.examDate);
  const perDay = left && left > 0 ? Math.ceil(undone.length / left) : 0;

  return { tasks, undone: undone.length, wrong: wrongIds.length, weak, perDay };
}
