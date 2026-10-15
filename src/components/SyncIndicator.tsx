import { useAuthStore } from '../auth/useAuthStore';
import { getSupabaseConfig, isFileProtocol } from '../storage/supabaseConfig';

const SYNC: Record<string, { icon: string; text: string }> = {
  idle: { icon: '⚪', text: '未同步' },
  syncing: { icon: '🔄', text: '同步中' },
  synced: { icon: '🟢', text: '已同步' },
  offline: { icon: '🟡', text: '离线' },
  error: { icon: '🔴', text: '同步失败' },
};

/** 顶部同步状态指示：仅在已登录且已配置云端时显示 */
export function SyncIndicator() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.syncStatus);
  if (isFileProtocol() || !getSupabaseConfig() || !user) return null;
  const s = SYNC[status] ?? SYNC.idle;
  return (
    <span className="sync-ind" title="云同步状态">
      {s.icon} {s.text}
    </span>
  );
}
