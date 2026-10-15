/**
 * Supabase 连接配置（零依赖，仅用 fetch 直连其 REST / Auth 端点）
 *
 * 凭证两级来源（env 优先）：
 *   1. 环境变量 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY（Vite 注入，可覆盖默认值）
 *   2. 仓库内公开默认值 —— Supabase 的 URL 与 anon/publishable key 本就是设计为公开的
 *      （每个前端页面都能看到），安全边界是数据库 RLS 行级权限（auth.uid() = user_id），
 *      与密钥保密性无关，因此随仓库分发不构成泄露。
 *
 * file:// 单文件模式：配置虽在，但 selectAdapter 按协议强制本地、账号 UI 按协议隐藏，
 * 单文件版永远纯本地匿名、不触网（见 isFileProtocol 的调用方）。
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/** 公开默认配置（publishable key，公开即设计；泄露风险为零，勿放 service_role） */
const PUBLIC_DEFAULT: SupabaseConfig = {
  url: 'https://evwgvdozjterzgguztan.supabase.co',
  anonKey: 'sb_publishable_vT8pkbYic6b_idDSIMQ-Jg_YRLe6Ut-',
};

/** 读取连接配置；缺失则返回 null（此时云同步不可用，自动回退本地） */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && anonKey) return { url: url.replace(/\/+$/, ''), anonKey };
  return { ...PUBLIC_DEFAULT };
}

/** file:// 单文件协议判断（该环境下云同步 UI 与网络行为全部关闭） */
export function isFileProtocol(): boolean {
  return typeof location !== 'undefined' && location.protocol === 'file:';
}
