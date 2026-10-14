/** 题库页：搜索/筛选/分页/预览，支持拖拽导入 Markdown、备份导出与恢复 */
import { useMemo, useRef, useState } from 'react';
import type { Problem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { RichText } from '../components/Math';
import { BANK_FILES } from '../data/bank';
import { sourceGroup } from '../core/knowledge';
import { pitfallsFor } from '../core/pitfalls';

const PAGE_SIZE = 20;
const TYPE_NAME: Record<string, string> = { choice: '选择', fill: '填空', proof: '解答' };

export function BankPage() {
  const problems = useAppStore((s) => s.problems);
  const importMarkdown = useAppStore((s) => s.importMarkdown);
  const restoreBackup = useAppStore((s) => s.restoreBackup);
  const exportJSON = useAppStore((s) => s.exportJSON);
  const resetAll = useAppStore((s) => s.resetAll);
  const notify = useAppStore((s) => s.notify);
  const startSession = useAppStore((s) => s.startSession);

  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState<Problem | null>(null);
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return problems.filter((p) => {
      if (type && p.type !== type) return false;
      if (!kw) return true;
      return (p.stem + p.source + (p.knowledge || []).join('')).toLowerCase().includes(kw);
    });
  }, [problems, q, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const runImport = (value: string, note: string) => {
    if (!value.trim()) {
      notify('内容为空');
      return;
    }
    const r = importMarkdown(value);
    notify(
      `导入完成：新增 ${r.added} 题${r.skipped ? `，跳过重复 ${r.skipped} 题` : ''}${note ? `（${note}）` : ''}`,
    );
    setText('');
  };

  const pickFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const okFiles = Array.from(files).filter((f) => /\.(md|markdown|txt)$/i.test(f.name));
    if (!okFiles.length) {
      notify('只支持 .md / .markdown / .txt 文件');
      return;
    }
    const parts = await Promise.all(okFiles.map((f) => f.text()));
    runImport(parts.join('\n\n'), okFiles.map((f) => f.name).join('、'));
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <>
      <div className="card">
        <h2>📥 导入题库</h2>
        <div className="hint">
          每题以 <code>## 标题</code> 开头，字段用 <code>字段名: 内容</code>。
          支持：类型、知识点、难度、分值、题目、选项、答案、备选、思路、易错点、解析。 公式用{' '}
          <code>$...$</code>。
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void pickFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--pri)' : '#cbd5e1'}`,
            background: dragging ? '#eff6ff' : '#f8fafc',
            borderRadius: 10,
            padding: '18px 14px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 24 }}>📄</div>
          <div>把 Markdown 文件拖到这里，或点击选择（可多选）</div>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,.txt,.json"
            multiple
            hidden
            onChange={(e) => {
              const files = e.target.files;
              const json = files && Array.from(files).find((f) => /\.json$/i.test(f.name));
              if (json) {
                void json.text().then((t) => {
                  try {
                    restoreBackup(t);
                    notify('备份已恢复');
                  } catch (err) {
                    notify((err as Error).message);
                  }
                });
              } else {
                void pickFiles(files);
              }
              e.target.value = '';
            }}
          />
        </div>
        <textarea
          value={text}
          placeholder="也可以直接粘贴 Markdown 内容到这里"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="actions">
          <button className="btn btn-pri" onClick={() => runImport(text, '')}>
            解析并导入
          </button>
          <button
            className="btn"
            onClick={() =>
              download(exportJSON(), `cmc-backup-${Date.now()}.json`, 'application/json')
            }
          >
            导出备份 (JSON)
          </button>
          <button
            className="btn"
            onClick={() => {
              if (!confirm('确定清空全部数据并恢复内置题库？建议先导出备份。')) return;
              resetAll();
              notify('已重置');
            }}
          >
            重置数据
          </button>
        </div>
      </div>

      <div className="card">
        <h2>📚 当前题库（{problems.length} 题）</h2>
        <div className="footer-note" style={{ textAlign: 'left', marginBottom: 12 }}>
          内置题库文件：{BANK_FILES.length} 个（{BANK_FILES.slice(0, 3).join('、')}…）
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <input
            type="search"
            placeholder="搜索题干 / 来源 / 知识点…"
            style={{ flex: 1, minWidth: 160 }}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">全部题型</option>
            <option value="choice">选择题</option>
            <option value="fill">填空题</option>
            <option value="proof">解答题</option>
          </select>
        </div>

        {pageItems.length === 0 ? (
          <div className="empty">没有匹配的题目</div>
        ) : (
          pageItems.map((p) => (
            <div className="item" key={p.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>
                  [{TYPE_NAME[p.type]}] {p.source}
                </b>
                <div style={{ fontSize: 13, color: 'var(--sub)' }}>{p.stem.slice(0, 70)}…</div>
                <div className="meta">
                  {sourceGroup(p.source)} · 难度 {p.difficulty}
                  {p.score ? ` · ${p.score} 分` : ''} · {p.knowledge.join('、') || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button className="btn" onClick={() => setPreview(p)}>
                  预览
                </button>
                <button className="btn" onClick={() => startSession([p.id])}>
                  练习
                </button>
              </div>
            </div>
          ))
        )}

        {pageCount > 1 && (
          <div className="actions" style={{ justifyContent: 'center' }}>
            <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--sub)' }}>
              {page + 1} / {pageCount}
            </span>
            <button
              className="btn"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {preview && (
        <div className="card">
          <h2>预览：{preview.source}</h2>
          <div className="stem">
            <RichText text={preview.stem} />
          </div>
          <div className="answer-block">
            <div className="label">答案</div>
            <RichText text={preview.answer || '—'} />
          </div>
          <div className="answer-block">
            <div className="label">解析</div>
            <div className="solution">
              <RichText text={preview.solution || '暂无解析'} />
            </div>
          </div>
          {preview.hint && (
            <div className="answer-block">
              <div className="label">思路</div>
              <div className="solution">
                <RichText text={preview.hint} />
              </div>
            </div>
          )}
          {pitfallsFor(preview).length > 0 && (
            <div className="tip">
              <b>⚠ 易错点</b>
              <ul>
                {pitfallsFor(preview).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="actions">
            <button className="btn btn-pri" onClick={() => setPreview(null)}>
              关闭
            </button>
            <button className="btn" onClick={() => startSession([preview.id])}>
              练习这道题
            </button>
          </div>
        </div>
      )}
    </>
  );
}
