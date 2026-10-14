/**
 * 限时模考评卷
 *
 * 模考与日常练习的关键区别：答题过程中不反馈对错，交卷后统一批改。
 * 评卷规则：
 * - 选择 / 填空：自动判（填空走等价性判定）
 * - 解答：无法自动判，由考生交卷前自评三档（完全会做 / 部分会做 / 不会）
 * - 未作答记 0 分并计入「未答」
 */
import type { AnswerResult, Problem } from '../types';
import { answerMatch } from './judge';

export type ExamAnswer =
  | { kind: 'choice'; letter: string }
  | { kind: 'fill'; text: string }
  | { kind: 'self'; grade: 'correct' | 'partial' | 'wrong'; text?: string };

/** 标准卷分值：填空 6 分 × 5 + 解答 14 分 × 5 = 100 */
export const DEFAULT_SCORE = { fill: 6, proof: 14, choice: 6 } as const;

/** 题目分值，未标注时按标准卷兜底 */
export function scoreOf(p: Problem): number {
  if (p.score && p.score > 0) return p.score;
  if (p.type === 'proof') return DEFAULT_SCORE.proof;
  if (p.type === 'choice') return DEFAULT_SCORE.choice;
  return DEFAULT_SCORE.fill;
}

export interface GradeResult {
  score: number;
  total: number;
  right: number;
  partial: number;
  wrong: number;
  blank: number;
  detail: Array<{ id: string; source: string; result: AnswerResult; sc: number }>;
}

export function gradeExam(problems: Problem[], answers: Record<string, ExamAnswer>): GradeResult {
  let score = 0;
  let total = 0;
  let right = 0;
  let partial = 0;
  let wrong = 0;
  let blank = 0;
  const detail: GradeResult['detail'] = [];

  problems.forEach((p) => {
    const a = answers[p.id];
    const sc = scoreOf(p);
    total += sc;

    let result: AnswerResult = 'wrong';
    if (!a) {
      blank += 1;
    } else if (a.kind === 'choice') {
      const correctLetter = String(p.answer || '')
        .trim()
        .charAt(0)
        .toUpperCase();
      result = a.letter === correctLetter ? 'correct' : 'wrong';
    } else if (a.kind === 'fill') {
      result = answerMatch(a.text, p.answer, p.answerAlt) ? 'correct' : 'wrong';
    } else {
      result = a.grade;
    }

    if (result === 'correct') {
      score += sc;
      right += 1;
    } else if (result === 'partial') {
      score += sc * 0.5;
      partial += 1;
    } else {
      wrong += 1;
    }

    detail.push({ id: p.id, source: p.source, result, sc });
  });

  return { score, total, right, partial, wrong, blank, detail };
}

/** 模考失分集中在哪些知识点 */
export function lossByKnowledge(
  problems: Problem[],
  detail: GradeResult['detail'],
): Array<{ k: string; n: number }> {
  const map: Record<string, number> = {};
  detail.forEach((d) => {
    if (d.result === 'correct') return;
    const p = problems.find((x) => x.id === d.id);
    (p?.knowledge || []).forEach((k) => {
      map[k] = (map[k] || 0) + 1;
    });
  });
  return Object.keys(map)
    .map((k) => ({ k, n: map[k] }))
    .sort((a, b) => b.n - a.n);
}
