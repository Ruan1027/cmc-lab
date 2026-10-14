/** 易错点提示：题目自带优先，否则按知识点所属域兜底 */
import type { Problem } from '../types';
import { PITFALL_BY_DOMAIN } from '../data/pitfalls';
import { domainOf } from './knowledge';

export function pitfallsFor(p: Problem): string[] {
  if (!p) return [];
  if (p.pitfall) return [p.pitfall];
  const out: string[] = [];
  (p.knowledge || []).forEach((k) => {
    const list = PITFALL_BY_DOMAIN[domainOf(k)];
    if (!list) return;
    list.forEach((t) => {
      if (!out.includes(t)) out.push(t);
    });
  });
  return out.slice(0, 4);
}
