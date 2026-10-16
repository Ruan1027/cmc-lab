/**
 * 校验单文件产物：模拟 file:// 场景（jsdom 直接加载本地 HTML，不提供任何外部资源），
 * 确认应用能启动、题库能加载、公式能渲染。外部资源加载失败会体现在 jsdom 报错里。
 *
 * 两道检查，缺一不可：
 *   1. **静态**：把内联脚本块交给 vm 编译。HTML 提前闭合脚本块、替换串被 $ 模式腐蚀
 *      这类问题都会在这一步以 SyntaxError 现形，比"页面白屏"好定位得多。
 *   2. **动态**：jsdom 里真跑一遍，确认 React 挂载、题库加载、KaTeX 渲染。
 *
 * 失败必须**非零退出**：这个脚本曾经只打印一行提示就返回 0，
 * 结果一个彻底白屏的单文件被判成"通过" —— 假绿比不测更糟。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const file = path.resolve(__dirname, '../dist/index.html');
const html = fs.readFileSync(file, 'utf8');

const ok = [];
const bad = [];

// ---------- 1. 静态：逐块编译内联脚本 ----------
const blockRe = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
let m;
let blocks = 0;
while ((m = blockRe.exec(html)) !== null) {
  const asttr = (m[1] || '').trim();
  if (asttr.includes('src=')) continue; // 外链脚本在 file:// 下必然失败，单文件不该有
  blocks += 1;
  try {
    new vm.Script(m[2], { filename: `inline-${blocks}.js` });
  } catch (e) {
    bad.push(`内联脚本块 ${blocks} 语法错误：${e.message}`);
  }
}
if (blocks === 0) bad.push('没有找到任何内联脚本块，单文件构建没把 JS 打进去');
else if (!bad.length) ok.push(`内联脚本 ${blocks} 块全部编译通过`);

// 外链资源检查（file:// 下取不到，出现了就是构建配置退化）
const externals = [...html.matchAll(/<(?:script|link)[^>]*\s(?:src|href)="(https?:|\/\/)[^"]*"/gi)].map(
  (x) => x[0].slice(0, 120),
);
if (externals.length) bad.push(`存在外部资源引用（file:// 下会失败）：${externals[0]}`);
else ok.push('无外部资源引用（离线可用）');

// ---------- 2. 动态：jsdom 里真跑 ----------
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push(String(e.stack || e.message || e)));
vc.on('error', (...a) => errs.push('console.error: ' + a.map(String).join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'file:///D:/test/index.html', // 关键：file 协议
  virtualConsole: vc,
});

const w = dom.window;

function report() {
  console.log('通过：');
  ok.forEach((t) => console.log('  [OK] ' + t));
  if (bad.length) {
    console.log('失败：');
    bad.forEach((t) => console.log('  [!!] ' + t));
  }
  if (errs.length) {
    console.log('运行时错误（前 3 条）：');
    errs.slice(0, 3).forEach((e) => console.log('  ' + e.slice(0, 400).replace(/\n/g, '\n  ')));
  } else {
    console.log('无运行时错误');
  }
  const pass = bad.length === 0 && errs.length === 0;
  console.log(pass ? '\n结果：单文件可双击运行' : '\n结果：单文件不可用');
  process.exit(pass ? 0 : 1);
}

setTimeout(() => {
  const doc = w.document;
  const rootText = doc.getElementById('root')?.textContent || '';

  if (rootText.includes('CMC Lab')) ok.push('应用已启动（标题渲染）');
  else bad.push('应用未启动，root 内容：' + rootText.slice(0, 120));

  if (/\d+\s*题/.test(rootText)) ok.push('题库已加载：' + (rootText.match(/\d+\s*题/) || [''])[0]);
  else bad.push('题库未加载');

  // 切到手册页验证 KaTeX 渲染
  const btns = [...doc.querySelectorAll('button')].filter((b) => b.textContent.includes('手册'));
  if (!btns.length) {
    bad.push('未找到「手册」按钮，页面没渲染出导航');
    report();
    return;
  }
  btns[0].click();
  setTimeout(() => {
    const katex = doc.querySelectorAll('.katex').length;
    if (katex > 0) ok.push('KaTeX 公式渲染成功（' + katex + ' 处）');
    else bad.push('KaTeX 未渲染（字体或样式可能未内联）');
    report();
  }, 600);
}, 2500);
