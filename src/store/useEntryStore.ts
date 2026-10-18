/**
 * 顶层落地页导航（轻量 Zustand store）
 *
 * 三种落地页：
 *   - 'login'    登录页（默认给接入云端的在线版 / App）
 *   - 'register' 注册页（与登录页相互独立）
 *   - 'home'    应用主页（游客免登录可浏览；纯本地 / 单文件版的唯一页）
 *
 * 默认落地页由「是否接入云端」决定：
 *   - 接入云（在线版 / App）→ 默认登录页；游客点「游客访问」即可进主页
 *   - 未接入云（单文件 Release / fork 无配置）→ 没有账号概念，永远直接进主页
 */
import { create } from 'zustand';
import { cloudEnabled } from '../cloud/cloudConfig';

export type Entry = 'login' | 'register' | 'home';

interface EntryState {
  entry: Entry;
  setEntry: (e: Entry) => void;
}

export const useEntryStore = create<EntryState>()((set) => ({
  entry: cloudEnabled() ? 'login' : 'home',
  setEntry: (entry) => set({ entry }),
}));
