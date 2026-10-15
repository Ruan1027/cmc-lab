/**
 * 学习路径规划
 *
 * 目标：把「题库还有 N 题」翻译成「今天该做什么」。
 * 优先级：到期复习 > 重做错题 > 薄弱知识点新题 > 按顺序推进新题。
 *
 * 「到期复习」由间隔重复调度（SM-2）决定，见 ./scheduler.ts。
 */
import type { HistoryEntry, PlanTask, Problem, Settings, Stats, WrongEntry } from '../types';
import { weakKnowledgeList } from './stats';
import { dueReviewIds } from './scheduler';

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
  /** 到期待复习的题数（SM-2 调度到期，含已掌握题的召回） */
  due: number;
  /** 按剩余天数摊到的每日题量，未设置日期时为 0 */
  perDay: number;
}

export function buildTodayPlan(
  problems: Problem[],
  stats: Stats,
  history: HistoryEntry[],
  wrongBook: Record<string, WrongEntry>,
  settings: Settings,
  now = Date.now(),
): TodayPlan {
  const doneIds = new Set(history.map((h) => h.id));
  const goal = Math.max(1, settings.dailyGoal || 10);
  const weak = weakKnowledgeList(stats).map((w) => w.k);
  const wrongIds = Object.keys(wrongBook).filter(
    (id) => !wrongBook[id].mastered && problems.some((p) => p.id === id),
  );

  const tasks: PlanTask[] = [];
  const used = new Set<string>();

  // 0) 到期复习：按遗忘曲线该再见的题，优先级最高（趁没忘再巩固一次）。
  //    含已掌握的题——长间隔召回是间隔重复的核心
  const dueIds = dueReviewIds(wrongBook, problems, now, Math.min(5, goal));
  if (dueIds.length) {
    dueIds.forEach((i) => used.add(i));
    tasks.push({
      label: `🔁 到期复习 ${dueIds.length} 道`,
      ids: dueIds,
      why: '按遗忘曲线安排：趁没忘再巩固一次',
    });
  }

  // 1) 错题优先：还没到复习间隔的错题，趁印象还在先巩固
  const pendingWrong = wrongIds.filter((id) => !used.has(id));
  if (pendingWrong.length) {
    const ids = pendingWrong.slice(0, Math.min(3, pendingWrong.length));
    ids.forEach((i) => used.add(i));
    tasks.push({ label: `重做错题 ${ids.length} 道`, ids, why: '错题优先，趁印象还在先巩固' });
  }

  const undone = problems.filter((p) => !doneIds.has(p.id));

  // 2) 薄弱知识点的新题
  const weakPool = undone.filter(
    (p) => !used.has(p.id) && (p.knowledge || []).some((k) => weak.includes(k)),
  );
  if (weakPool.length) {
    const take = Math.max(0, goal - tasks.reduce((s, t) => s + t.ids.length, 0));
    const ids = weakPool.slice(0, take).map((p) => p.id);
    if (ids.length) {
      ids.forEach((i) => used.add(i));
      tasks.push({
        label: `薄弱知识点新题 ${ids.length} 道`,
        ids,
        why: '优先补正确率低于 60% 的知识点',
      });
    }
  }

  // 3) 其余按顺序推进
  const restNeed = Math.max(0, goal - tasks.reduce((s, t) => s + t.ids.length, 0));
  if (restNeed > 0) {
    const rest = undone
      .filter((p) => !used.has(p.id))
      .slice(0, restNeed)
      .map((p) => p.id);
    if (rest.length) {
      tasks.push({ label: `新题 ${rest.length} 道`, ids: rest, why: '按题库顺序推进，扩大覆盖面' });
    }
  }

  const left = daysToExam(settings.examDate);
  const perDay = left && left > 0 ? Math.ceil(undone.length / left) : 0;
  const due = dueReviewIds(wrongBook, problems, now, Number.MAX_SAFE_INTEGER).length;

  return { tasks, undone: undone.length, wrong: wrongIds.length, weak, due, perDay };
}
