/** 错题本：按最近错误排序，支持重做、标记掌握、查看错因 */
import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { domainOf } from '../core/knowledge';
import { pitfallsFor } from '../core/pitfalls';

const REASON_LABEL: Record<string, string> = {
  calc: '算错',
  method: '方法不会',
  careless: '看错题',
  time: '时间不够',
};

export function WrongPage() {
  const problems = useAppStore((s) => s.problems);
  const wrongBook = useAppStore((s) => s.wrongBook);
  const markMastered = useAppStore((s) => s.markMastered);
  const startSession = useAppStore((s) => s.startSession);
  const [showMastered, setShowMastered] = useState(false);

  const entries = useMemo(
    () =>
      Object.entries(wrongBook)
        .filter(([, m]) => (showMastered ? true : !m.mastered))
        .sort((a, b) => b[1].lastWrong - a[1].lastWrong),
    [wrongBook, showMastered],
  );

  const unmasteredIds = Object.keys(wrongBook).filter((id) => !wrongBook[id].mastered);

  return (
    <div className="card">
      <h2>❌ 错题集</h2>
      <div className="actions" style={{ marginTop: 0 }}>
        <button
          className="btn btn-pri"
          disabled={!unmasteredIds.length}
          onClick={() => startSession(unmasteredIds)}
        >
          重做全部错题（{unmasteredIds.length}）
        </button>
        <button className="btn" onClick={() => setShowMastered(!showMastered)}>
          {showMastered ? '隐藏已掌握' : '显示已掌握'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty">🎉 错题集是空的，继续保持</div>
      ) : (
        entries.map(([id, meta]) => {
          const p = problems.find((x) => x.id === id);
          if (!p) return null;
          const topReason = Object.entries(meta.reasons || {}).sort((a, b) => b[1] - a[1])[0];
          const pitfalls = pitfallsFor(p);
          return (
            <div className="item" key={id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{p.source}</b>
                <div style={{ fontSize: 13, color: 'var(--sub)' }}>{p.stem.slice(0, 80)}…</div>
                <div className="meta">
                  错 {meta.count} 次 ·{' '}
                  {p.knowledge
                    .map((k) => domainOf(k))
                    .slice(0, 2)
                    .join('、') || '—'}
                  {topReason && ` · 主因：${REASON_LABEL[topReason[0]] || topReason[0]}`}
                  {meta.mastered && ' · ✅ 已掌握'}
                </div>
                {!meta.mastered && pitfalls.length > 0 && (
                  <div className="tip" style={{ marginTop: 8 }}>
                    <b>⚠ 易错点</b>
                    <ul>
                      {pitfalls.slice(0, 2).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button className="btn" onClick={() => startSession([id])}>
                  重做
                </button>
                <button className="btn" onClick={() => markMastered(id, !meta.mastered)}>
                  {meta.mastered ? '取消掌握' : '已掌握'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
