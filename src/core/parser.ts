/**
 * Markdown 题库解析器
 *
 * 题库以 Markdown 存放而非 JSON/数据库，是有意为之：
 * - 纯文本，diff 友好，任何人都能在 GitHub/Gitee 网页上直接提交题目 PR
 * - 无需构建步骤即可新增试题
 *
 * 格式（每题以 ## 开头）：
 *   ## 2024 第十六届CMC预赛 非数学A类 填空1
 *   类型: 填空
 *   知识点: 极限, 等价无穷小
 *   难度: 3
 *   分值: 6
 *   题目: 计算 $\lim_{x\to 0}\frac{\sin 3x}{x}$
 *   答案: 3
 *   备选: 3.0
 *   思路: ...
 *   易错点: ...
 *   解析: ...
 */
import type { Problem, ProblemType } from '../types';
import { normKnowledgeList } from './knowledge';
import { uid } from '../utils/id';

/** 中文字段名 → 数据字段名（允许同义写法） */
export const FIELD_MAP: Record<string, string> = {
  类型: 'type', 题型: 'type',
  知识点: 'knowledge', 考点: 'knowledge',
  难度: 'difficulty',
  分值: 'score',
  题目: 'stem', 题干: 'stem',
  选项: 'options',
  答案: 'answer', 正确答案: 'answer',
  备选: 'answerAlt', 备选答案: 'answerAlt', 其他答案: 'answerAlt',
  解析: 'solution', 详解: 'solution',
  思路: 'hint', 解题思路: 'hint',
  易错点: 'pitfall', 易错: 'pitfall', 注意: 'pitfall',
  组别: 'group', 参赛组别: 'group',
  来源: 'source',
};

export const KNOWN_FIELDS = Object.keys(FIELD_MAP);

/** 分值兜底：从题干里提取「（本题 14 分）」「（8 分）」 */
function extractScore(stem: string): number | null {
  const m = stem.match(/[（(]\s*(?:本题\s*)?(\d+(?:\.\d+)?)\s*分\s*[）)]/);
  return m ? parseFloat(m[1]) : null;
}

function emptyProblem(source: string): Problem {
  return {
    id: uid(),
    source,
    type: 'fill',
    knowledge: [],
    difficulty: 3,
    score: null,
    group: '',
    hint: '',
    pitfall: '',
    stem: '',
    options: [],
    answer: '',
    answerAlt: [],
    solution: '',
  };
}

/** 解析整段 Markdown，返回题目列表（跳过无题干且无答案的块） */
export function parseMarkdown(text: string): Problem[] {
  const blocks = text.split(/^##\s+/m).filter((b) => b.trim());
  const problems: Problem[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const title = lines[0].trim();
    const p = emptyProblem(title);

    let curField: string | null = null;
    let curValue: string[] = [];

    const flush = () => {
      if (!curField) return;
      const val = curValue.join('\n').trim();
      const key = FIELD_MAP[curField];
      if (key === 'type') {
        if (/选择/.test(val)) p.type = 'choice' as ProblemType;
        else if (/解答|证明/.test(val)) p.type = 'proof' as ProblemType;
        else p.type = 'fill' as ProblemType;
      } else if (key === 'knowledge') {
        p.knowledge = normKnowledgeList(
          val.split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
        );
      } else if (key === 'difficulty') {
        const n = parseInt(val, 10);
        if (n >= 1 && n <= 5) p.difficulty = n;
      } else if (key === 'score') {
        const n = parseFloat(val.replace(/[^\d.]/g, ''));
        if (n > 0) p.score = n;
      } else if (key === 'options') {
        p.options = val.split('|').map((s) => s.trim()).filter(Boolean);
      } else if (key === 'answerAlt') {
        p.answerAlt = val.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      } else if (key) {
        (p as unknown as Record<string, unknown>)[key] = val;
      }
      curField = null;
      curValue = [];
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(/^\s*([^\s:：]{1,8})\s*[:：]\s*(.*)$/);
      if (m && KNOWN_FIELDS.includes(m[1].trim())) {
        flush();
        curField = m[1].trim();
        curValue = [m[2]];
      } else if (curField) {
        curValue.push(line);
      }
    }
    flush();

    if (!p.score) p.score = extractScore(p.stem);
    if (p.stem || p.answer) problems.push(p);
  }

  return problems;
}

/** 反向导出：题目 → Markdown，用于备份与分享 */
export function problemToMarkdown(p: Problem): string {
  const lines = [`## ${p.source}`];
  const typeName = p.type === 'choice' ? '选择' : p.type === 'fill' ? '填空' : '解答';
  lines.push(`类型: ${typeName}`);
  if (p.knowledge?.length) lines.push(`知识点: ${p.knowledge.join(', ')}`);
  lines.push(`难度: ${p.difficulty}`);
  if (p.score) lines.push(`分值: ${p.score}`);
  if (p.group) lines.push(`组别: ${p.group}`);
  lines.push(`题目: ${p.stem}`);
  if (p.options?.length) lines.push(`选项: ${p.options.join(' | ')}`);
  lines.push(`答案: ${p.answer}`);
  if (p.answerAlt?.length) lines.push(`备选: ${p.answerAlt.join(', ')}`);
  if (p.hint) lines.push(`思路: ${p.hint}`);
  if (p.pitfall) lines.push(`易错点: ${p.pitfall}`);
  if (p.solution) lines.push(`解析:\n${p.solution}`);
  return lines.join('\n');
}
