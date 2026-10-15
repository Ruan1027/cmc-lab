/** 学习报告页：总览 / 模块 / 各维度正确率 / 薄弱点 / 错题 / 模考 / 轨迹 / 建议，可导出 Markdown 或打印成 PDF */
import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { buildReport, reportToMarkdown } from '../core/report';

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

const RESULT_TEXT: Record<string, string> = {
  correct: '✓ 答对',
  partial: '~ 部分',
  wrong: '✗ 答错',
  skipped: '– 跳过',
};

export function ReportPage() {
  const problems = useAppStore((s) => s.problems);
  const stats = useAppStore((s) => s.stats);
  const history = useAppStore((s) => s.history);
  const wrongBook = useAppStore((s) => s.wrongBook);
  const settings = useAppStore((s) => s.settings);
  const exams = useAppStore((s) => s.exams);
  const notify = useAppStore((s) => s.notify);

  const report = useMemo(
    () => buildReport({ problems, stats, history, wrongBook, settings, exams }),
    [problems, stats, history, wrongBook, settings, exams],
  );

  const o = report.overview;

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const exportMarkdown = () => {
    const md = reportToMarkdown(report);
    const date = new Date().toISOString().slice(0, 10);
    download(md, `cmc-学习报告-${date}.md`, 'text/markdown;charset=utf-8');
    notify('已导出 Markdown 报告');
  };

  const exportPdf = () => {
    notify('正在调起打印，选择「另存为 PDF」即可');
    setTimeout(() => window.print(), 200);
  };

  return (
    <div className="card report-root">
      <div className="report-actions no-print">
        <h2>📄 学习报告</h2>
        <div className="actions">
          <button className="btn btn-pri" onClick={exportMarkdown}>
            导出 Markdown
          </button>
          <button className="btn" onClick={exportPdf}>
            打印 / 导出 PDF
          </button>
        </div>
      </div>
      <div className="report-meta">
        生成时间：{o.generatedAt} ｜ 组别：{o.group}
        {o.examDate ? ` ｜ 考试：${o.examDate}${o.daysToExam === null ? '' : `（距考试 ${o.daysToExam} 天）`}` : ''}
      </div>

      <h3>总览</h3>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-num">{o.totalAttempts}</div>
          <div className="stat-label">总作答</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{o.overallRate === null ? '—' : `${o.overallRate}%`}</div>
          <div className="stat-label">总正确率</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{o.streakDays}</div>
          <div className="stat-label">连续打卡（天）</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{o.wrongUnmastered}</div>
          <div className="stat-label">未掌握错题</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{o.dueReviews}</div>
          <div className="stat-label">待复习（到期）</div>
        </div>
      </div>

      <h3>知识模块进度</h3>
      {report.modules.length === 0 ? (
        <div className="empty">暂无数据</div>
      ) : (
        report.modules.map((m) => (
          <Bar
            key={m.domain}
            label={m.domain}
            right={`${m.done}/${m.total} · ${m.rate === null ? '未练' : `${m.rate}%`}`}
            pct={m.rate ?? 0}
          />
        ))
      )}

      <h3>各维度正确率</h3>
      {report.byType.length > 0 && (
        <>
          <div className="rpt-sub">题型</div>
          <table className="rpt-table">
            <thead>
              <tr>
                <th>题型</th>
                <th>正确 / 总</th>
                <th>正确率</th>
              </tr>
            </thead>
            <tbody>
              {report.byType.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>
                    {d.correct}/{d.attempts}
                  </td>
                  <td>{d.rate === null ? '—' : `${d.rate}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {report.byDifficulty.length > 0 && (
        <>
          <div className="rpt-sub">难度</div>
          <table className="rpt-table">
            <thead>
              <tr>
                <th>难度</th>
                <th>正确 / 总</th>
                <th>正确率</th>
              </tr>
            </thead>
            <tbody>
              {report.byDifficulty.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>
                    {d.correct}/{d.attempts}
                  </td>
                  <td>{d.rate === null ? '—' : `${d.rate}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {report.bySource.length > 0 && (
        <>
          <div className="rpt-sub">届次</div>
          <table className="rpt-table">
            <thead>
              <tr>
                <th>届次</th>
                <th>正确 / 总</th>
                <th>正确率</th>
              </tr>
            </thead>
            <tbody>
              {report.bySource.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>
                    {d.correct}/{d.attempts}
                  </td>
                  <td>{d.rate === null ? '—' : `${d.rate}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>薄弱知识点（正确率 &lt; 60%）</h3>
      {report.weak.length === 0 ? (
        <div className="empty">暂无，或练习量不足</div>
      ) : (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>知识点</th>
              <th>正确率</th>
              <th>练习次数</th>
            </tr>
          </thead>
          <tbody>
            {report.weak.map((w) => (
              <tr key={w.k}>
                <td>{w.k}</td>
                <td>{w.rate}%</td>
                <td>{w.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>错题本</h3>
      <div className="report-meta">
        共 {o.wrongTotal} 道（未掌握 {o.wrongUnmastered}、已掌握 {o.wrongMastered}）
      </div>
      <div className="rpt-sub">高频错题 TOP</div>
      {report.wrongTop.length === 0 ? (
        <div className="empty">暂无错题</div>
      ) : (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>题源</th>
              <th>错次</th>
              <th>状态</th>
              <th>当前间隔</th>
              <th>下次复习</th>
            </tr>
          </thead>
          <tbody>
            {report.wrongTop.map((w) => (
              <tr key={w.id}>
                <td>{w.source}</td>
                <td>{w.count}</td>
                <td>{w.mastered ? '已掌握' : '未掌握'}</td>
                <td>{w.interval === null ? '—' : `${w.interval} 天`}</td>
                <td>{w.nextReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="rpt-sub">待复习队列（到期）</div>
      {report.dueList.length === 0 ? (
        <div className="empty">当前没有到期待复习的题</div>
      ) : (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>题源</th>
              <th>错次</th>
              <th>状态</th>
              <th>下次复习</th>
            </tr>
          </thead>
          <tbody>
            {report.dueList.map((w) => (
              <tr key={w.id}>
                <td>{w.source}</td>
                <td>{w.count}</td>
                <td>{w.mastered ? '已掌握' : '未掌握'}</td>
                <td>{w.nextReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>限时模考记录</h3>
      {report.exams.length === 0 ? (
        <div className="empty">尚未进行模考</div>
      ) : (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>卷别</th>
              <th>得分</th>
              <th>对/半/错/空</th>
              <th>用时</th>
            </tr>
          </thead>
          <tbody>
            {report.exams.map((e, i) => (
              <tr key={i}>
                <td>{e.ts}</td>
                <td>{e.source}</td>
                <td>
                  {e.score}/{e.total}
                </td>
                <td>
                  {e.right}/{e.partial}/{e.wrong}/{e.blank}
                </td>
                <td>{e.minutes} 分钟</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>近期练习轨迹</h3>
      {report.recent.length === 0 ? (
        <div className="empty">暂无练习记录</div>
      ) : (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>题源</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {report.recent.map((h, i) => (
              <tr key={i}>
                <td>{h.ts}</td>
                <td>{h.source}</td>
                <td>{RESULT_TEXT[h.result] ?? h.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>备考建议</h3>
      <ol className="suggest-list">
        {report.suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
