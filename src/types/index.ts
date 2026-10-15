/**
 * 领域模型定义
 *
 * 约定：这里只放数据结构，不放逻辑。所有跨模块的契约都以此为准，
 * 核心算法（core/）依赖这些类型但不依赖 React、不依赖浏览器 API。
 */

/** 题目类型：选择 / 填空 / 解答（证明归入解答） */
export type ProblemType = 'choice' | 'fill' | 'proof';

/** 单题作答结果 */
export type AnswerResult = 'correct' | 'partial' | 'wrong' | 'skipped';

/** 参赛组别。2022 年及以前只有「非数学类」一卷，2023 年起才分 A/B 卷 */
export type ExamGroup = '非数学A类' | '非数学B类' | '非数学类';

export interface Problem {
  id: string;
  /** 来源标题，形如「2024 第十六届CMC预赛 非数学A类 填空1」 */
  source: string;
  type: ProblemType;
  /** 归一化后的知识点标签 */
  knowledge: string[];
  /** 1-5 */
  difficulty: number;
  /** 分值，未标注时由模考按标准卷兜底 */
  score: number | null;
  /** 卷别：非数学A类 / 非数学B类 / 非数学类 */
  group: string;
  /** 解题思路 */
  hint: string;
  /** 易错点 */
  pitfall: string;
  stem: string;
  options: string[];
  answer: string;
  /** 等价答案，判题时与 answer 同等对待 */
  answerAlt: string[];
  solution: string;
}

/** 一次作答记录 */
export interface HistoryEntry {
  id: string;
  result: AnswerResult;
  ts: number;
  /** 用户实际输入，解答题留存思路用于复盘 */
  ua?: string;
}

/** 错题本条目 */
export interface WrongEntry {
  count: number;
  lastWrong: number;
  mastered: boolean;
  lastResult?: AnswerResult;
  /** 错因计数，如 { calc: 2, method: 1 } */
  reasons?: Record<string, number>;
  /** —— 以下为间隔重复调度字段（SM-2，见 core/scheduler.ts）——
   *  全部可选：升级前保存的旧数据没有这些字段，由 schedOf() 兜底 */
  /** 记忆难度系数 1.3 ~ 2.5 */
  easiness?: number;
  /** 当前间隔（天） */
  interval?: number;
  /** 下次复习时间戳；缺失视为立即到期 */
  dueDate?: number;
  /** 连续答对次数 */
  reps?: number;
}

export interface StatsBucket {
  attempts: number;
  correct: number;
}

export interface Stats {
  attempts: number;
  correct: number;
  byKnowledge: Record<string, StatsBucket>;
  byType: Record<string, StatsBucket>;
  byDifficulty: Record<string, StatsBucket>;
  bySource: Record<string, StatsBucket>;
}

/** 一次限时模考的记录 */
export interface ExamRecord {
  ts: number;
  source: string;
  minutes: number;
  used: number;
  score: number;
  total: number;
  right: number;
  partial: number;
  wrong: number;
  blank: number;
  /** 是否超时自动交卷 */
  auto: boolean;
  detail: Array<{ id: string; source: string; result: AnswerResult; sc: number }>;
}

export interface Settings {
  group: ExamGroup;
  /** YYYY-MM-DD */
  examDate: string;
  dailyGoal: number;
  examMinutes: number;
}

/** 知识模块（一级域）的进度 */
export interface ModuleProgress {
  domain: string;
  total: number;
  done: number;
  attempts: number;
  correct: number;
}

/** 今日任务中的一项 */
export interface PlanTask {
  label: string;
  ids: string[];
  why: string;
}

/** 竞赛资讯条目 */
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: '通知' | '赛程' | '经验' | '资源';
  summary: string;
  link?: string;
  /** 是否置顶 */
  pinned?: boolean;
}

/** 公式手册条目 */
export interface FormulaItem {
  name: string;
  tex: string;
  note?: string;
}

export interface FormulaGroup {
  domain: string;
  items: FormulaItem[];
}
