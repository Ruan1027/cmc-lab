import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
// 校验器是零依赖 CJS 脚本，CI 直接 node 运行；这里导入其纯函数做单元/集成测试
import { validateBank } from '../../../scripts/validate-bank.cjs';

function withBank(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'cmc-bank-'));
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content, 'utf8');
  }
  return dir;
}

const GOOD = `## 2024 第十六届CMC预赛 非数学A类 填空1
类型: 填空
知识点: 极限
难度: 3
分值: 6
题目: $\\int x\\,dx$
答案: x^2/2
解析: 直接积分即可。
`;

describe('validateBank 逻辑', () => {
  it('合法题目：无错误，计 1 题', () => {
    const dir = withBank({ 'a.md': GOOD });
    const r = validateBank(dir);
    expect(r.errors).toEqual([]);
    expect(r.counts.problems).toBe(1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('缺少「答案」→ 报错', () => {
    const dir = withBank({ 'a.md': '## t\n题目: x\n解析: .\n' });
    const r = validateBank(dir);
    expect(r.errors.some((e) => /答案/.test(e.msg))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('缺少「题目」→ 报错', () => {
    const dir = withBank({ 'a.md': '## t\n答案: 1\n解析: .\n' });
    const r = validateBank(dir);
    expect(r.errors.some((e) => /题目/.test(e.msg))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('非法 data URI → 报错', () => {
    const dir = withBank({
      'a.md': '## t\n题目: ![图](data:image/png;base64,@@@@)\n答案: 1\n解析: .\n',
    });
    const r = validateBank(dir);
    expect(r.errors.some((e) => /data URI/.test(e.msg))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('重复题目标题 → 报错', () => {
    const dir = withBank({ 'a.md': GOOD + '\n' + GOOD });
    const r = validateBank(dir);
    expect(r.errors.some((e) => /重复/.test(e.msg))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('公式定界符未闭合 → 警告', () => {
    const dir = withBank({ 'a.md': '## t\n题目: $x\n答案: 1\n解析: .\n' });
    const r = validateBank(dir);
    expect(r.warnings.some((w) => /定界符/.test(w.msg))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('真实内置题库（集成）', () => {
  const r = validateBank();
  it('共 101 题、10 个文件、零错误', () => {
    expect(r.counts.problems).toBe(101);
    expect(r.counts.files).toBe(10);
    expect(r.errors).toEqual([]);
  });
});
