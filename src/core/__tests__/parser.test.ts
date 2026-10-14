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
