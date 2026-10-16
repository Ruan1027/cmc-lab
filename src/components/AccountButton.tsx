import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { cloudEnabled } from '../cloud/cloudConfig';
import { AccountModal } from './AccountModal';

/**
 * 右上角账户入口：file:// 单文件版 / 未接入云服务的构建里整块隐藏。
 * 在线版 / App 显示，点开为登录或同步管理弹窗。
 */
export function AccountButton() {
  const username = useAuthStore((s) => s.username);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  if (!cloudEnabled()) return null;

  const label = username ?? user?.email ?? '已登录';

  return (
    <>
      <button className="account-chip" onClick={() => setOpen(true)}>
        {user ? `👤 ${label}` : '☁️ 登录/同步'}
      </button>
      {open && <AccountModal onClose={() => setOpen(false)} />}
    </>
  );
}
