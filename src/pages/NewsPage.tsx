/** 竞赛资讯：赛程、通知、备考经验、资源
 *
 * MVP 用内置静态数据（src/data/news.ts）。页面与数据源解耦，
 * 后续接入官方通知源只需替换该模块。
 */
import { useState } from 'react';
import { NEWS } from '../data/news';
import type { NewsItem } from '../types';

const CATEGORY_COLOR: Record<NewsItem['category'], string> = {
  通知: '#2563eb',
  赛程: '#16a34a',
  经验: '#d97706',
  资源: '#7c3aed',
};

export function NewsPage() {
  const [cat, setCat] = useState<'' | NewsItem['category']>('');
  const list = NEWS.filter((n) => !cat || n.category === cat).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="card">
      <h2>📢 竞赛资讯</h2>
      <div className="hint">
        具体日期每年由主办方公布，以下为稳定赛制规律。请同时以本校教务处与中国数学会当年通知为准。
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {(['', '通知', '赛程', '经验', '资源'] as const).map((c) => (
          <button
            key={c}
            className={'btn' + (cat === c ? ' btn-pri' : '')}
            onClick={() => setCat(c)}
          >
            {c === '' ? '全部' : c}
          </button>
        ))}
      </div>

      {list.map((n) => (
        <div className="item" key={n.id}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <b>{n.title}</b>
              <span
                className="pill"
                style={{
                  background: CATEGORY_COLOR[n.category] + '1a',
                  color: CATEGORY_COLOR[n.category],
                }}
              >
                {n.category}
              </span>
              {n.pinned && <span className="pill pill-weak">置顶</span>}
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{n.summary}</div>
          </div>
        </div>
      ))}

      {list.length === 0 && <div className="empty">该分类暂无内容</div>}
    </div>
  );
}
