import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles/index.css';
import { App } from './App';

const el = document.getElementById('root');
if (!el) throw new Error('#root not found');

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 注册 Service Worker：仅在「生产构建 + http(s) 协议」下生效。
// file:// 单文件模式（build:single）协议不是 http(s)，且本就离线，
// 因此跳过——避免无谓的 SW 注册失败报错。
if ('serviceWorker' in navigator && import.meta.env.PROD && self.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 注册失败不影响正常使用，仅失去离线能力 */
    });
  });
}
