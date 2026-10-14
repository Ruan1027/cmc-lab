/** 统计页：总览、薄弱知识点、模块进度、题型/难度/届次正确率 */
import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { moduleProgress, streakDays, weakKnowledgeList } from '../core/stats';
import { problemsOfGroup } from '../core/groups';

function Bar({ label, right, pct }: { label: string; right: string; pct: number }) {
  const color = pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--err)';
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span>{label}</span>
        <span>{right}</span>
      </div>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const TYPE_NAME: Record<string, string> = { choice: '选择题', fill: '填空题', proof: '解答题' };

export function StatsPage() {
  const problems = useAppStore((s) => s.problems);
  const stats = useAppStore((s) => s.stats);
  const history = useAppStore((s) => s.history);
  const settings = useAppStore((s) => s.settings);
  const wrongBook = useAppStore((s) => s.wrongBook);

  const pool = useMemo(() => problemsOfGroup(problems, settings.group), [problems, settings.group]);
  const modules = useMemo(() => moduleProgress(pool, stats, history), [pool, stats, history]);
  const weak = useMemo(() => weakKnowledgeList(stats), [stats]);
  const streak = streakDays(history);
  const rate = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const unmastered = Object.values(wrongBook).filter((m) => !m.mastered).length;

  const pctOf = (b?: { attempts: number; correct: number }) =>
    b && b.attempts ? Math.round((b.correct / b.attempts) * 100) : 0;

  return (
    <div className="card">
      <h2>📊 学习统计</h2>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-num">{stats.attempts}</div>
          <div className="stat-label">总作答</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{rate}%</div>
          <div className="stat-label">总正确率</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{unmastered}</div>
          <div className="stat-label">未掌握错题</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{streak}</div>
          <div className="stat-label">连续打卡（天）</div>
        </div>
      </div>

      <h3>🔴 薄弱知识点（正确率 &lt; 60%）</h3>
      {weak.length === 0 ? (
        <div className="empty">暂无，或练习量不足</div>
      ) : (
        weak
          .slice(0, 10)
          .map((w) => <Bar key={w.k} label={w.k} right={`${w.rate}%（${w.n} 次）`} pct={w.rate} />)
      )}

      <h3 style={{ marginTop: 18 }}>各知识模块</h3>
      {modules.map((m) => (
        <Bar
          key={m.domain}
          label={m.domain}
          right={`${m.done}/${m.total} · ${m.attempts ? Math.round((m.correct / m.attempts) * 100) : 0}%`}
          pct={m.attempts ? Math.round((m.correct / m.attempts) * 100) : 0}
        />
      ))}

      <h3 style={{ marginTop: 18 }}>各题型正确率</h3>
      {Object.keys(stats.byType).map((t) => (
        <Bar
          key={t}
          label={TYPE_NAME[t] || t}
          right={`${stats.byType[t].correct.toFixed(1)}/${stats.byType[t].attempts}`}
          pct={pctOf(stats.byType[t])}
        />
      ))}

      <h3 style={{ marginTop: 18 }}>各难度正确率</h3>
      {Object.keys(stats.byDifficulty)
        .sort((a, b) => Number(a) - Number(b))
        .map((d) => (
          <Bar
            key={d}
            label={`难度 ${d}`}
            right={`${stats.byDifficulty[d].correct.toFixed(1)}/${stats.byDifficulty[d].attempts}`}
            pct={pctOf(stats.byDifficulty[d])}
          />
        ))}

      <h3 style={{ marginTop: 18 }}>各届次正确率</h3>
      {Object.keys(stats.bySource).map((s) => (
        <Bar
          key={s}
          label={s}
          right={`${stats.bySource[s].correct.toFixed(1)}/${stats.bySource[s].attempts}`}
          pct={pctOf(stats.bySource[s])}
        />
      ))}
    </div>
  );
}
