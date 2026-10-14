/** 练习页：按队列逐题作答，即时判分并给出解析、思路与易错点 */
import { useMemo, useState } from 'react';
import type { AnswerResult, Problem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { RichText } from '../components/Math';
import { answerMatch } from '../core/judge';
import { pitfallsFor } from '../core/pitfalls';
import { sourceGroup } from '../core/knowledge';

export function PracticePage() {
  const problems = useAppStore((s) => s.problems);
  const session = useAppStore((s) => s.session);
  const flags = useAppStore((s) => s.flags);
  const goTo = useAppStore((s) => s.goTo);
  const recordResult = useAppStore((s) => s.recordResult);
  const startSession = useAppStore((s) => s.startSession);
  const toggleStar = useAppStore((s) => s.toggleStar);
  const endSession = useAppStore((s) => s.endSession);

  const [picked, setPicked] = useState<number | null>(null);
  const [fill, setFill] = useState('');
  const [proof, setProof] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);

  const current: Problem | undefined = useMemo(
    () => problems.find((p) => p.id === session.queue[session.idx]),
    [problems, session.queue, session.idx],
  );

  if (!current) {
    return (
      <div className="card">
        <h2>开始练习</h2>
        <p style={{ color: 'var(--sub)', fontSize: 14 }}>
          从「备考」页领取今日任务，或在下方按顺序/随机开一轮。
        </p>
        <div className="actions">
          <button className="btn btn-pri" onClick={() => startSession(problems.map((p) => p.id))}>
            顺序练习全部（{problems.length} 题）
          </button>
          <button
            className="btn"
            onClick={() =>
              startSession(
                [...problems].sort(() => Math.random() - 0.5).map((p) => p.id),
              )
            }
          >
            随机练习
          </button>
        </div>
      </div>
    );
  }

  const resetLocal = () => {
    setPicked(null);
    setFill('');
    setProof('');
    setSubmitted(false);
    setResult(null);
  };

  const submit = () => {
    if (current.type === 'choice' && picked === null) return;
    if (current.type === 'fill' && !fill.trim()) return;
    let r: AnswerResult = 'wrong';
    if (current.type === 'choice') {
      const letter = String.fromCharCode(65 + (picked ?? 0));
      r = letter === String(current.answer).trim().charAt(0).toUpperCase() ? 'correct' : 'wrong';
    } else if (current.type === 'fill') {
      r = answerMatch(fill, current.answer, current.answerAlt) ? 'correct' : 'wrong';
    }
    setResult(r);
    setSubmitted(true);
    recordResult(current, r, current.type === 'fill' ? fill : current.type === 'choice' ? String.fromCharCode(65 + (picked ?? 0)) : proof);
  };

  const selfGrade = (grade: AnswerResult) => {
    setResult(grade);
    setSubmitted(true);
    recordResult(current, grade, proof);
  };

  const next = () => {
    if (session.idx + 1 >= session.queue.length) {
      endSession();
      resetLocal();
      return;
    }
    resetLocal();
    goTo(session.idx + 1);
  };
  const prev = () => {
    resetLocal();
    goTo(session.idx - 1);
  };
  const jump = (i: number) => {
    resetLocal();
    goTo(i);
  };

  const pitfalls = pitfallsFor(current);
  const total = session.queue.length;

  return (
    <>
      <div className="card">
        <div className="progress">
          <span>第 {session.idx + 1} / {total} 题</span>
          <div className="progress-bar">
            <div style={{ width: `${(session.idx / total) * 100}%` }} />
          </div>
          <button className="btn" style={{ padding: '4px 10px', minHeight: 28 }} onClick={endSession}>
            结束本轮
          </button>
        </div>

        <div className="qnav">
          {session.queue.map((id, i) => (
            <button
              key={id}
              className={
                'qnav-cell ' +
                (i === session.idx ? 'current ' : '') +
                (session.marks[id] ? `done-${session.marks[id]} ` : '')
              }
              onClick={() => jump(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <span className="stem-label">
          {current.type === 'choice' ? '选择题' : current.type === 'fill' ? '填空题' : '解答题'}
          {' · 难度 '}{current.difficulty}/5
          {current.score ? ` · ${current.score} 分` : ''}
        </span>
        <div className="stem">
          <RichText text={current.stem} />
        </div>
        <div>
          {current.knowledge.map((k) => (
            <span className="tag" key={k}>{k}</span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sub)' }}>
          {sourceGroup(current.source)} · {current.source}
          <button
            className="btn"
            style={{ marginLeft: 8, padding: '2px 8px', minHeight: 24, fontSize: 12 }}
            onClick={() => toggleStar(current.id)}
          >
            {flags[current.id] ? '★ 已收藏' : '☆ 收藏'}
          </button>
        </div>

        <div style={{ height: 14 }} />

        {current.type === 'choice' && (
          <div className="options">
            {current.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              let cls = 'option';
              if (submitted) {
                if (letter === String(current.answer).trim().charAt(0).toUpperCase()) cls += ' correct';
                else if (picked === i) cls += ' wrong';
              } else if (picked === i) cls += ' selected';
              return (
                <div key={i} className={cls} onClick={() => !submitted && setPicked(i)}>
                  <b>{letter}.</b>{' '}
                  <RichText text={opt.replace(/^[A-D][.、]\s*/, '')} />
                </div>
              );
            })}
          </div>
        )}

        {current.type === 'fill' && (
          <input
            className="fill-input"
            value={fill}
            disabled={submitted}
            placeholder="输入答案，支持 LaTeX（如 \frac{1}{2} 或 1/2）"
            onChange={(e) => setFill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitted) submit();
            }}
          />
        )}

        {current.type === 'proof' && (
          <>
            <textarea
              value={proof}
              disabled={submitted}
              placeholder="写出你的解题思路（不自动判分，写完对照解析自评）"
              onChange={(e) => setProof(e.target.value)}
            />
            {!submitted && (
              <div className="actions">
                <button className="btn btn-ok" onClick={() => selfGrade('correct')}>✅ 完全正确</button>
                <button className="btn" onClick={() => selfGrade('partial')}>🟡 部分正确</button>
                <button className="btn btn-err" onClick={() => selfGrade('wrong')}>❌ 错误</button>
              </div>
            )}
          </>
        )}

        {submitted && result && (
          <div className={`result ${result === 'correct' ? 'ok' : result === 'partial' ? 'partial' : 'err'}`}>
            <div className="result-title">
              {result === 'correct' ? '✅ 回答正确' : result === 'partial' ? '🟡 部分正确' : '❌ 回答错误'}
            </div>
            <div className="answer-block">
              <div className="label">正确答案</div>
              <RichText text={current.answer} />
              {current.answerAlt.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>
                  等价答案：{current.answerAlt.join('、')}
                </div>
              )}
            </div>
            <div className="answer-block">
              <div className="label">详细解析</div>
              <div className="solution">
                <RichText text={current.solution || '暂无解析'} />
              </div>
            </div>
            {current.hint && (
              <div className="answer-block">
                <div className="label">解题思路</div>
                <div className="solution">
                  <RichText text={current.hint} />
                </div>
              </div>
            )}
            {pitfalls.length > 0 && (
              <div className="tip">
                <b>⚠ 易错点</b>
                <ul>
                  {pitfalls.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          <button className="btn" onClick={prev} disabled={session.idx === 0}>
            上一题
          </button>
          {!submitted && current.type !== 'proof' && (
            <button className="btn btn-pri" onClick={submit}>
              提交答案
            </button>
          )}
          {submitted && (
            <button className="btn btn-pri" onClick={next}>
              {session.idx + 1 >= total ? '完成本轮' : '下一题 ▶'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
