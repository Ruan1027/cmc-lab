/**
 * 云服务数据面冒烟探针（零依赖，Node >= 18 自带 fetch）
 *
 * 用**公开** publishable key 打真实数据面，逐条验证「匿名该通的通、该拒的拒」。
 * 只需要 cloud.config.json（或环境变量 CMC_CLOUD_ENDPOINT / CMC_CLOUD_KEY），
 * 不需要任何账号、不发验证码、不写业务数据。
 *
 * 用法：
 *   node scripts/e2e-cloud.mjs
 *   CMC_CLOUD_ENDPOINT=https://x.app.workbuddy.host CMC_CLOUD_KEY=wbpk_... node scripts/e2e-cloud.mjs
 *
 * 能验的：域名可达、publishable key 被接受、匿名可调的函数存在且行为正确、
 *         三个受保护对象（accounts / account_secrets / user_state）对匿名全拒。
 * 不能验的：登录后的路径 —— 那条链路必须有真会话，只能由真人在发布域名上走一遍。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const envEndpoint = process.env.CMC_CLOUD_ENDPOINT;
  const envKey = process.env.CMC_CLOUD_KEY;
  if (envEndpoint && envKey) {
    return { endpoint: String(envEndpoint).replace(/\/+$/, ''), publishableKey: envKey };
  }
  const file = path.resolve(here, '../cloud.config.json');
  if (!fs.existsSync(file)) {
    console.error('找不到 cloud.config.json，也没有 CMC_CLOUD_ENDPOINT / CMC_CLOUD_KEY 环境变量');
    process.exit(2);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { endpoint: String(raw.endpoint).replace(/\/+$/, ''), publishableKey: String(raw.publishableKey) };
}

const cfg = loadConfig();
const base = `${cfg.endpoint}/.cloud/database/rest`;
const headers = {
  'x-wb-webapp-access-key': cfg.publishableKey,
  'Content-Type': 'application/json',
  // 服务端按 Origin 精确匹配放行，这里模拟真实浏览器来源
  Origin: cfg.endpoint,
};

let ok = true;
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? `  | ${detail}` : ''}`);
  if (!cond) ok = false;
}

async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* 非 JSON 响应 */
  }
  return { status: res.status, text, json };
}

// ---------- 匿名该通的 ----------
const rpcAvailable = await call('POST', `${base}/rpc/fn_username_available`, {
  p_username: 'probe_user_xyz',
});
check(
  '匿名可调 fn_username_available → true',
  rpcAvailable.status === 200 && rpcAvailable.json === true,
  `HTTP ${rpcAvailable.status} ${rpcAvailable.text.slice(0, 80)}`,
);

const rpcBadName = await call('POST', `${base}/rpc/fn_username_available`, { p_username: 'a' });
check(
  '非法用户名 → false（函数自带格式校验）',
  rpcBadName.status === 200 && rpcBadName.json === false,
  `HTTP ${rpcBadName.status} ${rpcBadName.text.slice(0, 80)}`,
);

const rpcLogin = await call('POST', `${base}/rpc/fn_login_email`, {
  p_username: 'nobody_should_exist_xyz',
  p_password: 'definitely-wrong',
});
check(
  '匿名 fn_login_email 口令不对 → null（不泄露用户名是否存在）',
  rpcLogin.status === 200 && rpcLogin.json === null,
  `HTTP ${rpcLogin.status} ${rpcLogin.text.slice(0, 80)}`,
);

// ---------- 匿名该拒的 ----------
const denied = [
  [
    'fn_register_account（仅登录用户可调）',
    'POST',
    `${base}/rpc/fn_register_account`,
    { p_username: 'x_1', p_email: 'a@b.com', p_password: '123456' },
  ],
  ['fn_get_username（仅登录用户可调）', 'POST', `${base}/rpc/fn_get_username`, {}],
  ['fn_sync_password_hash（仅登录用户可调）', 'POST', `${base}/rpc/fn_sync_password_hash`, { p_password: '123456' }],
  ['读 user_state', 'GET', `${base}/user_state?select=owner_id`, undefined],
  ['写 user_state', 'POST', `${base}/user_state`, { payload: {} }],
  ['读 accounts', 'GET', `${base}/accounts?select=username`, undefined],
  ['读 account_secrets', 'GET', `${base}/account_secrets?select=email`, undefined],
];

for (const [name, method, url, body] of denied) {
  const r = await call(method, url, body);
  const code = r.json?.code ?? '';
  check(
    `匿名被拒：${name}`,
    r.status >= 400 && String(code).includes('42501'),
    `HTTP ${r.status} ${r.text.slice(0, 80)}`,
  );
}

console.log(ok ? '\nRESULT: ALL PASS' : '\nRESULT: HAS FAILURES');
process.exit(ok ? 0 : 1);
