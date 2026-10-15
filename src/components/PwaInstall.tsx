import { useEffect, useState } from 'react';

/**
 * 「安装为 App」提示横幅
 *
 * 浏览器在满足条件（https 部署、未被手动忽略过、用户有过交互）时，会派发
 * `beforeinstallprompt` 事件。我们拦截它、暂存事件对象，展示一个可关闭的横幅；
 * 用户点「安装」再真正调起系统安装弹窗。
 *
 * 注意：file:// 单文件模式与已安装环境下该事件不会触发，横幅自动不显示，
 * 无需特殊处理。
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstall() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!event || dismissed) return null;

  const install = async () => {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') setEvent(null);
    else setDismissed(true);
  };

  return (
    <div className="pwa-install">
      <span className="pwa-install__text">📲 可安装为 App，离线也能刷题</span>
      <div className="pwa-install__actions">
        <button className="pwa-install__btn" onClick={install}>
          安装
        </button>
        <button className="pwa-install__btn ghost" onClick={() => setDismissed(true)}>
          稍后
        </button>
      </div>
    </div>
  );
}
