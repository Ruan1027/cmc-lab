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
  offline: '离线（改动已存本机，联网后自动补传）',
  error: '同步失败：云端拒绝了请求，请重新登录',
};

/** 「3 分钟前」这种相对时间 —— 同步是个看不见的动作，得让用户能自己确认 */
function syncAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return '刚刚';
  if (s < 3600) return `${Math.round(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.round(s / 3600)} 小时前`;
  return `${Math.round(s / 86400)} 天前`;
}

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
  const syncNow = useAppStore((s) => s.syncNow);
  const flushCloud = useAppStore((s) => s.flushCloud);
  const restoreBackup = useAppStore((s) => s.restoreBackup);

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

  /**
   * 老用户迁移引导：注册成功后触发。
   *   'none'   ：不显示（正常账号视图）
   *   'ask'    ：问是不是「无账号就用过本应用」的老用户
   *   'import' ：提供备份文件上传窗口，导入后同步云端
   */
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
      // 注册成功：先 hydrate（加载本机可能已有的进度 + 触发首次种子推送），
      // 再问是不是「无账号的老用户」，需要导入之前导出的备份。不直接关窗。
      await useAppStore.getState().hydrate();
      setMigrate('ask');
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

  // ---------- 老用户迁移：导入备份并同步云端 ----------
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
      // 老用户迁移的核心目的：把导入的数据立即推上云端并拉回合并
      await syncNow();
      setMigrate('none');
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

        {signedIn && migrate === 'ask' && (
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
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => {
                setMigrate('none');
                onClose();
              }}
            >
              否，我是全新用户
            </button>
          </div>
        )}

        {signedIn && migrate === 'import' && (
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
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => {
                setMigrate('none');
                onClose();
              }}
            >
              跳过
            </button>
          </div>
        )}

        {signedIn && migrate === 'none' && auth.username === null && (
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

        {signedIn && migrate === 'none' && auth.username !== null && (
          <div className="auth-body">
            <div className="acct-info">
              <div>
                已登录：<strong>{auth.username}</strong>
                {auth.user?.email ? <span className="sync-ind">（{auth.user.email}）</span> : null}
              </div>
              <div className="sync-state">
                {SYNC_TEXT[auth.syncStatus] ?? ''}
                {auth.lastSyncAt ? ` · ${syncAgo(auth.lastSyncAt)}` : ''}
              </div>
            </div>
            <p className="hint">
              你的做题进度、错题、模考记录会自动在设备间同步（内置题库不同步，各端本地重建）。
              <br />
              换设备登录同一账号即可看到；<strong>本机已有的进度在首次登录时已自动上传</strong>，
              平时不需要动下面这个按钮。
            </p>
            <button
              className="btn btn-pri"
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await syncNow();
                })
              }
            >
              🔄 立即同步（双向合并）
            </button>
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => {
                // 这个按钮是**覆盖**语义：云端独有的内容会被抹掉。
                // 正常情况下自动同步是「取并集」，不会丢东西，所以必须先讲清楚再执行。
                if (
                  !confirm(
                    '这会以「本机数据」整体覆盖云端，另一台设备上还没同步过来的记录会被清掉。\n\n确定继续？',
                  )
                )
                  return;
                uploadLocalData();
              }}
            >
              以本机数据覆盖云端
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
