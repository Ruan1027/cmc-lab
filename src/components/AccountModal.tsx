import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useAppStore } from '../store/useAppStore';

const SYNC_TEXT: Record<string, string> = {
  idle: '未同步',
  syncing: '同步中…',
  synced: '已同步',
  offline: '离线（仅本地）',
  error: '同步失败，将自动重试',
};

/**
 * 账户 / 云同步弹窗
 * - 未登录：GitHub OAuth（重定向）、邮箱 OTP、手机号 OTP 三种登录方式
 * - 已登录：显示用户、同步状态、「上传本地数据到云端」（老用户迁移）、退出登录
 *
 * 注：微信 / QQ / 平台 UID 账号为 Phase 2，本期未开放。
 */
export function AccountModal({ onClose }: { onClose: () => void }) {
  const auth = useAuthStore();
  const uploadLocalData = useAppStore((s) => s.uploadLocalData);

  const [mode, setMode] = useState<'github' | 'email' | 'phone'>('github');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const doSend = async () => {
    setBusy(true);
    setLocalErr(null);
    try {
      if (mode === 'email') await auth.sendEmailOtp(contact.trim());
      else await auth.sendPhoneOtp(contact.trim());
      setSent(true);
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : '发送失败');
    } finally {
      setBusy(false);
    }
  };

  const doVerify = async () => {
    setBusy(true);
    setLocalErr(null);
    try {
      if (mode === 'email') await auth.verifyEmail(contact.trim(), code.trim());
      else await auth.verifyPhone(contact.trim(), code.trim());
      // 登录成功后重新拉取云端并合并到本地
      await useAppStore.getState().hydrate();
      onClose();
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : '校验失败');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>☁️ 账号与云同步</h2>
          <button className="x" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        {!auth.user ? (
          <div className="auth-body">
            <div className="auth-tabs">
              <button className={mode === 'github' ? 'active' : ''} onClick={() => setMode('github')}>
                GitHub
              </button>
              <button className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>
                邮箱
              </button>
              <button className={mode === 'phone' ? 'active' : ''} onClick={() => setMode('phone')}>
                手机号
              </button>
            </div>

            {mode === 'github' && (
              <div className="auth-pane">
                <p className="hint">使用 GitHub 账号登录，多端数据自动同步。</p>
                <button
                  className="btn btn-pri"
                  onClick={() => void auth.signInWithGithub()}
                  disabled={busy}
                >
                  用 GitHub 登录
                </button>
              </div>
            )}

            {mode !== 'github' && (
              <div className="auth-pane">
                <input
                  className="inp"
                  placeholder={mode === 'email' ? '输入邮箱' : '输入手机号'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                {!sent ? (
                  <button className="btn btn-pri" onClick={() => void doSend()} disabled={busy || !contact}>
                    发送验证码
                  </button>
                ) : (
                  <>
                    <input
                      className="inp"
                      placeholder="输入 6 位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <button className="btn btn-pri" onClick={() => void doVerify()} disabled={busy || !code}>
                      验证并登录
                    </button>
                    <button className="btn ghost" onClick={() => setSent(false)} disabled={busy}>
                      重新发送
                    </button>
                  </>
                )}
              </div>
            )}

            {localErr && <div className="err">{localErr}</div>}
            <p className="hint">
              微信 / QQ / 平台账号为后续阶段支持。
            </p>
          </div>
        ) : (
          <div className="auth-body">
            <div className="acct-info">
              <div>
                已登录：<strong>{auth.user.email ?? auth.user.provider}</strong>
              </div>
              <div className="sync-state">{SYNC_TEXT[auth.syncStatus] ?? ''}</div>
            </div>
            <p className="hint">
              你的做题进度、错题、模考记录会在登录后自动在设备间同步（内置题库不同步，各端本地重建）。
            </p>
            <button className="btn" onClick={() => uploadLocalData()}>
              上传本地数据到云端（合并）
            </button>
            <button className="btn err" onClick={() => void logout()}>
              退出登录
            </button>
            {localErr && <div className="err">{localErr}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
