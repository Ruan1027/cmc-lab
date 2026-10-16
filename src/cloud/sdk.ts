/**
 * 云服务客户端单例
 *
 * 整个应用只初始化一个客户端：auth / database 共用同一份配置与同一套会话，
 * 登录后数据库请求会自动带上身份，业务层不需要手动搬 token。
 *
 * 未注入配置（纯本地构建）时 `getCloud()` 返回 null，调用方必须按 null 处理，
 * 不允许伪造一个假客户端。
 */
import { createWorkBuddyCloud, type WorkBuddyCloudClient } from '@tencent-ai/workbuddy-cloud-sdk';
import { getCloudConfig } from './cloudConfig';

let client: WorkBuddyCloudClient | null = null;
let failed = false;

export function getCloud(): WorkBuddyCloudClient | null {
  if (client) return client;
  if (failed) return null;
  const cfg = getCloudConfig();
  if (!cfg) return null;
  try {
    client = createWorkBuddyCloud({
      // endpoint 必须显式带上且只能来自 publicConfig：
      // 写死域名会在重新发布后失效，而服务端按 Origin 精确匹配必然拒绝
      endpoint: cfg.endpoint,
      publishableKey: cfg.publishableKey,
      oauthRelayBaseUrl: cfg.oauthRelayBaseUrl,
    });
    return client;
  } catch {
    // 配置不合法会在初始化阶段抛：这里降级为「没有云」，本地功能不受影响
    failed = true;
    return null;
  }
}
