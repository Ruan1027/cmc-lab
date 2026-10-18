import { useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { USERNAME_HINT, validateUsername } from '../auth/username';

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
 * 登录后的账号管理弹窗（不再承载登录 / 注册 / 注册引导）
 *
 * 登录与注册已拆成独立页面（LoginPage / RegisterPage），本弹窗只在「已登录」时打开，
 * 负责：同步状态查看、立即同步、覆盖上传、退出登录；以及极少数「已登录但缺用户名」
 * 的补设用户名场景。
 *
 * 账号模型：平台身份 = 邮箱，应用层挂一个用户名（accounts 表）。
 */
export function AccountModal({ onClose }: { onClose: () => void }) {
  const auth = useAuthStore();
  const uploadLocalData = useAppStore((s) => s.uploadLocalData);
  const syncNow = useAppStore((s) => s.syncNow);
  const flushCloud = useAppStore((s) => s.flushCloud);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
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

  /** 收尾：重新 hydrate（拉云端合并）再关窗 */
  const finish = async () => {
    await useAppStore.getState().hydrate();
    onClose();
  };

  // ---------- 补设用户名 ----------
  const doClaim = () =>
    run(async () => {
      const badName = validateUsername(claimName);
      if (badName) throw new Error(badName);
      await auth.claimUsername(claimName, '');
      await finish();
    });

  const logout = () =>
    run(async () => {
      // 退出前先把待推送的改动刷上云端，否则最后几秒的操作会丢
      await flushCloud();
      await auth.signOut();
      onClose();
    });

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
