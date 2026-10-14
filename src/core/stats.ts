/**
 * 统计与进度计算
 *
 * 全部是纯函数：输入题目 + 统计 + 历史，输出展示所需的数据。
 * 不碰 DOM、不碰存储，因此可单测、可迁移到服务端。
 */
import type { HistoryEntry, ModuleProgress, Problem, Stats, StatsBucket } from '../types';
import { DOMAIN_ORDER, domainOf } from './knowledge';

/** 安全正确率，分母为 0 时返回 null（表示「未练」而不是 0%） */
export function rateOf(bucket: StatsBucket | undefined): number | null {
  if (!bucket || !bucket.attempts) return null;
  return bucket.correct / bucket.attempts;
}

/** 按一级知识域聚合进度：题数、已做数、覆盖率、正确率 */
export function moduleProgress(
  problems: Problem[],
  stats: Stats,
  history: HistoryEntry[],
): ModuleProgress[] {
  const doneIds = new Set(history.map((h) => h.id));
  const byDom: Record<string, ModuleProgress & { ids: Record<string, 1> }> = {};

  problems.forEach((p) => {
    const doms: Record<string, 1> = {};
    (p.knowledge || []).forEach((k) => {
      doms[domainOf(k)] = 1;
    });
    const keys = Object.keys(doms).length ? Object.keys(doms) : ['其他'];
    keys.forEach((d) => {
      const m = (byDom[d] ||= { domain: d, total: 0, done: 0, attempts: 0, correct: 0, ids: {} });
      if (m.ids[p.id]) return; // 一题在同一域内只算一次
      m.ids[p.id] = 1;
      m.total += 1;
      if (doneIds.has(p.id)) m.done += 1;
    });
  });

  Object.keys(byDom).forEach((d) => {
    let att = 0;
    let cor = 0;
    Object.keys(stats.byKnowledge || {}).forEach((k) => {
      if (domainOf(k) === d) {
        att += stats.byKnowledge[k].attempts;
        cor += stats.byKnowledge[k].correct;
      }
    });
    byDom[d].attempts = att;
    byDom[d].correct = cor;
  });

  return Object.values(byDom).sort((a, b) => {
    const ia = DOMAIN_ORDER.indexOf(a.domain);
    const ib = DOMAIN_ORDER.indexOf(b.domain);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

/** 薄弱知识点：练过至少 minAttempts 次且正确率低于 threshold */
export function weakKnowledgeList(
  stats: Stats,
  minAttempts = 2,
  threshold = 0.6,
): Array<{ k: string; rate: number; n: number }> {
  const bk = stats.byKnowledge || {};
  return Object.keys(bk)
    .filter((k) => bk[k].attempts >= minAttempts && bk[k].correct / bk[k].attempts < threshold)
    .sort((a, b) => bk[a].correct / bk[a].attempts - bk[b].correct / bk[b].attempts)
    .map((k) => ({
      k,
      rate: Math.round((bk[k].correct / bk[k].attempts) * 100),
      n: bk[k].attempts,
    }));
}

/** 连续打卡天数：今天还没做题时从昨天起算，避免当天零点后误判断签 */
export function streakDays(history: HistoryEntry[]): number {
  const days = new Set(history.map((h) => new Date(h.ts).toDateString()));
  if (!days.size) return 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(d.toDateString())) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** 近 n 天每天的做题数，用于打卡日历 */
export function dailyCounts(
  history: HistoryEntry[],
  days = 56,
): Array<{ date: Date; count: number }> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const map = new Map<string, number>();
  history.forEach((h) => {
    const key = new Date(h.ts).toDateString();
    map.set(key, (map.get(key) || 0) + 1);
  });
  const out: Array<{ date: Date; count: number }> = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: d, count: map.get(d.toDateString()) || 0 });
  }
  return out;
}

/** 累计结果写入统计桶 */
export function bumpBucket(
  stats: Stats,
  dimension: keyof Stats,
  key: string,
  result: string,
): void {
  const bag = stats[dimension] as unknown as Record<string, StatsBucket>;
  const b = (bag[key] ||= { attempts: 0, correct: 0 });
  b.attempts += 1;
  if (result === 'correct') b.correct += 1;
  else if (result === 'partial') b.correct += 0.5;
}
