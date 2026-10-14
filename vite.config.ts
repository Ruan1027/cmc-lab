import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import nodePath from 'node:path';

/**
 * 把入口脚本降级为经典脚本（去掉 type="module" / crossorigin）。
 *
 * 为什么必须这么做：<script type="module"> 在 file:// 协议下会被 CORS 拦截
 * （Chrome 对 module 脚本强制 CORS，而 file:// 的 origin 是 null）。
 * 想让构建产物双击就能用，就只能是普通 <script>，也就是要求打包成 IIFE。
 */
function classicScript(outDir = 'dist'): Plugin {
  return {
    name: 'cmc-classic-script',
    enforce: 'post',
    // 必须等产物落盘后再改：vite-plugin-singlefile 是在 generateBundle 阶段
    // 把 JS/CSS 塞进 HTML 的，transformIndexHtml 跑得比它早，改了会被覆盖。
    closeBundle() {
      const file = nodePath.resolve(process.cwd(), outDir, 'index.html');
      if (!fs.existsSync(file)) return;
      let html = fs.readFileSync(file, 'utf8');

      html = html
        .replace(/<script type="module"/g, '<script')
        .replace(/\s+crossorigin(="")?/g, '')
        .replace(/<link rel="modulepreload"[^>]*>/g, '');

      // 内联脚本的 defer 是无效的（HTML 规范：defer 只作用于外部脚本），
      // 而入口脚本位于 <head>，直接执行时 #root 还没被解析。
      // 把整段脚本搬到 </body> 之前，靠文档顺序保证 DOM 就绪。
      const m = html.match(/<script>[\s\S]*?<\/script>/);
      if (m && html.includes('</body>')) {
        html = html.replace(m[0], '').replace('</body>', m[0] + '</body>');
      }

      fs.writeFileSync(file, html, 'utf8');
      console.log('[cmc] 单文件已降级为经典脚本（可 file:// 双击运行）');
    },
  };
}

/**
 * 转义代码里的字面量 `</script>`。
 *
 * 内联脚本的经典陷阱：只要 JS 字符串中出现 `</script>`，HTML 解析器就会
 * 提前闭合脚本块，后半段代码被当成 HTML 文本，页面直接崩掉（表现为白屏、
 * 且 #root 被挤到文档末尾）。`<\/script>` 在 JS 里与 `</script>` 完全等价，
 * 所以改写是安全的。必须在内联之前（renderChunk 阶段）处理。
 */
function escapeScriptCloseTag(): Plugin {
  return {
    name: 'cmc-escape-script-close-tag',
    renderChunk(code) {
      return code.replace(/<\/script>/g, '<\\/script>');
    },
  };
}

/**
 * 两种构建模式：
 * - 默认（`npm run build`）：产出 dist/，用于部署 GitHub Pages 或打包 App
 * - single（`npm run build:single`）：产出单个 HTML，双击即可运行
 *
 * base 统一用 './'，保证子目录部署与 file:// 场景都能定位资源。
 */
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    plugins: [
      react(),
      ...(single ? [escapeScriptCloseTag(), viteSingleFile(), classicScript()] : []),
    ],
    base: './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      cssCodeSplit: false,
      // single 模式下把字体等资源内联成 data URI，
      // 否则 file:// 打开时 KaTeX 字体取不到，公式排版会错乱
      assetsInlineLimit: single ? 100_000_000 : 4096,
      ...(single
        ? {
            modulePreload: false,
            target: 'es2019',
            rollupOptions: {
              output: { format: 'iife', inlineDynamicImports: true },
            },
          }
        : {}),
    },
    server: {
      host: true,
      port: 5173,
    },
  };
});
