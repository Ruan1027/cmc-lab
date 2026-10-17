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
import { emptyState, type PersistedState } from './repository';
import {
  applyPayload,
  buildBuiltinIndex,
  fingerprintPayload,
  mergePayloads,
  toSyncedPayload,
  type BuiltinIndex,
  type RemoteBackend,
  type SyncedPayload,
} from './remote';
import { loadBuiltinProblems } from '../data/bank';
import type { Problem } from '../types';
import { useAuthStore } from '../auth/useAuthStore';

const META_KEY = 'cmc_lab_sync_meta';
interface SyncMeta {
  lastSyncAt: number;
  lastPushAt: number;
  /**
   * 上次「本地与云端内容一致」时的同步子集指纹。
   * 用来判断本地有没有还没推上去的改动 —— 空串表示未知（老数据 / 刚清过）。
   */
  lastRemoteHash: string;
}

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) {
      const m = JSON.parse(raw) as Partial<SyncMeta>;
      // 逐字段兜底：老版本写下的 meta 没有 lastRemoteHash
      return {
        lastSyncAt: m.lastSyncAt ?? 0,
        lastPushAt: m.lastPushAt ?? 0,
        lastRemoteHash: m.lastRemoteHash ?? '',
      };
    }
  } catch {
    /* 忽略 */
  }
  return { lastSyncAt: 0, lastPushAt: 0, lastRemoteHash: '' };
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
  /** 为 null 时（未接入云服务）整个适配器退化为纯本地 */
  remote: RemoteBackend | null;
  getUserId: () => string | null;
  debounceMs?: number;
}

export class CloudAdapter implements StorageAdapter {
  private local: StorageAdapter;
  private remote: RemoteBackend | null;
  private getUserId: () => string | null;
  private debounceMs: number;
  private builtinIndex: BuiltinIndex;
  private builtinProblems: Problem[];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: SyncedPayload | null = null;
  /**
   * 上一次 load 是否把本机数据作为「种子」推上了云端。
   * 给 UI 一次明确反馈用（新账号首次登录时用户最想知道「我的数据上去了吗」）。
   */
  seededOnLastLoad = false;

  constructor(deps: CloudDeps) {
    this.local = deps.local;
    this.remote = deps.remote;
    this.getUserId = deps.getUserId;
    this.debounceMs = deps.debounceMs ?? 1500;
    const builtin = loadBuiltinProblems();
    this.builtinIndex = buildBuiltinIndex(builtin);
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

    // 本机当前的同步子集：种子推送与合并两个分支都要用它，先算一次
    const localPayload = toSyncedPayload(localState ?? emptyState(), this.builtinIndex);
    this.seededOnLastLoad = false;
    try {
      const remote = await this.remote.load(userId);
      const meta = readMeta();

      // ① 云端还没有这个账号的记录 → 把本机数据作为「种子」推上去。
      //    不推的话，「先本地用、后注册」的用户登录后什么都不同步，
      //    必须自己找到「上传本地数据到云端」按钮 —— 这正是我们踩过的坑。
      if (!remote) {
        this.seededOnLastLoad = await this.pushNow(localPayload);
        return localState;
      }

      // ② 有记录 → 合并成并集，两边各自补齐。
      //    这里**不看谁的时间戳新**：学习数据里「更新」不等于「更完整」——
      //    一台刚登录的空设备时间戳最新、内容最空，整包覆盖会把另一台的有效
      //    数据（备考时间、错题、历史）直接抹掉（线上真实事故，2026-10-16）。
      const mergedPayload = mergePayloads(
        localPayload,
        remote.payload,
        meta.lastSyncAt,
        this.builtinIndex,
      );
      const localHash = fingerprintPayload(localPayload);
      const mergedHash = fingerprintPayload(mergedPayload);
      const remoteHash = fingerprintPayload(remote.payload);

      let state = localState ?? emptyState();
      if (mergedHash !== localHash) {
        // 云端带来了本机没有的东西：新设备首次登录，或别的设备新做的题
        state = applyPayload(localState, mergedPayload, this.builtinProblems);
        await this.local.save(state);
      }
      if (mergedHash !== remoteHash) {
        // 本机领先：登出期间做的题、刚导入的备份，或是被空设备冲掉后要补回来
        await this.pushNow(mergedPayload);
      }
      writeMeta({ ...meta, lastSyncAt: Date.now(), lastRemoteHash: mergedHash });
      useAuthStore.getState().setSync('synced', Date.now());
      return state;
    } catch (e) {
      // 「被拒」是身份/权限问题（要重新登录），不是网络问题：两者要分开显示，
      // 否则用户会以为是网络抖动而在原地等重试
      const denied = e instanceof Error && /被拒绝/.test(e.message);
      useAuthStore.getState().setSync(denied ? 'error' : 'offline');
      return localState; // 退回本地
    }
  }

  async save(state: PersistedState): Promise<boolean> {
    const ok = await this.local.save(state);
    const userId = this.getUserId();
    if (!userId || !this.remote) return ok; // 未登录 / 未配置 → 不推送
    this.schedulePush(toSyncedPayload(state, this.builtinIndex));
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

  /**
   * 把当前完整状态**整体覆盖**云端（用户明确要求「以本机为准」时才用）。
   * 返回是否成功，好让 UI 说人话而不是假装成功。
   */
  async uploadCurrent(state: PersistedState): Promise<boolean> {
    return this.pushNow(toSyncedPayload(state, this.builtinIndex));
  }

  /** 把一次推送真正发出去；返回是否成功（失败会保留待推送内容，5s 后重试） */
  private async pushNow(forced?: SyncedPayload): Promise<boolean> {
    const userId = this.getUserId();
    if (!userId || !this.remote) {
      this.pending = null;
      return false;
    }
    const data = forced ?? this.pending;
    if (!data) return false;
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
      // 推送成功 = 此刻本地与云端一致，记下指纹供下次 load 判断
      writeMeta({
        ...meta,
        lastSyncAt: now,
        lastPushAt: now,
        lastRemoteHash: fingerprintPayload(data),
      });
      useAuthStore.getState().setSync('synced', now);
      return true;
    } catch {
      useAuthStore.getState().setSync('error');
      this.pending = data; // 保留，联网后自动补推
      this.timer = setTimeout(() => {
        void this.pushNow();
      }, 5000);
      return false;
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
    writeMeta({ lastSyncAt: 0, lastPushAt: 0, lastRemoteHash: '' });
  }
}
