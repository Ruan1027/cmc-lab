/**
 * 一次性脚本：从旧的单文件 HTML 中提取成熟算法，生成 src/core 的基础实现。
 *
 * 为什么要提取而不是重写：判题引擎（normalizeExpr / tryEval / answerMatch）
 * 已经过 148 项端到端测试 + 数十个等价性用例打磨，手写重写极易引入偏差。
 * 用 Function.prototype.toString() 直接取源码可保证逻辑 100% 一致。
 *
 * 用法：node scripts/extract-core.cjs
 * （仅在迁移期使用，迁移完成后可删除）
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML = path.resolve(__dirname, '../../CMC判题系统_v2.html');
const OUT = path.resolve(__dirname, '../src/core/_migrated.raw.ts');

const html = fs.readFileSync(HTML, 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
const w = dom.window;

// 等脚本执行完
setTimeout(() => {
  const fns = [
    'normKnowledge', 'normKnowledgeList', 'domainOf',
    'normalizeExpr', 'tryEval', 'looseMatch', 'answerMatch',
    'parseMarkdown', 'sourceGroup'
  ];
  const consts = [
    'KNOWLEDGE_ALIAS', 'KNOWLEDGE_DOMAIN', 'DOMAIN_ORDER',
    'FIELD_MAP', 'FN_MAP', 'FN_SHORT'
  ];

  const parts = [];
  parts.push('/* eslint-disable */');
  parts.push('// 本文件由 scripts/extract-core.cjs 从旧版单文件 HTML 自动提取，');
  parts.push('// 逻辑经过长期打磨，请勿手改；需要变更时改这里并同步跑单测。');
  parts.push('');

  for (const name of consts) {
    try {
      const v = w.eval(`JSON.stringify(${name})`);
      parts.push(`export const ${name} = ${v} as const;`);
      parts.push('');
    } catch (e) {
      console.warn('跳过常量（无法序列化）:', name, e.message);
    }
  }

  for (const name of fns) {
    try {
      const src = w.eval(`${name}.toString()`);
      parts.push(src.startsWith('function') ? src : `const ${name} = ${src};`);
      parts.push('');
    } catch (e) {
      console.warn('跳过函数:', name, e.message);
    }
  }

  fs.writeFileSync(OUT, parts.join('\n'), 'utf8');
  console.log('已生成:', OUT);
  console.log('常量', consts.length, '个，函数', fns.length, '个');
}, 200);
