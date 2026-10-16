import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import {
  PASSWORD_MIN,
  USERNAME_HINT,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../auth/username';

const SYNC_TEXT: Record<string, string> = {
  idle: '未同步',
  syncing: '同步中…',
  synced: '已同步',
  offline: '离线（仅本地）',
  error: '同步失败，将自动重试',
};

/**
 * 账户 / 云同步弹窗
 *
 * 账号模型：
 *   注册：用户名 + 邮箱 → 收验证码 → 填密码 → 建号（平台身份 = 邮箱）+ 登记用户名
 *   登录：用户名 或 邮箱 + 密码
 *
 * 平台不支持用户名登录，也不存在未经验证的密码注册，所以用户名唯一性是**应用层**
 * 保证的（accounts 表）；登录时先用用户名换回邮箱，再走平台的邮箱+密码登录。
 *
 * 四种视图：
 *   - 未登录：登录 / 注册 双 Tab（登录 Tab 可切「忘记密码」）
 *   - 已登录但没用户名：补设用户名（正常流程不会出现，注册中途断了才会）
 *   - 已登录：账号信息 + 同步状态 + 上传本地数据 + 退出登录
 */
export function AccountModal({ onClose }: { onClose: () => void }) {
  const auth = useAuthStore();
  const uploadLocalData = useAppStore((s) => s.uploadLocalData);
  const flushCloud = useAppStore((s) => s.flushCloud);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  /** 最近一次提交过的口令：建号成功但用户名没登记上时，补设用户名要用它写口令闸门 */
  const [secret, setSecret] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCode, setRegCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpPwd, setFpPwd] = useState('');
  const [fpSent, setFpSent] = useState(false);

  const [claimName, setClaimName] = useState('');

  const run = async (fn: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  /** 登录成功后的统一收尾：重新 hydrate（拉云端合并）再关窗 */
  const finish = async () => {
    await useAppStore.getState().hydrate();
    onClose();
  };

  // ---------- 登录 ----------
  const doSignIn = () =>
    run(async () => {
      const badId = identifier.includes('@')
        ? validateEmail(identifier)
        : validateUsername(identifier);
      if (badId) throw new Error(badId);
      const badPwd = validatePassword(password);
      if (badPwd) throw new Error(badPwd);
      setSecret(password);
      await auth.signIn(identifier, password);
      if (!useAuthStore.getState().username) {
        setClaimName(identifier.includes('@') ? '' : identifier.trim());
        setMsg('这个账号还没有设置用户名，请先设置一个');
        return;
      }
      await finish();
    });

  // ---------- 注册 ----------
  const doSendCode = () =>
    run(async () => {
      const badName = validateUsername(regName);
      if (badName) throw new Error(badName);
      const badMail = validateEmail(regEmail);
      if (badMail) throw new Error(badMail);
      await auth.sendRegisterCode(regName, regEmail);
      setCodeSent(true);
    });

  const doRegister = () =>
    run(async () => {
      if (!regCode.trim()) throw new Error('请输入邮箱收到的验证码');
      const badPwd = validatePassword(password);
      if (badPwd) throw new Error(badPwd);
      setSecret(password);
      await auth.completeRegister(regName, password, regCode);
      await finish();
    });

  // ---------- 忘记密码 ----------
  const doSendReset = () =>
    run(async () => {
      const badMail = validateEmail(fpEmail);
      if (badMail) throw new Error(badMail);
      await auth.sendResetCode(fpEmail);
      setFpSent(true);
    });

  const doReset = () =>
    run(async () => {
      if (!fpCode.trim()) throw new Error('请输入邮箱收到的验证码');
      const badPwd = validatePassword(fpPwd);
      if (badPwd) throw new Error(badPwd);
      await auth.completeReset(fpEmail, fpCode, fpPwd);
      await finish();
    });

  // ---------- 补设用户名 ----------
  const doClaim = () =>
    run(async () => {
      const badName = validateUsername(claimName);
      if (badName) throw new Error(badName);
      if (!secret) throw new Error('请重新登录后再设置用户名');
      await auth.claimUsername(claimName, secret);
      await finish();
    });

  const logout = () =>
    run(async () => {
      // 退出前先把待推送的改动刷上云端，否则最后几秒的操作会丢
      await flushCloud();
      await auth.signOut();
      onClose();
    });

  const switchTab = (next: 'login' | 'register') => {
    setTab(next);
    setForgot(false);
    setCodeSent(false);
    setMsg(null);
  };

  const signedIn = !!auth.user;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>☁️ 账号与云同步</h2>
          <button className="x" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        {!signedIn && !forgot && (
          <div className="auth-body">
            <div className="auth-tabs">
              <button
                type="button"
                className={tab === 'login' ? 'active' : ''}
                onClick={() => switchTab('login')}
              >
                登录
              </button>
              <button
                type="button"
                className={tab === 'register' ? 'active' : ''}
                onClick={() => switchTab('register')}
              >
                注册
              </button>
            </div>

            {tab === 'login' ? (
              <form
                className="auth-pane"
                onSubmit={(e) => {
                  e.preventDefault();
                  void doSignIn();
                }}
              >
                <input
                  className="inp"
                  placeholder="用户名 或 邮箱"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <input
                  className="inp"
                  type="password"
                  placeholder="密码"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn btn-pri" type="submit" disabled={busy}>
                  {busy ? '处理中…' : '登录'}
                </button>
                <button
                  className="btn"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setForgot(true);
                    setMsg(null);
                  }}
                >
                  忘记密码？
                </button>
              </form>
            ) : (
              <form
                className="auth-pane"
                onSubmit={(e) => {
                  e.preventDefault();
                  void doRegister();
                }}
              >
                <input
                  className="inp"
                  placeholder="设置用户名"
                  value={regName}
                  disabled={codeSent}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  className="inp"
                  type="email"
                  placeholder="邮箱（用于收验证码）"
                  autoComplete="email"
                  value={regEmail}
                  disabled={codeSent}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <p className="hint">
                  用户名{USERNAME_HINT}，全站唯一；邮箱是你的账号凭据，请填常用邮箱。
                </p>

                {!codeSent ? (
                  <button
                    className="btn btn-pri"
                    type="button"
                    disabled={busy}
                    onClick={() => void doSendCode()}
                  >
                    {busy ? '处理中…' : '获取验证码'}
                  </button>
                ) : (
                  <>
                    <input
                      className="inp"
                      placeholder="邮箱收到的验证码"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                    />
                    <input
                      className="inp"
                      type="password"
                      placeholder={`设置密码（至少 ${PASSWORD_MIN} 位）`}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-pri" type="submit" disabled={busy}>
                      {busy ? '处理中…' : '注册并登录'}
                    </button>
                    <button
                      className="btn"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setCodeSent(false);
                        setRegCode('');
                        setMsg(null);
                      }}
                    >
                      换邮箱 / 重新发送
                    </button>
                  </>
                )}
              </form>
            )}

            {msg && <div className="err">{msg}</div>}
          </div>
        )}

        {!signedIn && forgot && (
          <div className="auth-body">
            <h3>重置密码</h3>
            <form
              className="auth-pane"
              onSubmit={(e) => {
                e.preventDefault();
                void doReset();
              }}
            >
              <input
                className="inp"
                type="email"
                placeholder="注册时用的邮箱"
                autoComplete="email"
                value={fpEmail}
                disabled={fpSent}
                onChange={(e) => setFpEmail(e.target.value)}
              />
              {!fpSent ? (
                <button
                  className="btn btn-pri"
                  type="button"
                  disabled={busy}
                  onClick={() => void doSendReset()}
                >
                  {busy ? '处理中…' : '获取验证码'}
                </button>
              ) : (
                <>
                  <input
                    className="inp"
                    placeholder="邮箱收到的验证码"
                    inputMode="numeric"
                    value={fpCode}
                    onChange={(e) => setFpCode(e.target.value)}
                  />
                  <input
                    className="inp"
                    type="password"
                    placeholder={`新密码（至少 ${PASSWORD_MIN} 位）`}
                    autoComplete="new-password"
                    value={fpPwd}
                    onChange={(e) => setFpPwd(e.target.value)}
                  />
                  <button className="btn btn-pri" type="submit" disabled={busy}>
                    {busy ? '处理中…' : '重置并登录'}
                  </button>
                </>
              )}
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={() => {
                  setForgot(false);
                  setFpSent(false);
                  setFpCode('');
                  setMsg(null);
                }}
              >
                返回登录
              </button>
            </form>
            {msg && <div className="err">{msg}</div>}
          </div>
        )}

        {signedIn && auth.username === null && (
          <div className="auth-body">
            <div className="acct-info">
              <div>
                账号：<strong>{auth.user?.email ?? auth.user?.id}</strong>
              </div>
              <div className="sync-state">这个账号还没有用户名</div>
            </div>
            <form
              className="auth-pane"
              onSubmit={(e) => {
                e.preventDefault();
                void doClaim();
              }}
            >
              <input
                className="inp"
                placeholder="设置用户名"
                value={claimName}
                onChange={(e) => setClaimName(e.target.value)}
              />
              <p className="hint">用户名{USERNAME_HINT}，设置后即可用它登录。</p>
              <button className="btn btn-pri" type="submit" disabled={busy}>
                {busy ? '处理中…' : '设置用户名'}
              </button>
            </form>
            {msg && <div className="err">{msg}</div>}
          </div>
        )}

        {signedIn && auth.username !== null && (
          <div className="auth-body">
            <div className="acct-info">
              <div>
                已登录：<strong>{auth.username}</strong>
                {auth.user?.email ? <span className="sync-ind">（{auth.user.email}）</span> : null}
              </div>
              <div className="sync-state">{SYNC_TEXT[auth.syncStatus] ?? ''}</div>
            </div>
            <p className="hint">
              你的做题进度、错题、模考记录会在登录后自动在设备间同步（内置题库不同步，各端本地重建）。
            </p>
            <button className="btn" type="button" disabled={busy} onClick={() => uploadLocalData()}>
              上传本地数据到云端（合并）
            </button>
            <button
              className="btn btn-err"
              type="button"
              disabled={busy}
              onClick={() => void logout()}
            >
              退出登录
            </button>
            {msg && <div className="err">{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
