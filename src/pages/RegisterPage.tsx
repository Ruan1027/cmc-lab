/**
 * 注册页（与登录页相互独立）
 *
 * 注册流程：用户名 + 邮箱 → 收验证码 → 设密码 → 建号。
 * 注册成功后触发「老用户迁移引导」：
 *   - 问是不是无账号就用过本应用的老用户
 *   - 是 → 导入之前导出的备份，并立即推云端合并
 *   - 否 / 跳过 → 直接进入主页
 *
 * 页脚提供「已有账号？去登录」返回登录页。
 */
import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEntryStore } from '../store/useEntryStore';
import {
  PASSWORD_MIN,
  USERNAME_HINT,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../auth/username';

export function RegisterPage() {
  const auth = useAuthStore();
  const setEntry = useEntryStore((s) => s.setEntry);
  const restoreBackup = useAppStore((s) => s.restoreBackup);
  const syncNow = useAppStore((s) => s.syncNow);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCode, setRegCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /** 老用户迁移引导：'none' 正常注册视图；'ask' 询问；'import' 导入备份 */
  const [migrate, setMigrate] = useState<'none' | 'ask' | 'import'>('none');
  const [raw, setRaw] = useState('');

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
      await auth.completeRegister(regName, password, regCode);
      // 加载本机可能已有的进度 + 触发首次种子推送，再问是不是老用户
      await useAppStore.getState().hydrate();
      setMigrate('ask');
    });

  const handleBackupFile = (file?: File) => {
    if (!file) return;
    file
      .text()
      .then((t) => setRaw(t))
      .catch(() => setMsg('读取文件失败'));
  };

  const doImportBackup = () =>
    run(async () => {
      if (!raw.trim()) throw new Error('请先选择备份文件或粘贴备份文本');
      if (!confirm('导入会覆盖当前数据，确定继续？')) return;
      restoreBackup(raw);
      // 把导入的数据立即推上云端并拉回合并
      await syncNow();
      setEntry('home');
    });

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-head">
          <h1 className="auth-title">注册账号</h1>
          <p className="auth-sub">创建 CMC Lab 账号，多端同步你的备考进度</p>
        </div>

        {migrate === 'none' && (
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
              <button className="btn btn-pri" type="button" disabled={busy} onClick={() => void doSendCode()}>
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
            {msg && <div className="err">{msg}</div>}
          </form>
        )}

        {migrate === 'ask' && (
          <div className="auth-body">
            <h3>👋 欢迎，{regName}！</h3>
            <p className="hint">
              你以前有没有用过本应用（在线版 / App / 单文件 Release 版），但当时
              <strong>没有账号</strong>？
              <br />
              如果用过，可以从之前的设备导出备份文件，在这里导入并同步到云端，进度不丢。
            </p>
            <button
              className="btn btn-pri"
              type="button"
              disabled={busy}
              onClick={() => setMigrate('import')}
            >
              是，我要导入之前的备份
            </button>
            <button className="btn" type="button" disabled={busy} onClick={() => setEntry('home')}>
              否，我是全新用户
            </button>
          </div>
        )}

        {migrate === 'import' && (
          <div className="auth-body">
            <h3>📥 导入之前的备份</h3>
            <p className="hint">
              选择之前从「题库 → 数据备份与迁移」导出的 .json 文件，或粘贴备份文本。
              导入会<strong>覆盖</strong>当前数据，但正是你想要的旧进度迁移。
            </p>
            <input
              className="inp"
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                handleBackupFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <textarea
              placeholder='也可以粘贴备份 JSON（以 {"version": 开头）'
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            {msg && <div className="err">{msg}</div>}
            <button
              className="btn btn-pri"
              type="button"
              disabled={busy || !raw.trim()}
              onClick={() => void doImportBackup()}
            >
              {busy ? '处理中…' : '导入并同步云端'}
            </button>
            <button className="btn" type="button" disabled={busy} onClick={() => setEntry('home')}>
              跳过
            </button>
          </div>
        )}

        <div className="auth-links">
          <button className="link-btn" type="button" onClick={() => setEntry('login')}>
            已有账号？去登录
          </button>
        </div>
      </div>
    </div>
  );
}
