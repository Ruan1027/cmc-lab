import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { getSupabaseConfig, isFileProtocol } from '../storage/supabaseConfig';
import { AccountModal } from './AccountModal';

/**
 * 右上角账户入口：file:// 单文件版（或未配置云端）时整块隐藏。
 * 在线版 / App 显示，点开为登录或同步管理弹窗。
 */
export function AccountButton() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  if (isFileProtocol() || !getSupabaseConfig()) return null;

  return (
    <>
      <button className="account-chip" onClick={() => setOpen(true)}>
        {user ? `👤 ${user.email ?? user.provider}` : '☁️ 登录/同步'}
      </button>
      {open && <AccountModal onClose={() => setOpen(false)} />}
    </>
  );
}
