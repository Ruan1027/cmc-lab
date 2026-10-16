import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdown, problemToMarkdown } from '../parser';
import { groupOfProblem, problemsOfGroup } from '../groups';

const BANK = path.resolve(__dirname, '../../data/bank');

function loadAll(): string {
  return fs
    .readdirSync(BANK)
    .filter((f) => f.endsWith('.md'))
    .map((f) => fs.readFileSync(path.join(BANK, f), 'utf8'))
    .join('\n\n');
}

describe('parseMarkdown', () => {
  it('解析内置题库为 101 题', () => {
    const list = parseMarkdown(loadAll());
    expect(list.length).toBe(101);
  });

  it('每题都有题干、答案与解析', () => {
    const list = parseMarkdown(loadAll());
    list.forEach((p) => {
      expect(p.stem.length).toBeGreaterThan(0);
      expect(p.answer.length).toBeGreaterThan(0);
      expect(p.solution.length).toBeGreaterThan(0);
    });
  });

  it('知识点已归一化且非空', () => {
    const list = parseMarkdown(loadAll());
    list.forEach((p) => expect(p.knowledge.length).toBeGreaterThan(0));
  });

  it('解析新增字段：思路 / 易错点 / 分值', () => {
    const md = [
      '## 测试题',
      '类型: 填空',
      '知识点: 极限',
      '难度: 4',
      '分值: 6',
      '题目: 求 $x$',
      '答案: 1',
      '思路: 先化简再代值',
      '易错点: 别漏常数',
      '解析: 显然',
    ].join('\n');
    const [p] = parseMarkdown(md);
    expect(p.hint).toBe('先化简再代值');
    expect(p.pitfall).toBe('别漏常数');
    expect(p.score).toBe(6);
    expect(p.difficulty).toBe(4);
  });

  it('导出的 Markdown 可被重新解析（往返一致）', () => {
    const [p] = parseMarkdown(loadAll());
    const md = problemToMarkdown(p);
    const back = parseMarkdown(md);
    expect(back.length).toBe(1);
    expect(back[0].stem).toBe(p.stem);
    expect(back[0].answer).toBe(p.answer);
  });
});

describe('组别模型', () => {
  it('题库由旧非数学类卷 71 题 + A 类卷 30 题构成', () => {
    const list = parseMarkdown(loadAll());
    const old = list.filter((p) => groupOfProblem(p) === '非数学类');
    const a = list.filter((p) => groupOfProblem(p) === '非数学A类');
    expect(old.length).toBe(71);
    expect(a.length).toBe(30);
  });

  it('报 A 类时练习范围包含旧卷，共 101 题', () => {
    const list = parseMarkdown(loadAll());
    expect(problemsOfGroup(list, '非数学A类').length).toBe(101);
    expect(problemsOfGroup(list, '非数学类').length).toBe(71);
  });
});

/**
 * 题目 id 必须**确定**：内置题库每次打开页面都重新解析，id 一旦漂移，
 * 错题本/标记/历史全部以 id 为键会集体失效，同步时内置题也剥离不掉。
 * （早期用 uid() 生成随机 id，线上真的踩了：云端 importedProblems 涨到 202 条）
 */
describe('题目 ID 的确定性', () => {
  it('同一份题库解析两次，id 完全一致', () => {
    const a = parseMarkdown(loadAll()).map((p) => p.id);
    const b = parseMarkdown(loadAll()).map((p) => p.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length); // 不重复
  });

  it('标题相同的两道题自动加序号消歧', () => {
    const text = ['## 同一标题', '题目: 甲', '', '## 同一标题', '题目: 乙'].join('\n');
    const list = parseMarkdown(text);
    expect(list).toHaveLength(2);
    expect(list[0].id).not.toBe(list[1].id);
    expect(list[1].id.startsWith(list[0].id)).toBe(true);
  });

  it('改题干不会改 id（题库修错别字不该让用户错题本失效）', () => {
    const before = parseMarkdown('## 某题\n题目: $x^2$').map((p) => p.id);
    const after = parseMarkdown('## 某题\n题目: $x^3$').map((p) => p.id);
    expect(after).toEqual(before);
  });
});
