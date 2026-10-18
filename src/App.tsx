import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './auth/useAuthStore';
import { PracticePage } from './pages/PracticePage';
import { WrongPage } from './pages/WrongPage';
import { StatsPage } from './pages/StatsPage';
import { PlanPage } from './pages/PlanPage';
import { ExamPage } from './pages/ExamPage';
import { FormulaPage } from './pages/FormulaPage';
import { BankPage } from './pages/BankPage';
import { NewsPage } from './pages/NewsPage';
import { ReportPage } from './pages/ReportPage';
import { PwaInstall } from './components/PwaInstall';
import { AccountButton } from './components/AccountButton';
import { SyncIndicator } from './components/SyncIndicator';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useEntryStore } from './store/useEntryStore';

type PageKey =
  | 'practice'
  | 'plan'
  | 'exam'
  | 'wrong'
  | 'stats'
  | 'formula'
  | 'news'
  | 'bank'
  | 'report';

const PAGES: Array<{ key: PageKey; icon: string; label: string; Component: () => JSX.Element }> = [
  { key: 'plan', icon: '🎯', label: '备考', Component: PlanPage },
  { key: 'practice', icon: '📝', label: '练习', Component: PracticePage },
  { key: 'exam', icon: '⏱', label: '模考', Component: ExamPage },
  { key: 'wrong', icon: '❌', label: '错题', Component: WrongPage },
  { key: 'stats', icon: '📊', label: '统计', Component: StatsPage },
  { key: 'report', icon: '📄', label: '报告', Component: ReportPage },
  { key: 'formula', icon: '📖', label: '手册', Component: FormulaPage },
  { key: 'news', icon: '📢', label: '资讯', Component: NewsPage },
  { key: 'bank', icon: '📥', label: '题库', Component: BankPage },
];

export function App() {
  const [page, setPage] = useState<PageKey>('plan');
  const hydrated = useAppStore((s) => s.hydrated);
  const toast = useAppStore((s) => s.toast);
  const problems = useAppStore((s) => s.problems);
  const entry = useEntryStore((s) => s.entry);
  const setEntry = useEntryStore((s) => s.setEntry);

  // 先初始化鉴权（恢复会话 / 处理 GitHub 回调），再 hydrate 拉取云端合并。
  // 已登录的回访用户直接进主页，不必再看登录页；游客保持默认登录页。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await useAuthStore.getState().init();
      if (!cancelled && useAuthStore.getState().user) setEntry('home');
      if (!cancelled) await useAppStore.getState().hydrate();
    })();
    return () => {
      cancelled = true;
    };
  }, [setEntry]);

  const Current = PAGES.find((p) => p.key === page)?.Component ?? PracticePage;

  // 落地页：登录页 / 注册页独立于主页，游客免登录可浏览主页
  if (entry === 'login') return <LoginPage />;
  if (entry === 'register') return <RegisterPage />;

  return (
    <div className="app">
      <PwaInstall />
      <div className="brand">
        <div>
          <h1>CMC Lab</h1>
          <div className="sub">全国大学生数学竞赛备考助手 · {problems.length} 题</div>
        </div>
        <nav className="nav-top">
          {PAGES.map((p) => (
            <button
              key={p.key}
              className={page === p.key ? 'active' : ''}
              onClick={() => setPage(p.key)}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </nav>
        <div className="brand-right">
          <SyncIndicator />
          <AccountButton />
        </div>
      </div>

      {hydrated ? (
        <Current />
      ) : (
        <div className="card">
          <div className="empty">加载中…</div>
        </div>
      )}

      <nav className="tabbar">
        <div className="tabbar-inner">
          {PAGES.map((p) => (
            <button
              key={p.key}
              className={page === p.key ? 'active' : ''}
              onClick={() => setPage(p.key)}
            >
              <span className="ico">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
