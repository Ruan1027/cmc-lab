/**
 * 校验单文件产物：模拟 file:// 场景（jsdom 直接加载本地 HTML，不提供任何外部资源），
 * 确认应用能启动、题库能加载、公式能渲染。外部资源加载失败会体现在 jsdom 报错里。
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const file = path.resolve(__dirname, '../dist/index.html');
const html = fs.readFileSync(file, 'utf8');

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push('jsdomError: ' + (e.message || e)));
vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'file:///D:/test/index.html', // 关键：file 协议
  virtualConsole: vc,
});

const w = dom.window;

setTimeout(() => {
  const doc = w.document;
  const rootText = doc.getElementById('root')?.textContent || '';
  const ok = [];
  const bad = [];

  if (rootText.includes('CMC Lab')) ok.push('应用已启动（标题渲染）');
  else bad.push('应用未启动，root 内容：' + rootText.slice(0, 120));

  if (/\d+\s*题/.test(rootText)) ok.push('题库已加载：' + (rootText.match(/\d+\s*题/) || [''])[0]);
  else bad.push('题库未加载');

  // 切到手册页验证 KaTeX 渲染
  const btns = [...doc.querySelectorAll('button')].filter((b) => b.textContent.includes('手册'));
  if (btns.length) {
    btns[0].click();
    setTimeout(() => {
      const katex = doc.querySelectorAll('.katex').length;
      if (katex > 0) ok.push('KaTeX 公式渲染成功（' + katex + ' 处）');
      else bad.push('KaTeX 未渲染（字体或样式可能未内联）');

      console.log('通过：');
      ok.forEach((t) => console.log('  [OK] ' + t));
      if (bad.length) {
        console.log('失败：');
        bad.forEach((t) => console.log('  [!!] ' + t));
      }
      if (errs.length) {
        console.log('运行时错误（前 3 条）：');
        errs.slice(0, 3).forEach((e) => console.log('  ' + e.slice(0, 200)));
      } else {
        console.log('无运行时错误');
      }
      console.log(bad.length ? '\n结果：单文件不可用' : '\n结果：单文件可双击运行');
    }, 600);
  } else {
    console.log('未找到「手册」按钮，root 内容：' + rootText.slice(0, 200));
  }
}, 2500);
