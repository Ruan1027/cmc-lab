/**
 * 数学公式渲染（KaTeX）
 *
 * 选 KaTeX 而非 MathJax：渲染快一个数量级，且可离线打包（移动端必须）。
 * throwOnError: false —— 题库里偶尔有手写 LaTeX 不严谨，不能让整页崩掉。
 */
import katex from 'katex';
import { useMemo } from 'react';

interface MathProps {
  tex: string;
  display?: boolean;
}

export function Math({ tex, display = false }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: false });
    } catch {
      return tex;
    }
  }, [tex, display]);
  return <span className="math" dangerouslySetInnerHTML={{ __html: html }} />;
}

type Part = { math: boolean; content: string; display?: boolean };

/** 把含 $...$ / $$...$$ 的文本切成 文本 / 公式 交替的片段 */
function splitMath(text: string): Part[] {
  const parts: Part[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ math: false, content: text.slice(last, m.index) });
    if (m[1] !== undefined) parts.push({ math: true, content: m[1], display: true });
    else parts.push({ math: true, content: m[2] ?? '', display: false });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ math: false, content: text.slice(last) });
  return parts;
}

/** 图片片段：Markdown 图片语法 ![alt](src) 中的 src 可以是 data URI（离线可用） */
type Seg =
  | { kind: 'text'; content: string }
  | { kind: 'img'; alt: string; src: string };

/** 把一个纯文本段再按 Markdown 图片语法切成 文本 / 图片 交替片段 */
function splitImages(seg: string): Seg[] {
  const out: Seg[] = [];
  const re = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(seg)) !== null) {
    if (m.index > last) out.push({ kind: 'text', content: seg.slice(last, m.index) });
    out.push({ kind: 'img', alt: m[1], src: m[2] });
    last = re.lastIndex;
  }
  if (last < seg.length) out.push({ kind: 'text', content: seg.slice(last) });
  return out;
}

/** 渲染可能内嵌公式的富文本（题干、解析、思路等），并支持内嵌图片 */
export function RichText({ text }: { text: string }) {
  const parts = useMemo(() => splitMath(text || ''), [text]);
  let key = 0;
  return (
    <>
      {parts.map((p, i) => {
        if (p.math) {
          return <Math key={i} tex={p.content} display={p.display} />;
        }
        // 普通文本段：再切图片
        const segs = splitImages(p.content);
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {segs.map((s) => {
              if (s.kind === 'text') return <span key={key++}>{s.content}</span>;
              return (
                <img
                  key={key++}
                  className="rich-img"
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                />
              );
            })}
          </span>
        );
      })}
    </>
  );
}
