import { useAuthStore } from '../auth/useAuthStore';
import { cloudEnabled } from '../cloud/cloudConfig';

const SYNC: Record<string, { icon: string; text: string; hint: string }> = {
  idle: { icon: '⚪', text: '未同步', hint: '登录并改动任意数据后会自动同步' },
  syncing: { icon: '🔄', text: '同步中', hint: '正在把改动传到云端' },
  synced: { icon: '🟢', text: '已同步', hint: '本机与云端内容一致' },
  offline: { icon: '🟡', text: '离线', hint: '连不上云端，改动已存在本机，联网后自动补传' },
  error: { icon: '🔴', text: '同步失败', hint: '云端拒绝了本次同步，通常是登录状态失效 —— 请重新登录' },
};

function ago(ts: number | null): string {
  if (!ts) return '从未';
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s} 秒前`;
  if (s < 3600) return `${Math.round(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.round(s / 3600)} 小时前`;
  return `${Math.round(s / 86400)} 天前`;
}

/**
 * 顶部同步状态指示：仅在已接入云服务且已登录时显示。
 *
 * 带上「上次同步时间」是刻意的：同步是个看不见的动作，用户没法判断到底成没成，
 * 一旦出问题只能靠猜。给个时间戳，至少能自己确认「刚才那次上去了没有」。
 */
export function SyncIndicator() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.syncStatus);
  const at = useAuthStore((s) => s.lastSyncAt);
  if (!cloudEnabled() || !user) return null;
  const s = SYNC[status] ?? SYNC.idle;
  return (
    <span className="sync-ind" title={`${s.hint}（上次同步：${ago(at)}）`}>
      {s.icon} {s.text}
      <span className="sync-ago"> · {ago(at)}</span>
    </span>
  );
}
