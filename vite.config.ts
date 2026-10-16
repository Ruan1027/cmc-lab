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
      //
      // ⚠️ 替换串是**整个 bundle**，必须用函数形式 `() => ...`：
      // String.replace 会把替换串里的 `$&` / `$'` / `` $` `` / `$1` 当特殊模式展开。
      // 压缩后的第三方代码里出现 `$&` 完全正常（KaTeX 里有 `var $ = ...; $ && ...`，
      // 压成一行的 `$&&(` 正好命中 `$&`），一旦被展开就会把 `</body>` 之类的 HTML
      // 塞进 JS 里，报 `SyntaxError: Unexpected token '<'`，页面直接白屏。
      const m = html.match(/<script>[\s\S]*?<\/script>/);
      if (m && html.includes('</body>')) {
        const block = m[0];
        html = html.replace(m[0], () => '').replace('</body>', () => `${block}</body>`);
      }

      fs.writeFileSync(file, html, 'utf8');
      // eslint-disable-next-line no-console
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
 * 读取云服务公开配置并注入构建产物。
 *
 * 配置放在仓库根目录的 cloud.config.json（已 gitignore，**不进仓库**），
 * 只提交 cloud.config.example.json 作模板。这样：
 *   - 在线版构建时注入真实配置 → 云同步可用
 *   - fork 下来的仓库没有该文件 → 构建出纯本地版，不会被指到别人的后端上
 *   - single 单文件模式强制注入 null → Release 附件永远是纯本地匿名
 *
 * 注入的是 define 常量而不是运行时 fetch：配置必须在首屏同步可用，
 * 否则「有没有账号入口」这类 UI 判断会闪一下。
 */
function loadCloudConfigLiteral(single: boolean): string {
  if (single) return 'null';
  const file = nodePath.resolve(process.cwd(), 'cloud.config.json');
  if (!fs.existsSync(file)) return 'null';
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
    const cfg = {
      resourceId: String(raw.resourceId ?? ''),
      endpoint: String(raw.endpoint ?? ''),
      oauthRelayBaseUrl: String(raw.oauthRelayBaseUrl ?? ''),
      publishableKey: String(raw.publishableKey ?? ''),
    };
    if (!cfg.endpoint || !cfg.publishableKey) return 'null';
    return JSON.stringify(cfg);
  } catch {
    return 'null';
  }
}

function hasCloudConfig(): boolean {
  return fs.existsSync(nodePath.resolve(process.cwd(), 'cloud.config.json'));
}

/**
 * 两种构建模式：
 * - 默认（`npm run build`）：产出 dist/，用于部署在线版或打包 App
 * - single（`npm run build:single`）：产出单个 HTML，双击即可运行
 *
 * base 统一用 './'，保证子目录部署与 file:// 场景都能定位资源。
 */
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  // 没有云配置（GitHub Pages / fork）或单文件版 → 把云 SDK 换成空壳。
  // 「纯本地版」语义上就不该带云客户端代码，顺带省约 75 KB。
  const stubCloudSdk = single || !hasCloudConfig();
  return {
    plugins: [
      react(),
      ...(single ? [escapeScriptCloseTag(), viteSingleFile(), classicScript()] : []),
    ],
    define: {
      __CMC_CLOUD_CONFIG__: loadCloudConfigLiteral(single),
    },
    base: './',
    resolve: {
      alias: [
        ...(stubCloudSdk
          ? [
              {
                find: /^@tencent-ai\/workbuddy-cloud-sdk$/,
                replacement: fileURLToPath(new URL('./src/cloud/sdk-stub.ts', import.meta.url)),
              },
            ]
          : []),
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
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
      // host: true → 监听 0.0.0.0。反向代理/预览环境需要一个固定端口，
      // 优先用注入的 PORT，本地开发回落到 5173。
      host: true,
      port: Number(process.env.PORT) || 5173,
      // 反代域名的 Host 与 localhost 不同，Vite 6 默认会以
      // "Blocked request. This host is not allowed." 拒绝；开发服务器不做 Host 校验。
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: Number(process.env.PORT) || 4173,
      allowedHosts: true,
    },
  };
});
