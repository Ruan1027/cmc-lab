/**
 * 鉴权状态（Zustand）
 *
 * 只管「用户身份 + 同步状态」，不碰具体数据；数据同步在 storage/cloudAdapter 里完成。
 * 云同步的触发点：登录成功后由 App 重新 hydrate（拉云端合并）。
 */
import { create } from 'zustand';
import { getSupabaseConfig } from '../storage/supabaseConfig';
import {
  clearSession,
  handleGithubCallback,
  loadSession,
  saveSession,
  sendOtp,
  startGithubOAuth,
  verifyOtp,
  type AuthUser,
  type Session,
} from './supabaseAuth';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  ready: boolean;
  syncStatus: SyncStatus;
  lastSyncAt: number | null;
  error: string | null;

  init: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhone: (phone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;

  setSync: (status: SyncStatus, lastSyncAt?: number) => void;
  getAccessToken: () => string | null;
  getUserId: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  ready: false,
  syncStatus: 'idle',
  lastSyncAt: null,
  error: null,

  init: async () => {
    const config = getSupabaseConfig();
    // 先恢复已存会话
    const existing = loadSession();
    if (existing) {
      set({ user: existing.user, session: existing, ready: true });
    } else {
      set({ ready: true });
    }
    // 处理 GitHub OAuth 回调（URL 上带 code）
    if (config) {
      try {
        const cb = await handleGithubCallback(config);
        if (cb) {
          set({ user: cb.user, session: cb, ready: true });
          saveSession(cb);
        }
      } catch (e) {
        set({ error: e instanceof Error ? e.message : '登录回调处理失败' });
      }
    }
  },

  signInWithGithub: async () => {
    const config = getSupabaseConfig();
    if (!config) throw new Error('未配置云同步（缺少 Supabase 环境变量）');
    set({ error: null });
    await startGithubOAuth(config);
  },

  sendEmailOtp: async (email: string) => {
    const config = getSupabaseConfig();
    if (!config) throw new Error('未配置云同步（缺少 Supabase 环境变量）');
    set({ error: null });
    await sendOtp(config, { email });
  },

  verifyEmail: async (email: string, code: string) => {
    const config = getSupabaseConfig();
    if (!config) throw new Error('未配置云同步');
    const s = await verifyOtp(config, 'otp', { email }, code);
    set({ user: s.user, session: s, error: null });
  },

  sendPhoneOtp: async (phone: string) => {
    const config = getSupabaseConfig();
    if (!config) throw new Error('未配置云同步（缺少 Supabase 环境变量）');
    set({ error: null });
    await sendOtp(config, { phone });
  },

  verifyPhone: async (phone: string, code: string) => {
    const config = getSupabaseConfig();
    if (!config) throw new Error('未配置云同步');
    const s = await verifyOtp(config, 'sms', { phone }, code);
    set({ user: s.user, session: s, error: null });
  },

  signOut: async () => {
    clearSession();
    set({ user: null, session: null, syncStatus: 'idle', lastSyncAt: null });
  },

  setSync: (status, lastSyncAt) =>
    set((s) => ({ syncStatus: status, lastSyncAt: lastSyncAt ?? s.lastSyncAt })),

  getAccessToken: () => get().session?.access_token ?? null,
  getUserId: () => get().user?.id ?? null,
}));
