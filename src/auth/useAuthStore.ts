/**
 * 鉴权状态（Zustand）
 *
 * 账号模型（本期唯一形态）：
 *   平台身份 = **邮箱**（经验证码验证后建号），应用层再挂一个 **用户名** 字典。
 *   注册：用户名 + 邮箱 → 收验证码 → 设密码 → 建号 + 登记用户名
 *   登录：用户名 / 邮箱 + 密码
 *
 * 为什么不做「用户名直接登录」：平台不支持用户名登录，也不存在未经验证的密码注册。
 * 所以用户名的唯一性是**应用层**保证（accounts 表），登录时先用用户名换回邮箱
 * （`fn_login_email`，带口令闸门，防止用户名→邮箱枚举），再走平台的邮箱+密码登录。
 *
 * 口令散列有两份，必须保持同步：
 *   1. 平台侧（真正的身份凭据，登录用）
 *   2. account_secrets.pass_hash（用户名换邮箱时的闸门，bcrypt，仅服务端可读）
 * 有两条路径会改到平台侧口令，改完必须调 `fn_sync_password_hash` 同步闸门：
 *   - 忘记密码（resetPasswordForEmail → updateUser）
 * 这也是为什么本期**不出现**第三方登录（微信 / WorkBuddy 账号）：那类账号没有
 * 邮箱+口令这套锚点，混进来会让「用户名+密码」这条链路直接失效。
 *
 * 本模块只管「用户身份 + 用户名 + 同步状态」，不碰学习数据；数据同步在
 * storage/cloudAdapter 里完成，登录成功后由 App 重新 hydrate（拉云端合并）。
 */
import { create } from 'zustand';
import type { CloudError, CloudSession, PasswordResetChallenge } from '@tencent-ai/workbuddy-cloud-sdk';
import { getCloud } from '../cloud/sdk';
import { cloudEnabled } from '../cloud/cloudConfig';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

/** 发码后要留到验码那一步的状态；不持久化，刷新即失效（需重新发码） */
interface PendingOtp {
  email: string;
  verificationId: string;
  isExistingUser: boolean;
}

interface PendingRegister extends PendingOtp {
  username: string;
}

interface PendingReset {
  email: string;
  challenge: PasswordResetChallenge;
}

const NO_CLOUD = '当前构建未接入云服务（本地版数据保存在本机）';

/** 把 SDK 的 CloudError 转成人话；按 kind 分流，不 match message 文本 */
function authMessage(err: CloudError, fallback: string): string {
  switch (err.kind) {
    case 'network':
      return '网络连接失败，请检查网络后重试';
    case 'rate-limited':
      return '操作过于频繁，请稍后再试';
    case 'credits-exhausted':
      return '云端额度已用尽，请联系管理员';
    case 'backend-unavailable':
      return '服务暂时不可用，请稍后重试';
    case 'unauthenticated':
      return '登录状态已失效，请重新登录';
    default:
      return err.message || fallback;
  }
}

function toUser(session: CloudSession): AuthUser {
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

/** RPC 统一出口：把 SDK 错误变成用户可读的 Error */
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const cloud = getCloud();
  if (!cloud) throw new Error(NO_CLOUD);
  // SDK 里 rpc 已 bind 到底层 PostgREST 客户端，直接取方法引用调用是安全的
  const call = cloud.database.rpc as unknown as (
    name: string,
    params?: Record<string, unknown>,
  ) => PromiseLike<{ data: T; error: CloudError | null }>;
  const { data, error } = await call(fn, args);
  if (error) throw new Error(authMessage(error, `云端调用失败（${fn}）`));
  return data;
}

interface AuthState {
  user: AuthUser | null;
  /** 已登录用户的用户名；null 表示这个账号还没登记用户名 */
  username: string | null;
  ready: boolean;
  syncStatus: SyncStatus;
  lastSyncAt: number | null;
  error: string | null;

  init: () => Promise<void>;
  /** 注册第 1 步：预检用户名 + 发送邮箱验证码 */
  sendRegisterCode: (username: string, email: string) => Promise<void>;
  /** 注册第 2 步：验码建号（新账号同时设密码）+ 登记用户名 */
  completeRegister: (username: string, password: string, code: string) => Promise<void>;
  /** 登录：用户名 或 邮箱 + 密码 */
  signIn: (identifier: string, password: string) => Promise<void>;
  /** 忘记密码：发码 */
  sendResetCode: (email: string) => Promise<void>;
  /** 忘记密码：验码 + 设新密码（并同步用户名登录用的口令闸门） */
  completeReset: (email: string, code: string, newPassword: string) => Promise<void>;
  /** 已登录但还没有用户名时补登记（连带写入口令闸门） */
  claimUsername: (username: string, password: string) => Promise<void>;
  /** 重新读一次当前账号的用户名 */
  refreshUsername: () => Promise<void>;
  signOut: () => Promise<void>;
  setError: (msg: string | null) => void;
  setSync: (status: SyncStatus, lastSyncAt?: number) => void;
  getUserId: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // 发码挑战与重置挑战都是「跨事件要留着」的临时状态，放在闭包里：
  // 它们不该触发组件重渲染，也不该被持久化
  let pendingRegister: PendingRegister | null = null;
  let pendingReset: PendingReset | null = null;

  /** 登录成功后统一收尾：取会话用户 + 读用户名 */
  const adoptSession = async (session: CloudSession): Promise<void> => {
    set({ user: toUser(session), error: null });
    await get().refreshUsername();
  };

  return {
    user: null,
    username: null,
    ready: false,
    syncStatus: 'idle',
    lastSyncAt: null,
    error: null,

    init: async () => {
      const cloud = getCloud();
      if (!cloud) {
        set({ ready: true });
        return;
      }
      try {
        // getSession 会在临近过期时顺手续期，比读本地更可靠
        const { data, error } = await cloud.auth.getSession();
        if (error || !data) {
          // 会话失效只意味着未登录，不是错误状态
          set({ ready: true, user: null, username: null });
          return;
        }
        await adoptSession(data);
        set({ ready: true });
      } catch {
        set({ ready: true });
      }
    },

    sendRegisterCode: async (username, email) => {
      const cloud = getCloud();
      if (!cloud) throw new Error(NO_CLOUD);
      const name = username.trim();
      // 先查用户名：冲突要在这里就告诉用户，别等收到验证码、填完密码才报
      const available = await rpc<boolean>('fn_username_available', { p_username: name });
      if (available !== true) throw new Error('该用户名已存在，请重新设置');

      const sent = await cloud.auth.sendOtp({ email: email.trim() });
      if (sent.error) throw new Error(authMessage(sent.error, '验证码发送失败，请稍后重试'));
      pendingRegister = {
        username: name,
        email: email.trim(),
        verificationId: sent.data.verificationId,
        isExistingUser: sent.data.isExistingUser,
      };
    },

    completeRegister: async (username, password, code) => {
      const cloud = getCloud();
      if (!cloud) throw new Error(NO_CLOUD);
      const pending = pendingRegister;
      if (!pending) throw new Error('请先获取验证码');
      // 邮箱已注册的账号不能再走注册：不展开「该邮箱是否存在」，只引导去登录
      if (pending.isExistingUser) {
        throw new Error('该邮箱已可直接登录，请切换到「登录」');
      }
      const name = username.trim() || pending.username;

      const completed = await cloud.auth.verifyOtp({
        email: pending.email,
        verificationId: pending.verificationId,
        isExistingUser: pending.isExistingUser,
        token: code.trim(),
        // 新账号才设密码（已有账号走不到这里）
        password,
      });
      if (completed.error) throw new Error(authMessage(completed.error, '验证码不正确或已过期'));

      pendingRegister = null;
      set({ user: toUser(completed.data), username: null, error: null });

      // 建号已成功，登记用户名失败也不能把用户踢出去：降级成「补设用户名」
      const result = await rpc<string>('fn_register_account', {
        p_username: name,
        p_email: pending.email,
        p_password: password,
      });
      if (result === 'ok') set({ username: name });
      else if (result === 'username_taken') throw new Error('该用户名已存在，请重新设置');
      else if (result === 'invalid_username') throw new Error('用户名不合法，请重新设置');
      else if (result === 'invalid_password') throw new Error('密码不合法（至少 6 位）');
      else throw new Error('用户名登记失败，请在账号面板里重新设置');
    },

    signIn: async (identifier, password) => {
      const cloud = getCloud();
      if (!cloud) throw new Error(NO_CLOUD);
      const id = identifier.trim();
      if (!id || !password) throw new Error('请输入账号和密码');

      let email = id;
      if (!id.includes('@')) {
        // 用户名 → 邮箱。函数内部用 bcrypt 校验口令，口令不对直接返回 null，
        // 因此不能拿它来枚举「用户名是否存在」
        const resolved = await rpc<string | null>('fn_login_email', {
          p_username: id,
          p_password: password,
        });
        if (!resolved) throw new Error('用户名或密码错误');
        email = resolved;
      }

      const res = await cloud.auth.signInWithPassword({ email, password });
      if (res.error) {
        // 不区分「账号不存在」与「密码错误」，避免账号枚举
        if (res.error.kind === 'unauthenticated' || res.error.kind === 'invalid-request') {
          throw new Error('账号或密码错误');
        }
        throw new Error(authMessage(res.error, '登录失败，请稍后重试'));
      }
      await adoptSession(res.data);
    },

    sendResetCode: async (email) => {
      const cloud = getCloud();
      if (!cloud) throw new Error(NO_CLOUD);
      const started = await cloud.auth.resetPasswordForEmail(email.trim());
      if (started.error) throw new Error(authMessage(started.error, '验证码发送失败，请稍后重试'));
      pendingReset = { email: email.trim(), challenge: started.data };
    },

    completeReset: async (email, code, newPassword) => {
      const pending = pendingReset;
      if (!pending || pending.email !== email.trim()) {
        throw new Error('请先获取验证码');
      }
      const done = await pending.challenge.updateUser({
        nonce: code.trim(),
        password: newPassword,
      });
      if (done.error) throw new Error(authMessage(done.error, '验证码不正确或已过期'));
      pendingReset = null;
      await adoptSession(done.data);
      // 平台侧口令已改，同步用户名登录用的闸门散列；失败不阻断（用户仍可用邮箱登录）
      try {
        await rpc<boolean>('fn_sync_password_hash', { p_password: newPassword });
      } catch {
        /* 忽略 */
      }
    },

    claimUsername: async (username, password) => {
      const user = get().user;
      if (!user) throw new Error('请先登录');
      const name = username.trim();
      const result = await rpc<string>('fn_register_account', {
        p_username: name,
        p_email: user.email ?? '',
        p_password: password,
      });
      if (result === 'ok') {
        set({ username: name });
        return;
      }
      if (result === 'username_taken') throw new Error('该用户名已存在，请重新设置');
      if (result === 'invalid_username') throw new Error('用户名不合法，请重新设置');
      if (result === 'invalid_password') throw new Error('密码不合法（至少 6 位）');
      throw new Error('用户名设置失败，请稍后重试');
    },

    refreshUsername: async () => {
      if (!getCloud()) {
        set({ username: null });
        return;
      }
      try {
        const name = await rpc<string | null>('fn_get_username');
        set({ username: name ?? null });
      } catch {
        set({ username: null });
      }
    },

    signOut: async () => {
      const cloud = getCloud();
      // 断网也要能登出：SDK 保证无论如何都清本地凭据
      if (cloud) await cloud.auth.signOut();
      pendingRegister = null;
      pendingReset = null;
      set({ user: null, username: null, syncStatus: 'idle', lastSyncAt: null, error: null });
    },

    setError: (msg) => set({ error: msg }),

    setSync: (status, lastSyncAt) =>
      set((s) => ({ syncStatus: status, lastSyncAt: lastSyncAt ?? s.lastSyncAt })),

    getUserId: () => get().user?.id ?? null,
  };
});

/** 供 UI 判断「要不要显示账号入口」 */
export function authAvailable(): boolean {
  return cloudEnabled();
}
