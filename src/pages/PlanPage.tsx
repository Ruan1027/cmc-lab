/** 备考页：组别设置、倒计时、知识模块进度、今日任务、打卡日历 */
import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GROUP_OPTIONS, groupComposition, problemsOfGroup } from '../core/groups';
import { moduleProgress, dailyCounts, streakDays } from '../core/stats';
import { buildTodayPlan, daysToExam } from '../core/planner';
import type { ExamGroup } from '../types';

export function PlanPage() {
  const problems = useAppStore((s) => s.problems);
  const settings = useAppStore((s) => s.settings);
  const history = useAppStore((s) => s.history);
  const stats = useAppStore((s) => s.stats);
  const wrongBook = useAppStore((s) => s.wrongBook);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const startSession = useAppStore((s) => s.startSession);

  const pool = useMemo(() => problemsOfGroup(problems, settings.group), [problems, settings.group]);
  const modules = useMemo(() => moduleProgress(pool, stats, history), [pool, stats, history]);
  const plan = useMemo(
    () => buildTodayPlan(pool, stats, history, wrongBook, settings),
    [pool, stats, history, wrongBook, settings],
  );
  const left = daysToExam(settings.examDate);
  const comp = useMemo(() => groupComposition(pool), [pool]);
  const calendar = useMemo(() => dailyCounts(history, 56), [history]);
  const streak = streakDays(history);
  const doneIds = useMemo(() => new Set(history.map((h) => h.id)), [history]);
  const done = pool.filter((p) => doneIds.has(p.id)).length;
  const rate = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const unmastered = Object.values(wrongBook).filter((m) => !m.mastered).length;

  return (
    <>
      <div className="card">
        <h2>🎯 备考设置</h2>
        <div className="grid2">
          <label className="field">
            报考组别
            <select
              value={settings.group}
              onChange={(e) => updateSettings({ group: e.target.value as ExamGroup })}
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            初赛日期
            <input
              type="date"
              value={settings.examDate}
              onChange={(e) => updateSettings({ examDate: e.target.value })}
            />
          </label>
          <label className="field">
            每日目标（题）
            <input
              type="number"
              min={1}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) || 10 })}
            />
          </label>
          <label className="field">
            模考时长（分钟）
            <input
              type="number"
              min={30}
              max={240}
              value={settings.examMinutes}
              onChange={(e) => updateSettings({ examMinutes: Number(e.target.value) || 150 })}
            />
          </label>
        </div>
        <div className="hint" style={{ marginTop: 12 }}>
          <b>组别说明</b>：2022 年及以前只有「非数学类」一卷，A/B 类考生都考它；2023 年起才分 A、B 卷。
          所以报非数学 A 类时，练习范围 = A 类卷 + 往年非数学类旧卷。
        </div>
      </div>

      <div className="card">
        <h2>📅 备考概览</h2>
        {left === null ? (
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-num">—</div>
              <div className="stat-label">未设置初赛日期</div>
            </div>
          </div>
        ) : (
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-num">{left < 0 ? 0 : left}</div>
              <div className="stat-label">{left < 0 ? '初赛已过' : '距离初赛（天）'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{pool.length}</div>
              <div className="stat-label">适用题数</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{done}</div>
              <div className="stat-label">已做</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{pool.length ? Math.round((done / pool.length) * 100) : 0}%</div>
              <div className="stat-label">覆盖率</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{rate}%</div>
              <div className="stat-label">总正确率</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{streak}</div>
              <div className="stat-label">连续打卡（天）</div>
            </div>
          </div>
        )}
        {left !== null && left > 0 && (
          <div className="hint">
            还剩 <b>{pool.length - done}</b> 题没做，按剩余 <b>{left}</b> 天算，每天需完成约{' '}
            <b>{plan.perDay}</b> 题；你的每日目标是 <b>{settings.dailyGoal}</b> 题
            {plan.perDay > settings.dailyGoal ? '，目标偏低，建议调高或优先刷薄弱点。' : '，进度安排合理。'}
          </div>
        )}
        <div className="footer-note" style={{ textAlign: 'left' }}>
          练习范围：
          {Object.keys(comp)
            .map((g) => `${g} ${comp[g]} 题`)
            .join(' + ')}
        </div>
      </div>

      <div className="card">
        <h2>🧭 知识模块进度</h2>
        {modules.length === 0 ? (
          <div className="empty">题库为空</div>
        ) : (
          modules.map((m) => {
            const cov = m.total ? Math.round((m.done / m.total) * 100) : 0;
            const rt = m.attempts ? Math.round((m.correct / m.attempts) * 100) : null;
            const pill =
              rt === null ? <span className="pill pill-idle">未练</span>
                : rt < 60 ? <span className="pill pill-weak">{rt}%</span>
                  : rt < 85 ? <span className="pill pill-mid">{rt}%</span>
                    : <span className="pill pill-ok">{rt}%</span>;
            return (
              <div className="bar-row" key={m.domain}>
                <div className="bar-head">
                  <span>{m.domain}</span>
                  <span>{m.done}/{m.total} · 覆盖 {cov}% {pill}</span>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${cov}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <h2>✅ 今日任务</h2>
        {plan.tasks.length === 0 ? (
          <div className="empty">🎉 今日任务已清空，明天再来</div>
        ) : (
          plan.tasks.map((t, i) => (
            <div className="item" key={i}>
              <div>
                <b>{t.label}</b>
                <div className="meta">{t.why}</div>
              </div>
              <button className="btn btn-pri" onClick={() => startSession(t.ids)}>
                开始
              </button>
            </div>
          ))
        )}
        <div className="footer-note" style={{ textAlign: 'left' }}>
          未做题 {plan.undone} 道 · 未掌握错题 {plan.wrong} 道
          {plan.weak.length > 0 && ` · 薄弱点：${plan.weak.slice(0, 5).join('、')}`}
        </div>
      </div>

      <div className="card">
        <h2>🗓 打卡日历（近 8 周）</h2>
        <div className="cal">
          {calendar.map((d, i) => {
            const isToday = d.date.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={(d.count ? 'on ' : '') + (isToday ? 'today' : '')} title={`${d.date.getMonth() + 1}/${d.date.getDate()}`}>
                {d.date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="footer-note" style={{ textAlign: 'left' }}>
          近 8 周有 {calendar.filter((d) => d.count > 0).length} 天做过题
          {unmastered > 0 && ` · 未掌握错题 ${unmastered} 道`}
        </div>
      </div>
    </>
  );
}
