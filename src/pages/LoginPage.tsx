/**
 * 登录页（默认落地页之一）
 *
 * 包含：
 *   1) 登录表单（用户名 / 邮箱 + 密码）
 *   2) 下方小字「没有账号？注册一个」→ 跳转独立注册页
 *   3) 再下一行小字「不想注册登录？游客访问」→ 进入应用主页（与直接进入的页面一致）
 *   以及「忘记密码？」子视图（重置密码）。
 *
 * 登录成功后重新 hydrate（拉云端合并）再进入主页。
 * 与注册页相互独立：彼此通过 entry store 跳转，不共用一个弹窗。
 */
import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEntryStore } from '../store/useEntryStore';
import {
  PASSWORD_MIN,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../auth/username';

export function LoginPage() {
  const auth = useAuthStore();
  const setEntry = useEntryStore((s) => s.setEntry);

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpPwd, setFpPwd] = useState('');
  const [fpSent, setFpSent] = useState(false);

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

  const doSignIn = () =>
    run(async () => {
      const badId = identifier.includes('@')
        ? validateEmail(identifier)
        : validateUsername(identifier);
      if (badId) throw new Error(badId);
      const badPwd = validatePassword(password);
      if (badPwd) throw new Error(badPwd);
      await auth.signIn(identifier, password);
      // 拉云端合并：换设备登录同一账号即可看到进度
      await useAppStore.getState().hydrate();
      if (!useAuthStore.getState().username) {
        // 极少触发（用户名+密码登录后理应有用户名）；先放行到主页，由账号面板补设
        setMsg('登录成功，但账号缺少用户名，请在主页右上角「账号」里设置');
      }
      setEntry('home');
    });

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
      await useAppStore.getState().hydrate();
      setEntry('home');
    });

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-head">
          <h1 className="auth-title">CMC Lab</h1>
          <p className="auth-sub">全国大学生数学竞赛备考助手</p>
        </div>

        {mode === 'login' ? (
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
              className="link-btn"
              type="button"
              disabled={busy}
              onClick={() => {
                setMode('forgot');
                setMsg(null);
                setFpSent(false);
                setFpCode('');
                setFpPwd('');
              }}
            >
              忘记密码？
            </button>
            {msg && <div className="err">{msg}</div>}
            <div className="auth-links">
              <button className="link-btn" type="button" onClick={() => setEntry('register')}>
                没有账号？注册一个
              </button>
              <button className="link-btn" type="button" onClick={() => setEntry('home')}>
                不想注册登录？游客访问
              </button>
            </div>
          </form>
        ) : (
          <form
            className="auth-pane"
            onSubmit={(e) => {
              e.preventDefault();
              void doReset();
            }}
          >
            <h3 className="auth-subtitle">重置密码</h3>
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
              <button className="btn btn-pri" type="button" disabled={busy} onClick={() => void doSendReset()}>
                {busy ? '处理中…' : '获取验证码'}
              </button>
            ) : (
              <>
                <input
                  className="inp"
                  placeholder="邮箱收到的验证码"
                  inputMode="numeric"
                  autoComplete="one-time-code"
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
              className="link-btn"
              type="button"
              disabled={busy}
              onClick={() => {
                setMode('login');
                setMsg(null);
              }}
            >
              返回登录
            </button>
            {msg && <div className="err">{msg}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
