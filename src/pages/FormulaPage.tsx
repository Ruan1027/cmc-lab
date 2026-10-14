/** 公式定理速查手册：按模块分组，支持关键词搜索与模块筛选 */
import { useMemo, useState } from 'react';
import { Math } from '../components/Math';
import { FORMULA_BOOK } from '../data/formulas';
import { DOMAIN_ORDER } from '../core/knowledge';

export function FormulaPage() {
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('');

  const domains = useMemo(() => {
    const set = new Set(FORMULA_BOOK.map((g) => g.domain));
    return DOMAIN_ORDER.filter((d) => set.has(d)).concat(
      [...set].filter((d) => !DOMAIN_ORDER.includes(d)),
    );
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return FORMULA_BOOK.filter((g) => {
      if (domain && g.domain !== domain) return false;
      if (!kw) return true;
      return g.items.some((it) => (it.name + it.tex).toLowerCase().includes(kw));
    })
      .map((g) => ({
        domain: g.domain,
        items: kw ? g.items.filter((it) => (it.name + it.tex).toLowerCase().includes(kw)) : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [q, domain]);

  const count = filtered.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="card">
      <h2>📖 核心公式定理速查</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="搜索公式 / 定理名称…"
          style={{ flex: 1, minWidth: 160 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">全部模块</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="footer-note" style={{ textAlign: 'left', marginBottom: 12 }}>
        共 {count} 条
      </div>

      {filtered.length === 0 ? (
        <div className="empty">没有匹配的公式</div>
      ) : (
        filtered.map((g) => (
          <div className="fml-grp" key={g.domain}>
            <h4>{g.domain}</h4>
            {g.items.map((it) => (
              <div className="fml" key={it.name}>
                <div className="nm">{it.name}</div>
                <div className="tex">
                  <Math tex={it.tex} display />
                </div>
                {it.note && (
                  <div className="meta" style={{ fontSize: 12, color: 'var(--sub)' }}>
                    {it.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
