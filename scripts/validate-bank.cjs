#!/usr/bin/env node
/**
 * CMC 题库格式校验器（零依赖 CLI）
 *
 * 设计目标：
 * - 与 src/core/parser.ts 的字段规则保持一致（KNOWN_FIELDS 这里单独维护，避免引入 TS 构建）
 * - 在 GitHub Actions 的 PR 流程里运行，格式不合规则 CI 失败并展示错误
 * - 既能被 CI 直接 `node scripts/validate-bank.cjs` 调用，也能被 vitest 以
 *   `validateBank()` 形式导入做集成测试（validateBank 为纯函数，不触发 process.exit）
 *
 * 规则分级：
 *   错误（ERROR）→ 退出码 1，CI 失败；如缺少题目/答案、data URI 非法、标题重复
 *   警告（WARN） → 不失败，但提示潜在问题；如难度越界、外链图片、未知字段名、公式未闭合
 *
 * 注意：不要擅自删减 KNOWN_FIELDS，它与 parser.ts 的 FIELD_MAP 必须同步。
 */

const fs = require('fs');
const path = require('path');

/** 与 src/core/parser.ts 的 KNOWN_FIELDS 保持一致 */
const KNOWN_FIELDS = [
  '类型', '题型', '知识点', '考点', '难度', '分值', '题目', '题干', '选项',
  '答案', '正确答案', '备选', '备选答案', '其他答案', '解析', '详解',
  '思路', '解题思路', '易错点', '易错', '注意', '组别', '参赛组别', '来源',
];

const VALID_GROUPS = ['非数学A类', '非数学B类', '非数学类'];

const ROOT = path.resolve(__dirname, '..');
const BANK_DIR = path.join(ROOT, 'src', 'data', 'bank');

/**
 * 校验题库目录。
 * @param {string} [bankDir] 覆盖默认题库目录（测试时可用）
 * @returns {{ errors: Array<{file:string,line:number,msg:string}>,
 *             warnings: Array<{file:string,line:number,msg:string}>,
 *             counts: { files:number, problems:number } }}
 */
function validateBank(bankDir = BANK_DIR) {
  const errors = [];
  const warnings = [];
  const problems = []; // { file, title, startLine, fields: [{name,value,line,unknown}] }

  if (!fs.existsSync(bankDir)) {
    errors.push({ file: bankDir, line: 0, msg: '题库目录不存在' });
    return { errors, warnings, counts: { files: 0, problems: 0 } };
  }

  const files = fs
    .readdirSync(bankDir)
    .filter((f) => /\.md$/i.test(f))
    .sort();

  for (const file of files) {
    const abs = path.join(bankDir, file);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    const text = fs.readFileSync(abs, 'utf8');
    const lines = text.split('\n');

    let cur = null;
    const pushCur = () => { if (cur) problems.push(cur); };

    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      const line = lines[i];
      const heading = line.match(/^##\s+(.+?)\s*$/);
      if (heading) {
        pushCur();
        cur = { file: rel, title: heading[1].trim(), startLine: lineNo, fields: [] };
        continue;
      }
      if (!cur) continue;
      const field = line.match(/^\s*([^\s:：]{1,8})\s*[:：]\s*(.*)$/);
      if (field && KNOWN_FIELDS.includes(field[1].trim())) {
        // 已知字段 → 新建字段（与 src/core/parser.ts 完全一致）
        cur.fields.push({ name: field[1].trim(), value: field[2], line: lineNo });
      } else if (cur.fields.length) {
        // 续行 或 未知字段名（如正文里的「证明：」「注：」）—— 并入上一已知字段。
        // 与 parser 的 else-if(curField) 吸收逻辑一致，避免把正文误报成未知字段。
        const last = cur.fields[cur.fields.length - 1];
        last.value += '\n' + line;
      }
    }
    pushCur();
  }

  // 标题重复检测（跨文件）
  const titleSeen = new Map();
  for (const p of problems) {
    if (!p.title) {
      errors.push({ file: p.file, line: p.startLine, msg: '题目块标题为空' });
      continue;
    }
    const key = p.title.toLowerCase();
    if (titleSeen.has(key)) {
      errors.push({
        file: p.file, line: p.startLine,
        msg: `重复的题目标题「${p.title}」（首次出现在 ${titleSeen.get(key)}）`,
      });
    } else {
      titleSeen.set(key, `${p.file}:${p.startLine}`);
    }
  }

  // 逐题字段校验
  for (const p of problems) {
    const get = (...names) => {
      for (const n of names) {
        const f = p.fields.find((x) => x.name === n && !x.unknown);
        if (f) return f.value;
      }
      return undefined;
    };
    const fieldLine = (...names) => {
      for (const n of names) {
        const f = p.fields.find((x) => x.name === n && !x.unknown);
        if (f) return f.line;
      }
      return p.startLine;
    };

    const stem = get('题目', '题干');
    const answer = get('答案', '正确答案');
    const solution = get('解析', '详解');
    const type = get('类型', '题型');
    const diff = get('难度');
    const score = get('分值');
    const group = get('组别', '参赛组别');

    if (!stem || !stem.trim()) {
      errors.push({ file: p.file, line: p.startLine, msg: '缺少「题目」字段或内容为空' });
    }
    if (!answer || !answer.trim()) {
      errors.push({ file: p.file, line: p.startLine, msg: '缺少「答案」字段或内容为空' });
    }
    if (!solution || !solution.trim()) {
      warnings.push({ file: p.file, line: p.startLine, msg: '缺少「解析」字段（建议补齐）' });
    }
    if (type && !/选择|填空|解答|证明|choice|fill|proof/i.test(type.trim())) {
      warnings.push({ file: p.file, line: fieldLine('类型', '题型'), msg: `类型值异常：「${type.trim()}」` });
    }
    if (diff !== undefined) {
      const n = parseInt(diff, 10);
      if (!(n >= 1 && n <= 5)) {
        warnings.push({ file: p.file, line: fieldLine('难度'), msg: `难度应为 1-5 整数，当前「${diff.trim()}」` });
      }
    }
    if (score !== undefined) {
      const n = parseFloat(score.replace(/[^\d.]/g, ''));
      if (!(n > 0)) {
        warnings.push({ file: p.file, line: fieldLine('分值'), msg: `分值应为正数，当前「${score.trim()}」` });
      }
    }
    if (group && !VALID_GROUPS.includes(group.trim())) {
      warnings.push({ file: p.file, line: fieldLine('组别', '参赛组别'), msg: `组别值异常：「${group.trim()}」（应为 非数学A类/非数学B类/非数学类）` });
    }

    // 图片：仅校验含 ![alt](src) 的字段
    for (const f of p.fields) {
      const re = /!\[[^\]]*\]\(([^)\s]+)\)/g;
      let m;
      while ((m = re.exec(f.value)) !== null) {
        const src = m[1];
        if (src.startsWith('data:image/')) {
          const dm = src.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
          if (!dm) {
            errors.push({ file: p.file, line: f.line, msg: `图片 data URI 格式不正确（应为 data:image/<type>;base64,...）` });
          } else {
            const b64 = dm[1];
            if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.length % 4 !== 0) {
              errors.push({ file: p.file, line: f.line, msg: '图片 data URI 的 base64 内容非法' });
            } else if (Buffer.from(b64, 'base64').length === 0) {
              errors.push({ file: p.file, line: f.line, msg: '图片 data URI 解码为空' });
            }
          }
        } else if (src.startsWith('http://') || src.startsWith('https://')) {
          warnings.push({ file: p.file, line: f.line, msg: '外链图片在单文件离线版(file://)下不会显示，建议改用 data: URI' });
        } else {
          warnings.push({ file: p.file, line: f.line, msg: '相对路径图片需放在 public/figs 并构建，离线版可能不显示' });
        }
      }
    }

    // 公式定界符闭合（粗略：跟踪是否在 $ 数学区内）
    const mathText = [stem, answer, solution, get('思路', '解题思路'), get('易错点', '易错', '注意')]
      .filter(Boolean)
      .join('\n');
    if (mathText && !isMathBalanced(mathText)) {
      warnings.push({ file: p.file, line: p.startLine, msg: '公式定界符($ / $$)可能未闭合，请检查' });
    }
  }

  return { errors, warnings, counts: { files: files.length, problems: problems.length } };
}

/** 跟踪 $ 与 $$ 是否配对闭合（不处理转义 \$） */
function isMathBalanced(s) {
  let inMath = false;
  let i = 0;
  while (i < s.length) {
    if (s[i] === '$') {
      if (s[i + 1] === '$') { i += 2; inMath = !inMath; }
      else { i += 1; inMath = !inMath; }
    } else {
      i += 1;
    }
  }
  return !inMath;
}

function formatIssue(kind, issue) {
  const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file;
  return `  ${kind === 'ERROR' ? '❌' : '⚠️'}  ${loc}  ${issue.msg}`;
}

/** CLI 入口 */
function main() {
  const result = validateBank();
  const { errors, warnings, counts } = result;

  console.log('📋 CMC 题库格式校验');
  console.log(`   扫描 ${counts.files} 个文件，解析 ${counts.problems} 道题`);

  if (counts.problems !== 101) {
    console.log(`   ℹ️  当前题数 ${counts.problems}（基准 101，属正常变动请忽略此提示）`);
  }

  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} 个警告：`);
    warnings.forEach((w) => console.log(formatIssue('WARN', w)));
  }

  if (errors.length) {
    console.log(`\n❌  ${errors.length} 个错误：`);
    errors.forEach((e) => console.log(formatIssue('ERROR', e)));
    console.log('\n校验未通过，请修复上述错误后再提交。');
    process.exit(1);
  }

  console.log('\n✅ 校验通过：题库格式合规。');
  process.exit(0);
}

module.exports = { validateBank, KNOWN_FIELDS, VALID_GROUPS };

if (require.main === module) {
  main();
}
