import { describe, expect, it } from 'vitest';
import { answerMatch, normalizeExpr, tryEval } from '../judge';

describe('normalizeExpr', () => {
  it('展开嵌套花括号的分数与根号', () => {
    // 回归用例：\frac{\sqrt{3}}{2} 曾因参数不允许嵌套而展开失败
    expect(normalizeExpr('\\frac{\\sqrt{3}}{2}')).toBe(normalizeExpr('sqrt(3)/2'));
  });

  it('补隐式乘号', () => {
    expect(normalizeExpr('6\\pi')).toBe(normalizeExpr('6*pi'));
    expect(normalizeExpr('6π')).toBe(normalizeExpr('6*pi'));
  });

  it('统一 Unicode 与 LaTeX 写法', () => {
    expect(normalizeExpr('−4')).toBe('-4');
    expect(normalizeExpr('√21')).toBe('sqrt(21)');
    expect(normalizeExpr('\\dfrac{1}{2}')).toBe(normalizeExpr('1/2'));
  });
});

describe('answerMatch', () => {
  const cases: Array<[string, string, boolean]> = [
    ['1/2', '0.5', true],
    ['\\frac{1}{2}', '1/2', true],
    ['3/2', '1.5', true],
    ['-1/3', '-0.333333333333', true],
    ['6\\pi', '6*pi', true],
    ['6π', '6*pi', true],
    ['2^10', '1024', true],
    ['\\sqrt{2}/2', '1/\\sqrt{2}', true],
    ['(a/2, a/2, a/2)', '(a/2,a/2,a/2)', true],
    ['2', '3', false],
    ['1/3', '1/2', false],
  ];
  cases.forEach(([u, c, exp]) => {
    it(`"${u}" 与 "${c}" ${exp ? '等价' : '不等价'}`, () => {
      expect(answerMatch(u, c, [])).toBe(exp);
    });
  });

  it('支持备选答案', () => {
    expect(answerMatch('y=1-x', 'y-0=-(x-1)', ['y=1-x', 'y=-x+1'])).toBe(true);
  });
});

describe('tryEval 安全性', () => {
  it('拒绝恶意输入', () => {
    expect(tryEval('alert(1)')).toBeNull();
    expect(tryEval('constructor')).toBeNull();
    expect(tryEval('window')).toBeNull();
    expect(tryEval('process.exit')).toBeNull();
  });

  it('正常算术可求值', () => {
    expect(tryEval('2^10')).toBe(1024);
    expect(tryEval('pi')).toBeCloseTo(Math.PI, 6);
  });
});
