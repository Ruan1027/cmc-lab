/**
 * 云端适配器：在「本地适配器」外层包一层云同步
 *
 * 设计要点：
 *   - 永远先落本地（local 适配器），远端推送是「尽力而为」的异步动作，失败不影响本地
 *   - 是否走云端完全由「当前登录态」在每次调用时动态决定：未登录 / 离线 → 纯本地
 *   - load：拉云端 → 与本地下 LWW 合并 → 写回本地并刷新 store 同步状态
 *   - save：本地落盘后防抖（默认 1.5s）推云端，避免逐次击键都请求
 *   - 离线 / 网络错误 → 退回本地，并标记同步状态，待联网后自动补推
 *
 * 内置 101 题不在同步子集内（见 remote.ts 的 toSyncedPayload），云端只存学习数据 + 导入题。
 */
import type { StorageAdapter } from './types';
import { type PersistedState } from './repository';
import { mergeLWW, toSyncedPayload, type RemoteBackend, type SyncedPayload } from './remote';
import { loadBuiltinProblems } from '../data/bank';
import type { Problem } from '../types';
import { useAuthStore } from '../auth/useAuthStore';

const META_KEY = 'cmc_lab_sync_meta';
interface SyncMeta {
  lastSyncAt: number;
  lastPushAt: number;
}

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw) as SyncMeta;
  } catch {
    /* 忽略 */
  }
  return { lastSyncAt: 0, lastPushAt: 0 };
}
function writeMeta(m: SyncMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    /* 忽略 */
  }
}

export interface CloudDeps {
  local: StorageAdapter;
  /** 为 null 时（未配置 Supabase）整个适配器退化为纯本地 */
  remote: RemoteBackend | null;
  getUserId: () => string | null;
  debounceMs?: number;
}

export class CloudAdapter implements StorageAdapter {
  private local: StorageAdapter;
  private remote: RemoteBackend | null;
  private getUserId: () => string | null;
  private debounceMs: number;
  private builtinIds: Set<string>;
  private builtinProblems: Problem[];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: SyncedPayload | null = null;

  constructor(deps: CloudDeps) {
    this.local = deps.local;
    this.remote = deps.remote;
    this.getUserId = deps.getUserId;
    this.debounceMs = deps.debounceMs ?? 1500;
    const builtin = loadBuiltinProblems();
    this.builtinIds = new Set(builtin.map((p) => p.id));
    this.builtinProblems = builtin;
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') void this.flush();
      });
    }
  }

  async load(): Promise<PersistedState | null> {
    const localState = await this.local.load();
    const userId = this.getUserId();
    if (!userId || !this.remote) return localState; // 未登录 / 未配置 → 纯本地
    try {
      const remote = await this.remote.load(userId);
      const meta = readMeta();
      const { state, adoptedRemote } = mergeLWW(localState, remote, meta.lastSyncAt, this.builtinProblems);
      if (adoptedRemote && remote) {
        await this.local.save(state);
        const ts = Date.parse(remote.updated_at);
        writeMeta({ ...meta, lastSyncAt: ts });
        useAuthStore.getState().setSync('synced', ts);
      }
      return state;
    } catch {
      useAuthStore.getState().setSync('offline');
      return localState; // 网络错误 → 退回本地
    }
  }

  async save(state: PersistedState): Promise<boolean> {
    const ok = await this.local.save(state);
    const userId = this.getUserId();
    if (!userId || !this.remote) return ok; // 未登录 / 未配置 → 不推送
    this.schedulePush(toSyncedPayload(state, this.builtinIds));
    return ok;
  }

  private schedulePush(payload: SyncedPayload): void {
    this.pending = payload;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.pushNow();
    }, this.debounceMs);
    useAuthStore.getState().setSync('syncing');
  }

  /** 立即把待推送内容推上云端（页面隐藏/登出时调用，确保不丢） */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.pushNow();
  }

  /** 把当前完整状态立即上传（老用户迁移：把本地数据推到云端） */
  async uploadCurrent(state: PersistedState): Promise<void> {
    await this.pushNow(toSyncedPayload(state, this.builtinIds));
  }

  private async pushNow(forced?: SyncedPayload): Promise<void> {
    const userId = this.getUserId();
    if (!userId || !this.remote) {
      this.pending = null;
      return;
    }
    const data = forced ?? this.pending;
    if (!data) return;
    this.pending = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      const updatedAt = new Date().toISOString();
      await this.remote.save(userId, data, updatedAt);
      const meta = readMeta();
      const now = Date.now();
      writeMeta({ ...meta, lastSyncAt: now, lastPushAt: now });
      useAuthStore.getState().setSync('synced', now);
    } catch {
      useAuthStore.getState().setSync('error');
      this.pending = data; // 保留，联网后自动补推
      this.timer = setTimeout(() => {
        void this.pushNow();
      }, 5000);
    }
  }

  async clear(): Promise<void> {
    await this.local.clear();
    const userId = this.getUserId();
    if (userId && this.remote) {
      try {
        await this.remote.clear(userId);
      } catch {
        /* 忽略 */
      }
    }
    writeMeta({ lastSyncAt: 0, lastPushAt: 0 });
  }
}
