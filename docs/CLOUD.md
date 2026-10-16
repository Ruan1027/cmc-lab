# 云同步设计（v2.0.0）

这份文档回答三件事：**为什么这么设计**、**fork 下来会是什么样**、**怎么自己接一套后端**。

---

## 1. 三种形态，一个代码库

构建时是否注入云配置，决定产物是哪一种形态：

| 形态 | 云配置 | 账号入口 | 数据 | 联网 |
| --- | --- | --- | --- | --- |
| **主在线版** | ✅ 注入 | 有 | 云端 + 本机 | 是 |
| **GitHub Pages / 自行 fork** | ❌ 无文件 → `null` | 隐藏 | 仅本机 | 否 |
| **单文件 Release** | ⛔ 强制 `null` | 隐藏 | 仅本机 | 否 |

配置来源是仓库根目录的 `cloud.config.json`，它**被 .gitignore 排除**。所以：

- 仓库里没有任何后端地址，fork 出来构建就是纯本地版 —— 不会被指到别人的后端上
- 单文件构建额外强制注入 `null`，并用 vite alias 把云 SDK 换成空壳（省约 75 KB），
  保证 Release 附件是名副其实的「离线纯本地」

---

## 2. 后端选了 WorkBuddy 云服务

### 为什么换掉原来的 Supabase

最初一版实现用的是 Supabase。**从国内访问不通**：`*.supabase.co` 的 DNS 正常、
TCP 能连，但 TLS 握手被重置（同 IP 段的 `api.supabase.com` 正常）—— 典型的按域名（SNI）封锁。
用户自己就是靠加速器才能进去，那么面向国内用户的在线版等于不可用。

WorkBuddy 云服务的数据面与应用**同源**（都走 `/.cloud/**`，域名就是发布域名），
国内可达，所以换了过来。顺带白得了数据库 + 邮件验证码这套设施，不需要自己运维。

### 硬约束（决定了整个账号模型）

平台有两条不能绕的限制：

1. **不支持用户名登录**，也没有「用户名 + 密码注册」这种端点
2. **不存在未经验证的密码注册** —— 建号必须持有验证码换来的 `verificationToken`

所以用户名不可能是平台身份。方案是：**平台身份 = 邮箱，用户名 = 应用层的一层字典。**

---

## 3. 账号模型

### 注册

```
用户填：用户名 + 邮箱
  ├─ 客户端先查 fn_username_available  ← 冲突就地提示「该用户名已存在，请重新设置」
  ├─ cloud.auth.sendOtp({ email })      ← 拿到 verificationId / isExistingUser
  └─ 用户填：邮箱验证码 + 密码
       ├─ cloud.auth.verifyOtp({ email, verificationId, isExistingUser, token, password })
       │     └─ 平台建号（邮箱 + 密码），返回会话   ← 平台身份在这里确定
       └─ rpc fn_register_account(username, email, password)
             └─ 一次事务写 accounts + account_secrets
```

两个细节：

- **用户名预检只是体验优化**，权威判定在 `fn_register_account` 里（同一张表 + 唯一索引）。
  所以即使两个人同时抢一个用户名，后到的那个也会拿到 `username_taken`，而不是建出重复用户名。
- **建号成功但用户名没登记上**（比如网络断在中间）不会把用户踢出去，而是降级成
  「补设用户名」的界面 —— 账号已经存在，不能因为一次失败就让人登不进来。

### 登录

```
用户填：用户名 或 邮箱 + 密码
  ├─ 含 @ → 直接走平台密码登录
  └─ 不含 @ → rpc fn_login_email(username, password) 换回邮箱，再走平台密码登录
```

`fn_login_email` 是**口令闸门**：只有口令正确才返回邮箱，否则返回 `NULL`。
这样匿名调用者既拿不到邮箱，也无法区分「用户名不存在」和「密码错」。

### 口令为什么存两份

平台侧存的是真凭据（登录用），`account_secrets.pass_hash` 存的是闸门用的 bcrypt。
两条会改到平台口令的路径，改完必须调 `fn_sync_password_hash` 同步闸门：

- 忘记密码：`resetPasswordForEmail` → `challenge.updateUser({ nonce, password })`

漏了同步会怎样：邮箱登录照样成功，但用户名登录会被闸门挡掉，报「用户名或密码错误」。

### 为什么本期没有微信 / QQ / WorkBuddy 账号登录

它们没有「邮箱 + 口令」这个锚点：这类账号既没有密码可同步，也（对 WorkBuddy 账号而言）
可能没有邮箱。硬塞进来会让「用户名 + 密码」这条链路直接断掉 —— 用户名换不到可登录的凭据。
要支持它们需要引入一套账号绑定与补设密码的流程，属于另一期的设计。

---

## 4. 数据面与权限

三张表，都开了 RLS。表结构与函数定义逐条记录在 [`db/schema.sql`](../db/schema.sql)。

| 表 | 谁能碰 | 说明 |
| --- | --- | --- |
| `user_state` | `authenticated`，仅自己那一行 | 学习数据快照，`owner_id` 由 `DEFAULT auth.uid()` 填 |
| `accounts` | 谁都碰不到，只能经服务端函数 | `username` → `owner_id` 字典（Server-only） |
| `account_secrets` | 谁都碰不到，只能经服务端函数 | 邮箱 + bcrypt 散列（Server-only） |

### 两个容易踩的坑（都实测踩过）

1. **平台会给新建的表和函数默认授予 `anon` / `authenticated` 权限。**
   所以「只给服务端用」不能只靠「开 RLS + 不建策略」，必须显式 `REVOKE ALL ... FROM anon, authenticated`。
   否则哪天有人顺手加了一条策略，权限立刻就漏了。

2. **匿名请求的 `auth.uid()` 返回字面量 `'anon'`，不是 NULL。**
   实测：给 `user_state` 授予 anon 的 INSERT 权限后，匿名 POST 会成功建出
   `owner_id = 'anon'` 的行 —— **所有未登录访客共用同一行**。
   所以 `user_state` 只授权给 `authenticated`。

客户端侧也有两条规矩：

- **写入不带 `owner_id`**：它由数据库 DEFAULT 填，`WITH CHECK (owner_id = auth.uid())` 挡伪造
- **读取不按 `owner_id` 过滤**：RLS 已经把可见行限制成自己的那一行，
  这样也不必假设 `session.user.id` 与 `auth.uid()` 字面量完全一致

---

## 5. 自己接一套后端

1. 开通 WorkBuddy 云服务，拿到 `publicConfig`（四个字段：`resourceId` / `endpoint` /
   `oauthRelayBaseUrl` / `publishableKey`）
2. 照 [`db/schema.sql`](../db/schema.sql) 逐条执行建表、RLS、函数、权限
   （平台要求**一次一条语句**，执行入口是 WorkBuddy 内置的云数据库 SQL 工具）
3. 把配置写进 `cloud.config.json`（照 [`cloud.config.example.json`](../cloud.config.example.json)）：
   ```json
   {
     "resourceId": "wbcs_...",
     "endpoint": "https://your-app.app.workbuddy.host",
     "oauthRelayBaseUrl": "https://www.workbuddy.cn/v2/as/genie-baas/oauth",
     "publishableKey": "wbpk_..."
   }
   ```
4. `npm run probe:cloud` —— 匿名侧的权限边界应当全部 PASS
5. 构建并发布；**发布域名必须与 `endpoint` 一致**（服务端按 Origin 精确匹配，
   换域名就会全盘 401）

---

## 6. 验证边界：哪些能自动验，哪些必须人工

自动化能覆盖的（`npm run probe:cloud`，本机就能跑）：

- 域名可达、`publishableKey` 被接受
- `fn_username_available` / `fn_login_email` 匿名可调且行为正确
- `accounts` / `account_secrets` / `user_state` 对匿名一律 `DATABASE_42501`
- `fn_register_account` / `fn_get_username` / `fn_sync_password_hash` 对匿名一律拒绝

**自动化测不到的**：登录之后的整条链路（真实会话 → 网关映射成 `authenticated` 角色 →
RLS 放行 → 读写成功）。本机跑不了 —— `localhost` 和预览域名都不在服务端的 Origin 白名单里，
平台会直接拒绝。所以这一段必须在**发布域名**上人工走一遍：

1. 注册：用户名 + 邮箱 + 验证码 + 密码 → 能进主界面，右上角显示用户名
2. 换个浏览器（或手机）用**用户名 + 密码**登录 → 能看到同一份学习数据
3. 做题后下拉刷新，另一台设备上能看到刚才的进度变化
4. 用邮箱 + 密码登录 → 同样能进
5. 「忘记密码」走一遍 → 重置后**用户名登录仍然可用**（这一步验证闸门散列同步没漏）

第 5 步最容易漏，改动密码相关逻辑后务必重跑。
