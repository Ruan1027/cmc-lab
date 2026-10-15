/**
 * Supabase 后端实现（零依赖，纯 fetch 直连 PostgREST + 行级权限）
 *
 * 只用到一张表 user_state（见 supabase/migrations/0001_user_state.sql），
 * 行级权限（RLS）保证每个用户只能读写自己的那一行。
 *
 * 请求头统一带 anon key，登录后额外带用户 JWT（Authorization: Bearer <access_token>），
 * RLS 即据此放行。fetch 可注入，便于单测用 mock 替代网络。
 */
import type { SupabaseConfig } from './supabaseConfig';
import type { RemoteBackend, RemoteRecord, SyncedPayload } from './remote';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

function authHeaders(config: SupabaseConfig, token: string | null): Record<string, string> {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${token ?? config.anonKey}`,
    'Content-Type': 'application/json',
  };
}

export function createSupabaseBackend(
  config: SupabaseConfig,
  getToken: () => string | null,
  fetchFn: FetchLike = fetch,
): RemoteBackend {
  const base = `${config.url}/rest/v1`;
  const table = 'user_state';

  return {
    async load(userId): Promise<RemoteRecord | null> {
      const res = await fetchFn(
        `${base}/${table}?select=payload,updated_at&user_id=eq.${encodeURIComponent(userId)}`,
        { headers: authHeaders(config, getToken()) },
      );
      if (!res.ok) throw new Error(`Supabase load 失败：${res.status}`);
      const rows = (await res.json()) as Array<{ payload: SyncedPayload; updated_at: string }>;
      if (!rows.length) return null;
      return { payload: rows[0].payload, updated_at: rows[0].updated_at };
    },

    async save(userId, payload, updatedAt): Promise<void> {
      const res = await fetchFn(`${base}/${table}`, {
        method: 'POST',
        headers: {
          ...authHeaders(config, getToken()),
          // user_id 为主键 → 冲突时合并（upsert），return=minimal 不回传整行
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify([
          { user_id: userId, payload, updated_at: updatedAt, schema_version: payload.version },
        ]),
      });
      if (!res.ok) throw new Error(`Supabase save 失败：${res.status}`);
    },

    async clear(userId): Promise<void> {
      const res = await fetchFn(
        `${base}/${table}?user_id=eq.${encodeURIComponent(userId)}`,
        { method: 'DELETE', headers: authHeaders(config, getToken()) },
      );
      if (!res.ok) throw new Error(`Supabase clear 失败：${res.status}`);
    },
  };
}
