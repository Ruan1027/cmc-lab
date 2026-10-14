/** 限时模考：选整套真题 → 计时答题（不反馈对错）→ 交卷统一批改出报告 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Problem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { RichText } from '../components/Math';
import { sourceGroup } from '../core/knowledge';
import { gradeExam, lossByKnowledge, type ExamAnswer } from '../core/exam';

function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

interface Running {
  source: string;
  minutes: number;
  startedAt: number;
  endsAt: number;
  answers: Record<string, ExamAnswer>;
}

export function ExamPage() {
  const problems = useAppStore((s) => s.problems);
  const settings = useAppStore((s) => s.settings);
  const exams = useAppStore((s) => s.exams);
  const addExamRecord = useAppStore((s) => s.addExamRecord);
  const recordResults = useAppStore((s) => s.recordResults);
  const review = useAppStore((s) => s.startSession);

  const papers = useMemo(() => {
    const groups: Record<string, Problem[]> = {};
    problems.forEach((p) => {
      const g = sourceGroup(p.source);
      (groups[g] ||= []).push(p);
    });
    return Object.keys(groups)
      .sort(
        (a, b) =>
          (parseInt(b.replace(/\D/g, ''), 10) || 0) - (parseInt(a.replace(/\D/g, ''), 10) || 0),
      )
      .map((k) => ({ name: k, list: groups[k] }));
  }, [problems]);

  const [paper, setPaper] = useState('');
  const [minutes, setMinutes] = useState(settings.examMinutes);
  const [run, setRun] = useState<Running | null>(null);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [report, setReport] = useState<{
    paper: string;
    used: number;
    auto: boolean;
    res: ReturnType<typeof gradeExam>;
  } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (papers.length && !paper) setPaper(papers[0].name);
  }, [papers, paper]);

  useEffect(() => {
    if (!run) return;
    timer.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [run]);

  // 时间到自动交卷。必须放在 effect 里：在渲染体中 setState 会触发重复渲染警告
  const remainNow = run ? Math.max(0, Math.round((run.endsAt - now) / 1000)) : -1;
  const autoRef = useRef(false);
  useEffect(() => {
    if (run && !report && remainNow === 0 && !autoRef.current) {
      autoRef.current = true;
      finish(true);
    }
    if (!run) autoRef.current = false;
    // finish 每次渲染都是新函数，放进依赖会导致 effect 反复触发，这里依赖 remainNow 已足够
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, report, remainNow]);

  const list = papers.find((p) => p.name === (run?.source ?? paper))?.list ?? [];
  const cur = list[idx];

  function start() {
    const target = papers.find((p) => p.name === paper);
    if (!target || !target.list.length) return;
    setIdx(0);
    setReport(null);
    setRun({
      source: target.name,
      minutes,
      startedAt: Date.now(),
      endsAt: Date.now() + minutes * 60000,
      answers: {},
    });
    setNow(Date.now());
  }

  /** 写入某一题的作答（输入框是受控的，每次 onChange 都会走到这里，无需读 DOM） */
  function setAnswer(ans: ExamAnswer) {
    if (!run || !cur) return;
    setRun({ ...run, answers: { ...run.answers, [cur.id]: ans } });
  }

  /** 取某题已保存的文本，供受控输入回填 */
  function textOf(id: string): string {
    const a = run?.answers[id];
    return a && 'text' in a ? (a.text ?? '') : '';
  }

  function finish(auto: boolean) {
    if (!run) return;
    const target = papers.find((p) => p.name === run.source);
    if (!target) return;
    const answers = run.answers;
    const res = gradeExam(target.list, answers);
    const used = Math.max(1, Math.round((Date.now() - run.startedAt) / 60000));
    // 整卷一次性提交，避免逐题写 localStorage
    recordResults(
      target.list.map((p, i) => {
        const d = res.detail[i];
        const a = answers[p.id];
        return {
          p,
          result: d.result,
          ua: a && 'text' in a ? String(a.text ?? '') : '',
        };
      }),
    );
    addExamRecord({
      ts: Date.now(),
      source: run.source,
      minutes: run.minutes,
      used,
      score: res.score,
      total: res.total,
      right: res.right,
      partial: res.partial,
      wrong: res.wrong,
      blank: res.blank,
      auto,
      detail: res.detail,
    });
    setReport({ paper: run.source, used, auto, res });
    setRun(null);
  }

  function pick(letter: string, grade?: 'correct' | 'partial' | 'wrong') {
    if (!run || !cur) return;
    const prev = run.answers[cur.id];
    const text = prev && 'text' in prev ? (prev.text ?? '') : '';
    const ans: ExamAnswer =
      cur.type === 'choice'
        ? { kind: 'choice', letter }
        : { kind: 'self', grade: grade ?? (prev?.kind === 'self' ? prev.grade : 'wrong'), text };
    setAnswer(ans);
  }

  if (report) {
    const { res } = report;
    const pct = res.total ? Math.round((res.score / res.total) * 100) : 0;
    const loss = lossByKnowledge(problems, res.detail);
    return (
      <div className="card">
        <h2>📋 模考报告 · {report.paper}</h2>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-num">{Math.round(res.score)}</div>
            <div className="stat-label">得分 / {Math.round(res.total)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{pct}%</div>
            <div className="stat-label">得分率</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{report.used}</div>
            <div className="stat-label">用时（分钟）</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{res.right}</div>
            <div className="stat-label">完全正确</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{res.partial}</div>
            <div className="stat-label">部分正确</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{res.wrong}</div>
            <div className="stat-label">错误/未答</div>
          </div>
        </div>
        {report.auto && (
          <div className="result err">
            <div className="result-title err">⏰ 时间到，已自动交卷</div>
          </div>
        )}
        {loss.length > 0 && (
          <>
            <h3 style={{ marginTop: 14 }}>失分集中在</h3>
            <div>
              {loss.slice(0, 8).map((l) => (
                <span className="tag" key={l.k}>
                  {l.k} ×{l.n}
                </span>
              ))}
            </div>
          </>
        )}
        <h3 style={{ marginTop: 16 }}>逐题回顾</h3>
        {res.detail.map((d) => (
          <div className="item" key={d.id}>
            <div>
              {d.result === 'correct' ? '✅' : d.result === 'partial' ? '🟡' : '❌'} {d.source}
              <span style={{ fontSize: 12, color: 'var(--sub)' }}> · {d.sc} 分</span>
            </div>
            <button className="btn" onClick={() => review([d.id])}>
              查看解析
            </button>
          </div>
        ))}
        <div className="actions">
          <button className="btn btn-pri" onClick={() => setReport(null)}>
            再来一套
          </button>
        </div>
      </div>
    );
  }

  if (run && cur) {
    const remain = Math.max(0, Math.round((run.endsAt - now) / 1000));
    const saved = run.answers[cur.id];
    return (
      <>
        <div className="exam-bar">
          <div>
            第 {idx + 1} / {list.length} 题 · {cur.source}
          </div>
          <div>
            剩余{' '}
            <span className={'exam-clock' + (remain <= 0 ? ' over' : remain <= 300 ? ' warn' : '')}>
              {clock(remain)}
            </span>
          </div>
          <button className="btn btn-err" onClick={() => finish(false)}>
            交卷
          </button>
        </div>
        <div className="card">
          <span className="stem-label">
            {cur.type === 'choice' ? '选择题' : cur.type === 'fill' ? '填空题' : '解答题'}
          </span>
          <div className="stem">
            <RichText text={cur.stem} />
          </div>

          {cur.type === 'choice' && (
            <div className="options">
              {cur.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const on = saved && saved.kind === 'choice' && saved.letter === letter;
                return (
                  <div
                    key={i}
                    className={'option' + (on ? ' selected' : '')}
                    onClick={() => pick(letter)}
                  >
                    <b>{letter}.</b> <RichText text={opt.replace(/^[A-D][.、]\s*/, '')} />
                  </div>
                );
              })}
            </div>
          )}

          {cur.type === 'fill' && (
            <input
              className="fill-input"
              value={saved && saved.kind === 'fill' ? saved.text : ''}
              placeholder="输入答案"
              onChange={(e) => setAnswer({ kind: 'fill', text: e.target.value })}
            />
          )}

          {cur.type === 'proof' && (
            <>
              <textarea
                value={textOf(cur.id)}
                placeholder="写出解答"
                onChange={(e) =>
                  setAnswer({
                    kind: 'self',
                    grade: saved?.kind === 'self' ? saved.grade : 'wrong',
                    text: e.target.value,
                  })
                }
              />
              <div className="actions">
                <button
                  className="btn"
                  style={
                    saved?.kind === 'self' && saved.grade === 'correct'
                      ? { outline: '2px solid var(--ok)' }
                      : undefined
                  }
                  onClick={() => pick('', 'correct')}
                >
                  完全会做
                </button>
                <button
                  className="btn"
                  style={
                    saved?.kind === 'self' && saved.grade === 'partial'
                      ? { outline: '2px solid var(--warn)' }
                      : undefined
                  }
                  onClick={() => pick('', 'partial')}
                >
                  部分会做
                </button>
                <button
                  className="btn"
                  style={
                    saved?.kind === 'self' && saved.grade === 'wrong'
                      ? { outline: '2px solid var(--err)' }
                      : undefined
                  }
                  onClick={() => pick('', 'wrong')}
                >
                  不会
                </button>
              </div>
            </>
          )}

          <div className="actions">
            <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
              上一题
            </button>
            <button
              className="btn btn-pri"
              onClick={() => {
                if (idx + 1 < list.length) setIdx(idx + 1);
                else finish(false);
              }}
            >
              {idx + 1 < list.length ? '下一题' : '最后一题·交卷'}
            </button>
          </div>
          <div className="footer-note">模考中不显示对错与解析，交卷后统一批改</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <h2>⏱ 限时模拟测评</h2>
        <div className="hint">
          选一套完整真题，按正式考试时间作答。模考过程中不显示对错与解析，时间到自动交卷，
          之后统一批改并生成成绩报告。
        </div>
        <div className="row">
          <select value={paper} onChange={(e) => setPaper(e.target.value)}>
            {papers.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}（{p.list.length} 题）
              </option>
            ))}
          </select>
          <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {[60, 90, 120, 150].map((m) => (
              <option key={m} value={m}>
                {m} 分钟
              </option>
            ))}
          </select>
          <button className="btn btn-pri" onClick={start}>
            开始模考
          </button>
        </div>
      </div>

      <div className="card">
        <h2>模考历史</h2>
        {exams.length === 0 ? (
          <div className="empty">还没有模考记录</div>
        ) : (
          [...exams]
            .reverse()
            .slice(0, 10)
            .map((e, i) => {
              const pct = e.total ? Math.round((e.score / e.total) * 100) : 0;
              return (
                <div className="item" key={i}>
                  <div>
                    <b>{e.source}</b>
                    <div className="meta">
                      {new Date(e.ts).toLocaleString('zh-CN')} · 用时 {e.used} 分钟
                      {e.auto ? ' · 超时自动交卷' : ''}
                    </div>
                  </div>
                  <div>
                    <b>
                      {Math.round(e.score)} / {Math.round(e.total)}
                    </b>{' '}
                    <span className={'pill ' + (pct >= 60 ? 'pill-ok' : 'pill-weak')}>{pct}%</span>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </>
  );
}
