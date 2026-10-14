/**
 * 参赛组别与适用试卷
 *
 * CMC 组别沿革（关键，别搞反）：
 * - 2022 年及以前只设「非数学类」一卷，A/B 类考生都考它
 * - 2023 年（第 15 届）起才分「非数学 A 类」「非数学 B 类」两卷
 *
 * 因此报 A 类的人，练习范围 = A 类卷 + 旧的非数学类卷。
 */
import type { ExamGroup, Problem } from '../types';

export interface GroupOption {
  value: ExamGroup;
  label: string;
  /** 该组别考生适用的卷别 */
  include: string[];
}

export const GROUP_OPTIONS: GroupOption[] = [
  { value: '非数学A类', label: '非数学 A 类', include: ['非数学A类', '非数学类'] },
  { value: '非数学B类', label: '非数学 B 类', include: ['非数学B类', '非数学类'] },
  { value: '非数学类', label: '非数学类（2022 及以前的旧卷）', include: ['非数学类'] },
];

/** 判断一道题属于哪套卷 */
export function groupOfProblem(p: Problem): string {
  if (p.group) return p.group;
  const s = p.source || '';
  // 顺序要紧：先认 A/B 卷，剩下的「非数学类」才是旧卷
  if (/非\s*数\s*学\s*A\s*类/.test(s)) return '非数学A类';
  if (/非\s*数\s*学\s*B\s*类/.test(s)) return '非数学B类';
  return '非数学类';
}

/** 某组别考生该练的题；该组别无题时退回全库，避免空白页 */
export function problemsOfGroup(list: Problem[], group: ExamGroup): Problem[] {
  const opt = GROUP_OPTIONS.find((o) => o.value === group);
  if (!opt) return list;
  const inGroup = list.filter((p) => opt.include.includes(groupOfProblem(p)));
  return inGroup.length ? inGroup : list;
}

/** 统计题库里各卷别的题数构成，用于备考页展示 */
export function groupComposition(list: Problem[]): Record<string, number> {
  const out: Record<string, number> = {};
  list.forEach((p) => {
    const g = groupOfProblem(p);
    out[g] = (out[g] || 0) + 1;
  });
  return out;
}
