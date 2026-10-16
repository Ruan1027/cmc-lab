// 云同步后端冒烟探针（零依赖，Node >= 18 自带 fetch；无任何密钥，仅公开 publishable key）
// 用途：从 GitHub Actions 等外部网络验证 Supabase 项目可达、表存在且 RLS 生效。
//      本机网络对 *.supabase.co 有 TLS 干扰时，本地跑不了，由 CI 代跑。
const URL_BASE = 'https://evwgvdozjterzgguztan.supabase.co';
const PUB = 'sb_publishable_vT8pkbYic6b_idDSIMQ-Jg_YRLe6Ut-';

let ok = true;
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? '  | ' + detail : ''}`);
  if (!cond) ok = false;
}

const h = await fetch(`${URL_BASE}/auth/v1/health`, { headers: { apikey: PUB } });
check('auth /health 200', h.status === 200, `HTTP ${h.status} ${await h.text()}`);

const r = await fetch(`${URL_BASE}/rest/v1/user_state?select=user_id`, {
  headers: { apikey: PUB },
});
const rows = await r.json().catch(() => null);
check('PostgREST 匿名请求 200', r.status === 200, `HTTP ${r.status}`);
check('RLS 拦截匿名读取（返回空数组）', Array.isArray(rows) && rows.length === 0, JSON.stringify(rows));

// GitHub OAuth 提供方已启用：/authorize 应 302 跳 github.com 且带我们的 client_id
const a = await fetch(
  `${URL_BASE}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent('https://ruan1027.github.io/cmc-lab/')}`,
  { headers: { apikey: PUB }, redirect: 'manual' },
);
const loc = a.headers.get('location') || '';
check('GitHub 登录入口 302 → github.com', a.status === 302 && loc.includes('github.com/login/oauth/authorize'), `HTTP ${a.status} ${loc.slice(0, 90)}`);
check('回调携带我们的 client_id', loc.includes('client_id=Ov23liHWUAiJj6pNkhYe'), loc ? loc.slice(0, 160) : 'no location');

console.log(ok ? '\nRESULT: ALL PASS' : '\nRESULT: HAS FAILURES');
process.exit(ok ? 0 : 1);
