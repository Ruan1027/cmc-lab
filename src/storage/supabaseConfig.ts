/**
 * Supabase 连接配置（零依赖，仅用 fetch 直连其 REST / Auth 端点）
 *
 * 凭证来自环境变量（Vite 注入 import.meta.env），绝不写进仓库：
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 * 本地把 .env.example 复制为 .env 填写；CI / 部署平台配置同名变量即可。
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/** 读取连接配置；缺失则返回 null（此时云同步不可用，自动回退本地） */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/+$/, ''), anonKey };
}
