/**
 * 判题引擎：数学表达式等价性判定
 *
 * 迁移自旧版单文件应用，逻辑经 148 项端到端测试 + 数十个等价性用例打磨。
 * 核心难点与取舍：
 *
 * 1. 同一答案写法千差万别：`\frac{\sqrt{3}}{2}`、`sqrt(3)/2`、`√3/2` 要判为等价
 * 2. 不能做符号化简（那要引入 CAS），所以采用「归一化 + 数值兜底」两段式：
 *    - 归一化：Unicode→ASCII、LaTeX 展开、补隐式乘号、剥冗余括号
 *    - 数值兜底：两边都能求出数值时按 1e-6 容差比较（含 π、e、根号都行）
 * 3. 安全性：tryEval 用 Function 求值前先做字符白名单 + 危险词黑名单，
 *    用户输入永远不会被执行到恶意代码
 */

/** LaTeX 命令 → 统一短名 */
const FN_MAP: ReadonlyArray<readonly [string, string]> = [
  ['\\arcsin', 'asin'], ['\\arccos', 'acos'], ['\\arctan', 'atan'],
  ['\\sin', 'sin'], ['\\cos', 'cos'], ['\\tan', 'tan'],
  ['\\ln', 'ln'], ['\\log', 'log'], ['\\lg', 'log'],
  ['\\sqrt', 'sqrt'], ['\\abs', 'abs'], ['\\pi', 'pi'], ['\\cbrt', 'cbrt'],
];

/** 归一化后的函数短名，按长度降序，保证 arcsin 先于 sin 匹配 */
const FN_SHORT: ReadonlyArray<readonly [string, string]> = [
  'arcsin', 'arccos', 'arctan', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'ln', 'log', 'abs', 'pi',
]
  .map((n) => [n, ({ arcsin: 'asin', arccos: 'acos', arctan: 'atan' } as Record<string, string>)[n] || n] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);

/**
 * 把任意写法的数学表达式归一化成可比较的字符串
 *
 * @example normalizeExpr('\\frac{\\sqrt{3}}{2}') === 'sqrt(3)/2'
 */
export function normalizeExpr(s: string | null | undefined): string {
  if (s == null) return '';
  let str = String(s).trim().replace(/^\$+|\$+$/g, '');

  // ---- 1. Unicode 符号 → ASCII ----
  str = str
    .replace(/[−–—]/g, '-')
    .replace(/[×✕✖]/g, '*')
    .replace(/÷/g, '/')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/，/g, ',')
    .replace(/；/g, ';')
    .replace(/＜/g, '<')
    .replace(/＞/g, '>')
    .replace(/π/g, 'pi')
    .replace(/∞/g, 'oo')
    .replace(/％/g, '%')
    .replace(/√/g, 'sqrt')
    .replace(/∛/g, 'cbrt')
    .replace(/·/g, '*');

  // ---- 2. LaTeX 结构 ----
  let prev = '';
  // 参数允许再嵌一层花括号（\frac{\sqrt{3}}{2} 这类），配合 do-while 逐层剥开
  const ARG = '((?:[^{}]|\\{[^{}]*\\})*)';
  do {
    prev = str;
    str = str.replace(new RegExp('\\\\[dt]?frac\\s*\\{' + ARG + '\\}\\s*\\{' + ARG + '\\}', 'g'), '($1)/($2)');
  } while (str !== prev);
  do {
    prev = str;
    str = str.replace(new RegExp('\\\\sqrt\\s*\\[\\s*(\\d+)\\s*\\]\\s*\\{' + ARG + '\\}', 'g'), 'root($1,$2)');
  } while (str !== prev);
  do {
    prev = str;
    str = str.replace(new RegExp('\\\\sqrt\\s*\\{' + ARG + '\\}', 'g'), 'sqrt($1)');
  } while (str !== prev);
  // 裸根号：√21 → sqrt21，需要补括号
  str = str.replace(/\b(sqrt|cbrt)(?=\d)/g, '$1@');
  str = str.replace(/\b(sqrt|cbrt)@(\d+(?:\.\d+)?)/g, '$1($2)');

  // ---- 3. 反斜杠命令 ----
  FN_MAP.forEach((pair) => {
    str = str.split(pair[0]).join(pair[1]);
  });
  str = str
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\infty/g, 'oo')
    .replace(/\\%|\\percent/g, '%')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\[,;:!]|\\quad|\\qquad|\\enspace|\\thinspace|\\left|\\right/g, '');
  // 其余残留命令（\in \le \ge \to \lim \partial …）：丢掉命令名
  str = str.replace(/\\[a-zA-Z]+/g, '');
  str = str.replace(/[{}]/g, '');
  // 绝对值 |x| → abs(x)
  str = str.replace(/\|([^|]+)\|/g, 'abs($1)');

  // ---- 4. 补隐式乘号（单趟扫描）----
  // 从左到右逐字符走：函数名整体吞掉不拆开；
  // 遇到「数字/字母/右括号 紧跟 字母」时补 *。
  const low = str.toLowerCase();
  let out = '';
  let i = 0;
  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isAlpha = (c: string) => /[a-z]/i.test(c);
  while (i < low.length) {
    let matched: { len: number; text: string } | null = null;
    for (const pair of FN_SHORT) {
      const name = pair[0];
      const short = pair[1];
      if (!low.startsWith(name, i)) continue;
      const before = i > 0 ? low[i - 1] : '';
      const after = low[i + name.length] || '';
      // 紧跟在字母后面 → 是变量名的一部分（如 pindex、lnx），不当函数
      if (before && isAlpha(before)) continue;
      // 紧跟在数字后面：可能是 6pi（隐式乘积），也可能是变量名 x2pi 的片段。
      // 仅当后面不是字母时才认为是函数。
      if (before && isDigit(before) && isAlpha(after)) continue;
      matched = { len: name.length, text: short };
      break;
    }
    if (matched) {
      // 函数名/符号紧跟数字或右括号时补乘号（6pi → 6*pi）
      const prevCh = out ? out[out.length - 1] : '';
      if (out && (isDigit(prevCh) || prevCh === ')' || prevCh === ']')) out += '*';
      out += matched.text;
      i += matched.len;
      continue;
    }
    const ch = low[i];
    const prevCh = out ? out[out.length - 1] : '';
    // 刚输出的是函数短名（后面紧跟 '('），此时不应补乘号
    const prevIsFn = FN_SHORT.some((pair) => out.endsWith(pair[1]));
    if (
      out && !prevIsFn && prevCh !== '*' &&
      (isDigit(prevCh) || isAlpha(prevCh) || prevCh === ')' || prevCh === ']')
    ) {
      if (isAlpha(ch) || ch === '(') out += '*';
    }
    out += ch;
    i += 1;
  }
  str = out;

  // ---- 5. 还原函数短名 ----
  str = str
    .replace(/\basin\(/g, 'arcsin(')
    .replace(/\bacos\(/g, 'arccos(')
    .replace(/\batan\(/g, 'arctan(');

  // ---- 5.5 剥掉只裹着单个因子的冗余括号 ----
  // \frac{\sqrt{3}}{2} 展开成 (sqrt(3))/(2)，而手写答案常是 sqrt(3)/2，
  // 不剥括号的话两者字符串对不上，只能靠数值比较兜底（含变量时兜不住）。
  // 括号前若是字母（sqrt(3) 的 3）或括号内带运算符（(x+1)）都不动。
  const ATOM = '(?:sqrt|cbrt|abs|ln|log|sin|cos|tan|arcsin|arccos|arctan)\\([^()]*\\)|[a-z]\\d*|\\d+(?:\\.\\d+)?';
  let prevParen = '';
  do {
    prevParen = str;
    str = str.replace(new RegExp('([^a-z0-9]|^)\\((' + ATOM + ')\\)', 'g'), '$1$2');
  } while (str !== prevParen);

  // ---- 6. 收尾 ----
  str = str.replace(/\s+/g, '');
  str = str.replace(/[。.]+$/g, '');
  str = str.replace(/(\d|\))\*1(?![0-9])/g, '$1');
  str = str.replace(/^1\*(?=[0-9(])/, '');
  str = str.replace(/\*\*/g, '^');
  return str;
}

/**
 * 把归一化后的表达式求值，失败返回 null
 *
 * 安全边界：先过危险词黑名单，再过算术字符白名单，最后才交给 Function。
 * 任何一步不过关直接返回 null，绝不执行。
 */
export function tryEval(s: string): number | null {
  let js = s;
  js = js.replace(/\^/g, '**');
  js = js.replace(/\bpi\b/g, 'Math.PI');
  js = js.replace(/\broot\(([^,()]+),([^,()]+)\)/g, 'Math.pow($2,1/$1)');
  // e 作为自然常数：只在不是标识符一部分时替换
  js = js.replace(/(^|[^a-z0-9_])e(?![a-z0-9_])/g, '$1Math.E');
  js = js.replace(/\be\*\*/g, 'Math.E**');
  js = js.replace(/\*e\b/g, '*Math.E');
  js = js.replace(/\bsqrt\(/g, 'Math.sqrt(');
  js = js.replace(/\bcbrt\(/g, 'Math.cbrt(');
  js = js.replace(/\babs\(/g, 'Math.abs(');
  js = js.replace(/\bln\(/g, 'Math.log(');
  js = js.replace(/\blog\(/g, 'Math.log10(');
  js = js.replace(/\barcsin\(/g, 'Math.asin(');
  js = js.replace(/\barccos\(/g, 'Math.acos(');
  js = js.replace(/\barctan\(/g, 'Math.atan(');
  js = js.replace(/\bsin\(/g, 'Math.sin(');
  js = js.replace(/\bcos\(/g, 'Math.cos(');
  js = js.replace(/\btan\(/g, 'Math.tan(');

  const DANGER = new RegExp("[;=\\[\\]{}'\"\\x60]|=>|function|eval|window|document|this|constructor|import|require|process", 'i');
  if (DANGER.test(js)) return null;
  if (!/^[-+*/().,0-9a-zA-Z_*]*$/.test(js)) return null;

  try {
    const r = Function('"use strict"; return (' + js + ')')();
    if (typeof r === 'number' && isFinite(r)) return r;
  } catch {
    return null;
  }
  return null;
}

/** 忽略字符顺序的比较（处理 a+b 与 b+a 这类交换律差异） */
export function looseMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  return a.split('').sort().join('') === b.split('').sort().join('');
}

/**
 * 判断用户答案是否与标准答案等价
 *
 * @param user 用户输入
 * @param correct 标准答案
 * @param alts 等价答案列表，与 correct 同等对待
 */
export function answerMatch(user: string, correct: string, alts: readonly string[] = []): boolean {
  const list = [correct, ...alts];
  const nu = normalizeExpr(user);
  if (!nu) return false;
  for (const cand of list) {
    if (!cand) continue;
    const nc = normalizeExpr(cand);
    if (!nc) continue;
    if (nu === nc) return true;
    if (looseMatch(nu, nc)) return true;
    const vu = tryEval(nu);
    const vc = tryEval(nc);
    if (vu !== null && vc !== null && Math.abs(vu - vc) < 1e-6) return true;
  }
  return false;
}
