/**
 * WorkBuddy 云服务公开配置
 *
 * 四项值全部来自开通云服务时下发的 `publicConfig`，**没有任何密钥**：
 *   - resourceId       云服务资源 id（诊断用）
 *   - endpoint         本应用发布域名的数据面基址（`/.cloud/**` 就在这个域下）
 *   - oauthRelayBaseUrl 中心 OAuth Relay 基址（网页第三方登录用，本期未用）
 *   - publishableKey   只标识「哪个应用」，不携带权限；安全性由服务端 Origin 精确匹配保证
 *
 * 为什么本地不能直连：服务端按 Origin 精确匹配放行，`localhost` 与预览域名不在白名单里，
 * 所以云同步只能在发布域名上实测。这是平台边界，不是代码缺陷。
 *
 * 三层取值，优先级从高到低：
 *   1. 构建期注入的 `__CMC_CLOUD_CONFIG__`（由 vite.config.ts 读根目录 cloud.config.json 生成）
 *   2. 没有该文件 / 字段不全 / single 单文件模式 → `null`：云同步整体关闭，退化为纯本地
 *
 * 仓库里**不含**真实配置（cloud.config.json 已 gitignore，只提交 example），
 * 因此 fork 下来的仓库默认是纯本地版，不会被指到别人的后端上。
 */
export interface CloudPublicConfig {
  resourceId: string;
  endpoint: string;
  oauthRelayBaseUrl: string;
  publishableKey: string;
}

/** 构建期常量，由 vite 的 define 注入；未注入（vitest / 未配置）时为 undefined */
declare const __CMC_CLOUD_CONFIG__: CloudPublicConfig | null | undefined;

function stripSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** 读取公开配置；不可用时返回 null（此时云功能全部关闭，不影响本地使用） */
export function getCloudConfig(): CloudPublicConfig | null {
  const injected = typeof __CMC_CLOUD_CONFIG__ === 'undefined' ? null : __CMC_CLOUD_CONFIG__;
  if (!injected || !injected.endpoint || !injected.publishableKey) return null;
  return {
    resourceId: injected.resourceId ?? '',
    endpoint: stripSlash(injected.endpoint),
    oauthRelayBaseUrl: stripSlash(injected.oauthRelayBaseUrl ?? ''),
    publishableKey: injected.publishableKey,
  };
}

/**
 * file:// 单文件协议判断。
 *
 * 单文件版（Release 附件）定位是**纯本地匿名**：不接任何后端、不出现登录入口、
 * 不发任何网络请求。因此协议判断是硬开关，优先级高于「有没有配置」。
 */
export function isFileProtocol(): boolean {
  return typeof location !== 'undefined' && location.protocol === 'file:';
}

/** 当前环境是否启用云同步（在线版 / App 且注入了配置） */
export function cloudEnabled(): boolean {
  return !isFileProtocol() && getCloudConfig() !== null;
}

/** file:// 或 App（capacitor://localhost）等非云端环境的统一判断，供 UI 文案使用 */
export function cloudDisabledReason(): string | null {
  if (isFileProtocol()) return '单文件离线版不启用云同步';
  if (typeof location !== 'undefined' && location.protocol === 'capacitor:') {
    return 'App 版不启用云同步（数据保存在本机）';
  }
  if (!getCloudConfig()) return '当前构建未接入云服务';
  return null;
}
