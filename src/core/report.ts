/**
 * 学习报告生成
 *
 * 纯函数：输入题目 + 统计 + 历史 + 错题本 + 设置 + 模考记录，产出一份
 * 结构化的「学习报告」对象，并支持序列化为 Markdown（便于导出 / 打印成 PDF）。
 *
 * 不碰 DOM、不碰存储，因此可单测、可迁移到服务端。报告里的所有派生指标
 * 都复用 core/stats 与 core/scheduler 的既有逻辑，避免重复造轮子、也避免
 * 和页面展示口径不一致。
 */
import type {
  AnswerResult,
  ExamRecord,
  HistoryEntry,
  Problem,
  Settings,
  Stats,
  WrongEntry,
} from '../types';
import { problemsOfGroup } from './groups';
import { moduleProgress, streakDays, weakKnowledgeList } from './stats';
import { dueCount, dueReviewIds, nextReviewText, schedOf } from './scheduler';

export interface ReportOverview {
  generatedAt: string;
  group: string;
  examDate: string | null;
  daysToExam: number | null;
  totalAttempts: number;
  overallRate: number | null;
  streakDays: number;
  wrongTotal: number;
  wrongUnmastered: number;
  wrongMastered: number;
  dueReviews: number;
  dailyGoal: number;
}

export interface ReportModule {
  domain: string;
  total: number;
  done: number;
  rate: number | null;
}

export interface ReportDim {
  label: string;
  correct: number;
  attempts: number;
  rate: number | null;
}

export interface ReportWeak {
  k: string;
  rate: number;
  n: number;
}

export interface ReportWrongItem {
  id: string;
  source: string;
  count: number;
  mastered: boolean;
  interval: number | null;
  nextReview: string;
}

export interface ReportExam {
  ts: string;
  source: string;
  score: number;
  total: number;
  right: number;
  partial: number;
  wrong: number;
  blank: number;
  minutes: number;
}

export interface ReportPractice {
  ts: string;
  source: string;
  result: AnswerResult;
}

export interface StudyReport {
  overview: ReportOverview;
  modules: ReportModule[];
  byType: ReportDim[];
  byDifficulty: ReportDim[];
  bySource: ReportDim[];
  weak: ReportWeak[];
  wrongTop: ReportWrongItem[];
  dueList: ReportWrongItem[];
  exams: ReportExam[];
  recent: ReportPractice[];
  suggestions: string[];
}

export interface BuildArgs {
  problems: Problem[];
  stats: Stats;
  history: HistoryEntry[];
  wrongBook: Record<string, WrongEntry>;
  settings: Settings;
  exams: ExamRecord[];
  /** 用于测试可注入固定「现在」，默认 Date.now() */
  now?: number;
}

const TYPE_NAME: Record<string, string> = {
  choice: '选择题',
  fill: '填空题',
  proof: '解答题',
};

function pct(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}`;
}

function daysBetween(from: number, to: number): number {
  return Math.round((to - from) / 86400000);
}

/** 构建完整学习报告 */
export function buildReport(args: BuildArgs): StudyReport {
  const { problems, stats, history, wrongBook, settings, exams, now = Date.now() } = args;
  const pool = problemsOfGroup(problems, settings.group);
  const idToProblem = new Map(problems.map((p) => [p.id, p]));

  // —— 总览 ——
  const totalAttempts = stats.attempts;
  const overallRate = pct(stats.correct, stats.attempts);
  const streak = streakDays(history);
  const wrongEntries = Object.values(wrongBook);
  const wrongTotal = wrongEntries.length;
  const wrongMastered = wrongEntries.filter((w) => w.mastered).length;
  const wrongUnmastered = wrongTotal - wrongMastered;
  const dueReviews = dueCount(wrongBook, problems, now);

  let daysToExam: number | null = null;
  if (settings.examDate) {
    const t = new Date(settings.examDate + 'T00:00:00').getTime();
    if (!Number.isNaN(t)) daysToExam = daysBetween(now, t);
  }

  const overview: ReportOverview = {
    generatedAt: fmtDateTime(now),
    group: settings.group,
    examDate: settings.examDate || null,
    daysToExam,
    totalAttempts,
    overallRate,
    streakDays: streak,
    wrongTotal,
    wrongUnmastered,
    wrongMastered,
    dueReviews,
    dailyGoal: settings.dailyGoal,
  };

  // —— 知识模块 ——
  const modules: ReportModule[] = moduleProgress(pool, stats, history).map((m) => ({
    domain: m.domain,
    total: m.total,
    done: m.done,
    rate: pct(m.correct, m.attempts),
  }));

  // —— 各维度正确率 ——
  const byType: ReportDim[] = Object.keys(stats.byType).map((t) => ({
    label: TYPE_NAME[t] || t,
    correct: stats.byType[t].correct,
    attempts: stats.byType[t].attempts,
    rate: pct(stats.byType[t].correct, stats.byType[t].attempts),
  }));

  const byDifficulty: ReportDim[] = Object.keys(stats.byDifficulty)
    .sort((a, b) => Number(a) - Number(b))
    .map((d) => ({
      label: `难度 ${d}`,
      correct: stats.byDifficulty[d].correct,
      attempts: stats.byDifficulty[d].attempts,
      rate: pct(stats.byDifficulty[d].correct, stats.byDifficulty[d].attempts),
    }));

  const bySource: ReportDim[] = Object.keys(stats.bySource).map((s) => ({
    label: s,
    correct: stats.bySource[s].correct,
    attempts: stats.bySource[s].attempts,
    rate: pct(stats.bySource[s].correct, stats.bySource[s].attempts),
  }));

  // —— 薄弱知识点 ——
  const weak: ReportWeak[] = weakKnowledgeList(stats).map((w) => ({
    k: w.k,
    rate: w.rate,
    n: w.n,
  }));

  // —— 高频错题 TOP ——
  const wrongTop: ReportWrongItem[] = Object.entries(wrongBook)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([id, w]) => ({
      id,
      source: idToProblem.get(id)?.source ?? id,
      count: w.count,
      mastered: !!w.mastered,
      interval: schedOf(w).interval || null,
      nextReview: nextReviewText(w, now),
    }));

  // —— 待复习队列 ——
  const dueList: ReportWrongItem[] = dueReviewIds(wrongBook, problems, now, 20).map((id) => {
    const w = wrongBook[id];
    return {
      id,
      source: idToProblem.get(id)?.source ?? id,
      count: w.count,
      mastered: !!w.mastered,
      interval: schedOf(w).interval || null,
      nextReview: nextReviewText(w, now),
    };
  });

  // —— 模考记录（最近 10 次，倒序）——
  const examsOut: ReportExam[] = [...exams]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 10)
    .map((e) => ({
      ts: fmtDateTime(e.ts),
      source: e.source,
      score: e.score,
      total: e.total,
      right: e.right,
      partial: e.partial,
      wrong: e.wrong,
      blank: e.blank,
      minutes: e.minutes,
    }));

  // —— 近期练习（最近 20 条，倒序）——
  const recent: ReportPractice[] = [...history]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 20)
    .map((h) => ({
      ts: fmtDateTime(h.ts),
      source: idToProblem.get(h.id)?.source ?? h.id,
      result: h.result,
    }));

  // —— 备考建议 ——
  const suggestions: string[] = [];
  if (dueReviews > 0) {
    suggestions.push(`有 ${dueReviews} 道错题已到期待复习，建议优先完成今日复习计划，把短期记忆固化。`);
  }
  if (weak.length) {
    const top = weak
      .slice(0, 5)
      .map((w) => w.k)
      .join('、');
    suggestions.push(`薄弱知识点（正确率 < 60%）：重点攻克「${top}」。`);
  }
  if (overallRate !== null && overallRate < 70) {
    suggestions.push(`当前总正确率 ${overallRate}%，低于 70%，建议回归基础模块、放慢节奏重做错题。`);
  }
  if (streak === 0) {
    suggestions.push(`尚未连续打卡，建议把每日目标设为 ${settings.dailyGoal} 题并坚持，连续打卡能显著提升留存。`);
  }
  if (exams.length === 0) {
    suggestions.push(`尚未进行限时模考，建议考前做 2-3 套，训练时间分配与抗压能力。`);
  }
  if (daysToExam !== null && daysToExam >= 0 && daysToExam <= 14) {
    suggestions.push(`距考试仅 ${daysToExam} 天，进入冲刺期：以模考 + 错题复习为主，少做新题。`);
  }
  if (!suggestions.length) {
    suggestions.push('状态良好，保持节奏，按复习计划巩固即可。');
  }

  return {
    overview,
    modules,
    byType,
    byDifficulty,
    bySource,
    weak,
    wrongTop,
    dueList,
    exams: examsOut,
    recent,
    suggestions,
  };
}

function mdRate(rate: number | null): string {
  return rate === null ? '—' : `${rate}%`;
}

function mdTable(headers: string[], rows: Array<Array<string | number>>): string {
  const esc = (v: string | number) => String(v).replace(/\|/g, '\\|');
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

const RESULT_TEXT: Record<AnswerResult, string> = {
  correct: '✓ 答对',
  partial: '~ 部分',
  wrong: '✗ 答错',
  skipped: '– 跳过',
};

/** 将报告序列化为 Markdown（GitHub 风味，可被大多数 Markdown 阅读器与打印器渲染） */
export function reportToMarkdown(r: StudyReport): string {
  const o = r.overview;
  const lines: string[] = [];

  lines.push('# CMC Lab 学习报告');
  lines.push('');
  lines.push(`> 生成时间：${o.generatedAt} ｜ 组别：${o.group}`);
  if (o.examDate) {
    const d = o.daysToExam === null ? '' : `（距考试 ${o.daysToExam} 天）`;
    lines.push(`> 考试日期：${o.examDate} ${d}`);
  }
  lines.push('');

  lines.push('## 一、总览');
  lines.push('');
  lines.push(
    mdTable(
      ['指标', '数值'],
      [
        ['总作答次数', o.totalAttempts],
        ['总正确率', mdRate(o.overallRate)],
        ['连续打卡', `${o.streakDays} 天`],
        ['错题总数', o.wrongTotal],
        ['未掌握错题', o.wrongUnmastered],
        ['已掌握错题', o.wrongMastered],
        ['待复习（到期）', o.dueReviews],
        ['每日目标', `${o.dailyGoal} 题`],
      ],
    ),
  );
  lines.push('');

  lines.push('## 二、知识模块进度');
  lines.push('');
  if (r.modules.length) {
    lines.push(
      mdTable(
        ['模块', '已做 / 总数', '正确率'],
        r.modules.map((m) => [m.domain, `${m.done}/${m.total}`, mdRate(m.rate)]),
      ),
    );
  } else {
    lines.push('（暂无数据）');
  }
  lines.push('');

  lines.push('## 三、各维度正确率');
  lines.push('');
  if (r.byType.length) {
    lines.push('**按题型**');
    lines.push('');
    lines.push(
      mdTable(
        ['题型', '正确 / 总', '正确率'],
        r.byType.map((d) => [d.label, `${d.correct}/${d.attempts}`, mdRate(d.rate)]),
      ),
    );
    lines.push('');
  }
  if (r.byDifficulty.length) {
    lines.push('**按难度**');
    lines.push('');
    lines.push(
      mdTable(
        ['难度', '正确 / 总', '正确率'],
        r.byDifficulty.map((d) => [d.label, `${d.correct}/${d.attempts}`, mdRate(d.rate)]),
      ),
    );
    lines.push('');
  }
  if (r.bySource.length) {
    lines.push('**按届次**');
    lines.push('');
    lines.push(
      mdTable(
        ['届次', '正确 / 总', '正确率'],
        r.bySource.map((d) => [d.label, `${d.correct}/${d.attempts}`, mdRate(d.rate)]),
      ),
    );
    lines.push('');
  }

  lines.push('## 四、薄弱知识点（正确率 < 60%）');
  lines.push('');
  if (r.weak.length) {
    lines.push(
      mdTable(
        ['知识点', '正确率', '练习次数'],
        r.weak.map((w) => [w.k, `${w.rate}%`, w.n]),
      ),
    );
  } else {
    lines.push('（暂无薄弱知识点，或练习量不足）');
  }
  lines.push('');

  lines.push('## 五、错题本');
  lines.push('');
  lines.push(`共 ${o.wrongTotal} 道错题（未掌握 ${o.wrongUnmastered}、已掌握 ${o.wrongMastered}）。`);
  lines.push('');
  lines.push('**高频错题 TOP**');
  lines.push('');
  if (r.wrongTop.length) {
    lines.push(
      mdTable(
        ['题源', '错次', '状态', '当前间隔', '下次复习'],
        r.wrongTop.map((w) => [
          w.source,
          w.count,
          w.mastered ? '已掌握' : '未掌握',
          w.interval === null ? '—' : `${w.interval} 天`,
          w.nextReview,
        ]),
      ),
    );
  } else {
    lines.push('（暂无错题）');
  }
  lines.push('');
  lines.push('**待复习队列（到期）**');
  lines.push('');
  if (r.dueList.length) {
    lines.push(
      mdTable(
        ['题源', '错次', '状态', '下次复习'],
        r.dueList.map((w) => [w.source, w.count, w.mastered ? '已掌握' : '未掌握', w.nextReview]),
      ),
    );
  } else {
    lines.push('（当前没有到期待复习的题）');
  }
  lines.push('');

  lines.push('## 六、限时模考记录');
  lines.push('');
  if (r.exams.length) {
    lines.push(
      mdTable(
        ['时间', '卷别', '得分', '对/半/错/空', '用时'],
        r.exams.map((e) => [
          e.ts,
          e.source,
          `${e.score}/${e.total}`,
          `${e.right}/${e.partial}/${e.wrong}/${e.blank}`,
          `${e.minutes} 分钟`,
        ]),
      ),
    );
  } else {
    lines.push('（尚未进行模考）');
  }
  lines.push('');

  lines.push('## 七、近期练习轨迹');
  lines.push('');
  if (r.recent.length) {
    lines.push(
      mdTable(
        ['时间', '题源', '结果'],
        r.recent.map((h) => [h.ts, h.source, RESULT_TEXT[h.result]]),
      ),
    );
  } else {
    lines.push('（暂无练习记录）');
  }
  lines.push('');

  lines.push('## 八、备考建议');
  lines.push('');
  r.suggestions.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');

  lines.push('---');
  lines.push('*本报告由 CMC Lab 自动生成。数据保存在你本机浏览器；换设备前请到「题库」页导出备份。*');
  lines.push('');

  return lines.join('\n');
}
