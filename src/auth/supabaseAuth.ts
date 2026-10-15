/**
 * 鉴权（零依赖实现，直接打 Supabase Auth 端点）
 *
 * Phase 1 支持三种方式：
 *   - GitHub：OAuth2 PKCE 重定向（你已在用 GitHub，最省事）
 *   - 邮箱：发送 6 位验证码（OTP），回填后校验
 *   - 手机号：发送短信验证码（OTP），回填后校验
 * 微信 / QQ / 平台 UID 账号为 Phase 2（需微信开放平台 / QQ 互联或 Authing 联邦）。
 *
 * 不依赖 @supabase/supabase-js（本机 npm 镜像不全），所有请求用 fetch 直连，
 * fetch 可注入以便单测。session 仅存于 localStorage，不入库。
 */
import type { SupabaseConfig } from '../storage/supabaseConfig';

export type AuthProvider = 'github' | 'email' | 'phone';

export interface AuthUser {
  id: string;
  provider: AuthProvider;
  email?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  expires_at?: number;
}

const SESSION_KEY = 'cmc_lab_auth';
const OAUTH_STATE_KEY = 'cmc_oauth_state';
const OAUTH_VERIFIER_KEY = 'cmc_oauth_verifier';

// ---------- 存储 session ----------
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
export function saveSession(s: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* 忽略 */
  }
}
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* 忽略 */
  }
}

// ---------- PKCE / 随机值工具 ----------
function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function randomUrlSafe(n: number): string {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
}
async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return base64UrlEncode(new Uint8Array(digest));
}

// ---------- GitHub OAuth（PKCE 重定向） ----------
export async function startGithubOAuth(config: SupabaseConfig): Promise<void> {
  const verifier = randomUrlSafe(64);
  const challenge = await sha256Base64Url(verifier);
  const state = randomUrlSafe(16);
  sessionStorage.setItem(OAUTH_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  const params = new URLSearchParams({
    provider: 'github',
    redirect_to: location.origin + location.pathname,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });
  location.href = `${config.url}/auth/v1/authorize?${params.toString()}`;
}

export async function handleGithubCallback(
  config: SupabaseConfig,
  fetchFn: typeof fetch = fetch,
): Promise<Session | null> {
  const url = new URL(location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) return null;
  const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  const verifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);
  // 清理 URL，避免刷新页面重复兑换
  history.replaceState({}, '', location.pathname);
  if (!savedState || !verifier || state !== savedState) {
    throw new Error('OAuth 状态校验失败，请重试登录');
  }
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_VERIFIER_KEY);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: location.origin + location.pathname,
  });
  const res = await fetchFn(`${config.url}/auth/v1/token?${body.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
  });
  if (!res.ok) throw new Error('GitHub 登录兑换失败');
  const data = await res.json();
  const session: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: { id: data.user.id, email: data.user.email, provider: 'github' },
    expires_at: data.expires_at,
  };
  saveSession(session);
  return session;
}

// ---------- 邮箱 / 手机号 OTP ----------
export async function sendOtp(
  config: SupabaseConfig,
  contact: { email?: string; phone?: string },
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const res = await fetchFn(`${config.url}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
    body: JSON.stringify({ ...contact, create_user: true }),
  });
  if (!res.ok) throw new Error('验证码发送失败，请确认信息或稍后重试');
}

export async function verifyOtp(
  config: SupabaseConfig,
  type: 'otp' | 'sms',
  contact: { email?: string; phone?: string },
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<Session> {
  const res = await fetchFn(`${config.url}/auth/v1/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
    body: JSON.stringify({ type, ...contact, token }),
  });
  if (!res.ok) throw new Error('验证码错误');
  const data = await res.json();
  const provider: AuthProvider = contact.email ? 'email' : 'phone';
  const session: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: { id: data.user.id, email: data.user.email, provider },
    expires_at: data.expires_at,
  };
  saveSession(session);
  return session;
}
