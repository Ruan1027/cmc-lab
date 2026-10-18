import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { cloudEnabled } from '../cloud/cloudConfig';
import { useEntryStore } from '../store/useEntryStore';
import { AccountModal } from './AccountModal';

/**
 * 右上角账户入口：
 *   - 未接入云端（单文件 / fork）→ 整块隐藏，没有登录概念
 *   - 已登录 → 账户 chip，点开为账号管理弹窗
 *   - 游客（未登录）→ 提供「登录」「注册」两个入口，便于后续登录或注册
 */
export function AccountButton() {
  const username = useAuthStore((s) => s.username);
  const user = useAuthStore((s) => s.user);
  const setEntry = useEntryStore((s) => s.setEntry);
  const [open, setOpen] = useState(false);

  if (!cloudEnabled()) return null;

  if (user) {
    const label = username ?? user.email ?? '已登录';
    return (
      <>
        <button className="account-chip" onClick={() => setOpen(true)}>
          {`👤 ${label}`}
        </button>
        {open && <AccountModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button className="account-chip" onClick={() => setEntry('login')}>
        登录
      </button>
      <button className="account-chip" onClick={() => setEntry('register')}>
        注册
      </button>
    </>
  );
}
