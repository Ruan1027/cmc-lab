/**
 * 一次性脚本：从旧版单文件 HTML 中提取内容型数据（公式手册、易错点库），
 * 生成 src/data 下的 TS 模块。公式的 LaTeX 手抄极易出错，必须程序化提取。
 *
 * 用法：node scripts/extract-data.cjs
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML = path.resolve(__dirname, '../../CMC判题系统_v2.html');
const html = fs.readFileSync(HTML, 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
const w = dom.window;

setTimeout(() => {
  const pitfalls = JSON.parse(w.eval('JSON.stringify(PITFALL_BY_DOMAIN)'));
  const formulas = JSON.parse(w.eval('JSON.stringify(FORMULA_BOOK)'));

  const outDir = path.resolve(__dirname, '../src/data');

  const pitfallSrc = [
    '/**',
    ' * 常见易错点库（按一级知识域）',
    ' *',
    ' * 迁移自旧版应用。题目若自带「易错点」字段则优先用题目的，',
    ' * 否则按知识点所属域兜底提示——这样即便题库没写易错点也有东西可看。',
    ' */',
    '',
    'export const PITFALL_BY_DOMAIN: Record<string, string[]> = ' +
      JSON.stringify(pitfalls, null, 2) +
      ';',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'pitfalls.ts'), pitfallSrc, 'utf8');

  const formulaSrc = [
    "import type { FormulaGroup } from '../types';",
    '',
    '/**',
    ' * 核心公式定理速查手册',
    ' *',
    ' * 迁移自旧版应用，覆盖 12 个模块。渲染走 KaTeX，离线可用。',
    ' */',
    '',
    'export const FORMULA_BOOK: FormulaGroup[] = ' +
      JSON.stringify(formulas, null, 2) +
      ';',
    '',
    'export const FORMULA_COUNT = FORMULA_BOOK.reduce((s, g) => s + g.items.length, 0);',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'formulas.ts'), formulaSrc, 'utf8');

  console.log('易错点域数:', Object.keys(pitfalls).length);
  console.log('公式分组:', formulas.length, '总条数:', formulas.reduce((s, g) => s + g.items.length, 0));
}, 200);
