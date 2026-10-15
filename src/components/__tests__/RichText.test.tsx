import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText } from '../Math';

const render = (text: string) => renderToStaticMarkup(<RichText text={text} />);

describe('RichText 图片渲染', () => {
  it('把 Markdown 图片语法渲染为 <img>', () => {
    const html = render('如图所示 ![函数图](data:image/svg+xml;base64,ABC123) 可见');
    expect(html).toContain('<img');
    expect(html).toContain('src="data:image/svg+xml;base64,ABC123"');
    expect(html).toContain('alt="函数图"');
  });

  it('data URI 不被截断（含特殊字符）', () => {
    const uri =
      'data:image/svg+xml;base64,' + 'A'.repeat(200) + '/+=';
    const html = render(`![f](${uri})`);
    expect(html).toContain(`src="${uri}"`);
  });

  it('公式与图片共存时各自正确渲染', () => {
    const html = render('设 $y=f(x)$，见图 ![图](data:image/png;base64,ZZZ)');
    expect(html).toContain('class="katex"'); // 公式部分仍由 KaTeX 渲染
    expect(html).toContain('<img');
    expect(html).toContain('src="data:image/png;base64,ZZZ"');
  });

  it('没有图片时保持纯文本/公式渲染', () => {
    const html = render('普通文本 $\\int x\\,dx$');
    expect(html).not.toContain('<img');
    expect(html).toContain('class="katex"');
  });
});
