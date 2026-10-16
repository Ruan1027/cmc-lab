/**
 * 云端后端实现（RemoteBackend 的 WorkBuddy 云服务版）
 *
 * 只用到一张表 `user_state`（见 db/schema.sql），一行一个用户：
 *   owner_id  TEXT PRIMARY KEY DEFAULT auth.uid()
 *   payload   JSONB        —— 同步子集（不含内置 101 题，各端本地重建）
 *   updated_at TIMESTAMPTZ —— 供 LWW 判新旧
 *
 * 三条硬规则（照平台契约来，不要绕）：
 *   1. **不手写 `/.cloud/**` 请求**，一律走 SDK 的 `cloud.database`
 *   2. **不在写入时带 owner_id**：它由 `DEFAULT auth.uid()` 决定，RLS 的
 *      `WITH CHECK (owner_id = auth.uid())` 会拒绝任何伪造的 owner
 *   3. 过滤条件里可以用 owner_id（读 / 删），因为 RLS 已经先把可见行限制成自己的
 */
import type { RemoteBackend, RemoteRecord, SyncedPayload } from './remote';
import { getCloud } from '../cloud/sdk';

const TABLE = 'user_state';

interface PgLikeError {
  message?: string;
  code?: string;
}

/**
 * 表构造器的最小形状。
 * SDK 在没有传 `<Database>` 泛型时行类型是 `unknown`，直接写 `.upsert({...})`
 * 会被推成 `never`；这里收窄成「本模块实际用到的那几个方法」，类型与运行时一致。
 */
interface LooseRow {
  owner_id: string;
  payload: SyncedPayload;
  updated_at: string;
}
interface LooseTable {
  select(cols: string): {
    maybeSingle(): PromiseLike<{ data: Partial<LooseRow> | null; error: PgLikeError | null }>;
  };
  upsert(values: Record<string, unknown>): PromiseLike<{ error: PgLikeError | null }>;
  delete(): {
    eq(col: string, val: string): PromiseLike<{ error: PgLikeError | null }>;
  };
}

/** 把 SDK 错误转成带码的 Error，便于上层区分「离线」与「冲突」 */
function wrapError(action: string, error: PgLikeError): Error {
  const code = error.code ? String(error.code) : '';
  // 权限被拒。数据面把 Postgres 的 42501 包成 HTTP 401 且 code 形如 DATABASE_42501，
  // 所以用后缀匹配；PGRST301 是需要登录。
  if (code.endsWith('42501') || code === 'PGRST301') {
    return new Error(`云端${action}被拒绝（${code}）：请确认已登录`);
  }
  return new Error(`云端${action}失败：${error.message ?? '未知错误'}${code ? `（${code}）` : ''}`);
}

function table(): LooseTable {
  const cloud = getCloud();
  if (!cloud) throw new Error('未接入云服务');
  return cloud.database.from(TABLE) as unknown as LooseTable;
}

export function createCloudBackend(): RemoteBackend {
  return {
    async load(): Promise<RemoteRecord | null> {
      // 不加 owner_id 过滤：RLS 已经把可见行限制成「自己的那一行」，
      // 这样也不必假设 session.user.id 与 auth.uid() 完全一致
      const { data, error } = await table().select('payload, updated_at').maybeSingle();
      if (error) throw wrapError('读取', error);
      if (!data) return null;
      return {
        payload: data.payload as SyncedPayload,
        updated_at: String(data.updated_at ?? ''),
      };
    },

    async save(_userId: string, payload: SyncedPayload, updatedAt: string): Promise<void> {
      // upsert：owner_id 是主键 → 冲突时走 update。owner_id 由 DEFAULT auth.uid() 填，
      // 所以这里**不能**显式传 null（会覆盖 DEFAULT 并被 RLS 拒掉）
      const { error } = await table().upsert({
        payload,
        updated_at: updatedAt,
        schema_version: payload.version,
      });
      if (error) throw wrapError('写入', error);
    },

    async clear(): Promise<void> {
      // 先读回自己的 owner_id 再按它删：既避免无 WHERE 的整表删除，
      // 也不依赖 session.user.id 与 auth.uid() 完全一致
      const { data, error } = await table().select('owner_id').maybeSingle();
      if (error) throw wrapError('读取', error);
      if (!data?.owner_id) return;
      const del = await table().delete().eq('owner_id', data.owner_id);
      if (del.error) throw wrapError('清除', del.error);
    },
  };
}
