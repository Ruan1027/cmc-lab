# 更新日志

本项目遵循 [Semantic Versioning](https://semver.org/)，格式参考 [Keep a Changelog](https://keepachangelog.com/)。

## [2.0.0] - 2026-10-16

多端云同步：登录账号后学习数据跨设备自动同步，换设备 / 清缓存不再丢进度。路线图最后一项完成。

### 修复

- **登录后不会自动同步**（用户实测报障）：`CloudAdapter.load()` 在「云端还没有该账号的记录」时直接返回本地数据、
  什么都不推，用户必须自己找到「上传本地数据到云端」按钮才会同步 —— 而界面文案写的是「登录后自动同步」。
  现在三个分支都补齐了：① 云端无记录 → 把本机数据作为**种子**自动推上去（「先本地用、后注册」的主路径）；
  ② 云端不比本地新、但本机内容已变（登出期间做的题、刚从别处导入的备份）→ 补推一次，云端不会长期落后；
  ③ 用同步子集指纹去重，避免每次打开页面都白写一次云端。种子推送成功还会给一句提示，
  用户不用靠猜判断「数据上去了没」
- **题库页找不到「导入备份」**：按钮一直都在，但叫「恢复备份」、又是次要样式，和「导出备份」并排时很容易被忽略。
  改名为「📥 导入备份文件」并提为主色；另加「粘贴备份文本导入」（手机上从聊天 / 邮件里复制过来即可，
  不必来回翻文件管理器），`accept` 补上 `application/json`

### 新增

- **账号体系与云同步**：右上角「账号」按钮 + 顶部同步状态指示；登录后 `CloudAdapter` 包装本地适配器自动推拉，
  未配置 / 未登录 / 离线时退化为纯本地，业务代码零改动；退出登录前先 flush 待推送改动，避免最后几秒的操作丢失
- **注册 / 登录**：注册 = 用户名 + 邮箱 → 收验证码 → 设密码 → 建号；登录 = 用户名 **或** 邮箱 + 密码；
  忘记密码 = 邮箱 + 验证码 + 新密码
- **用户名全站唯一**（大小写不敏感），冲突提示「该用户名已存在，请重新设置」；2–20 位中文 / 字母 / 数字 / 下划线
- **口令闸门**：用户名必须先经服务端口令校验才换回邮箱（`fn_login_email`），
  避免匿名调用者拿用户名批量枚举邮箱；口令不对返回 `null`，无法区分「用户名不存在」与「密码错」
- **同步子集（SyncedPayload）**：仅 `{wrongBook, stats, history, exams, settings, flags, importedProblems}`，
  **内置 101 题永远本地重建、不同步**，避免冗余上传与多端互相覆盖
- **LWW 合并**：云端 `updated_at` 晚于本地 `lastSyncAt` 才采用，防把旧数据写回云端
- **老用户迁移**：一键「上传本地数据到云端（合并）」，把升级前的本地进度首次推上去
- **`src/cloud/`**：`cloudConfig.ts`（公开配置读取 + 环境判断）、`sdk.ts`（SDK 单例）、
  `sdk-stub.ts`（纯本地构建时替换掉整个 SDK）
- **`src/storage/cloudBackend.ts`**：`RemoteBackend` 的云服务实现，走 SDK 的 `cloud.database`
- **`src/auth/username.ts`**：用户名校验规则（与数据库侧同名正则，前后端必须一致）
- **`db/schema.sql`**：三张表 + RLS + 5 个 `SECURITY DEFINER` 函数的权威记录
- **`cloud.config.example.json`**：云配置模板；真实 `cloud.config.json` 已 gitignore，仓库里没有任何后端地址
- **`scripts/e2e-cloud.mjs` + `npm run probe:cloud`**：零依赖数据面探针，验证「匿名该通的通、该拒的拒」，本机即可跑
- `docs/CLOUD.md`：云同步设计、自建后端步骤、自动化验证边界

### 后端选型

最初一版实现用的是 Supabase，**从国内访问不通**：`*.supabase.co` 的 DNS 正常、TCP 能连，
但 TLS 握手被重置（同 IP 段的 `api.supabase.com` 正常）—— 按域名（SNI）封锁，在线版对国内用户等于不可用。
最终改用 **WorkBuddy 云服务**：数据面与应用**同源**（都走 `/.cloud/**`，域名就是发布域名），国内可达，
并且省掉了自建数据库与邮件验证码这一整块运维。

### 安全

- 三张表全部开启行级权限（RLS）：`user_state` 只允许 `authenticated` 读写自己那一行；
  `accounts` / `account_secrets` 是 **Server-only**（开 RLS + 零策略 + 零 GRANT），只能经服务端函数访问
- 平台会给新建的表和函数**默认授予 `anon` 权限**，所以 Server-only 必须显式 `REVOKE`，
  函数还要单独 `REVOKE EXECUTE ... FROM anon`（只 `REVOKE FROM PUBLIC` 撤不掉那个显式授予）
- **匿名请求的 `auth.uid()` 返回字面量 `'anon'`（不是 NULL）**：给 `user_state` 授予 anon 的 INSERT 后，
  匿名 POST 真能建出 `owner_id = 'anon'` 的行 —— 所有未登录访客共用一行。已改为只授权 `authenticated`
- 口令在服务端存 bcrypt 散列（`pgcrypto`），前端不接触、不落盘；
  平台侧与 `account_secrets.pass_hash` 两份散列必须同步，改密后要调 `fn_sync_password_hash`
- 云端同步被拒（42501）与网络离线分开显示：「同步失败」而不是「离线」—— 前者要重新登录，后者只需等网络

### 架构

- 存储层 `StorageAdapter` 接口新增 `CloudAdapter` 实现；`selectAdapter` 在在线环境且**构建期注入了云配置**时自动包一层云端适配
- 三种交付形态由「有没有 `cloud.config.json`」决定：主在线版（带云同步）/
  GitHub Pages 与 fork 构建（纯本地，且不打包云 SDK）/ Release 单文件（纯本地离线匿名）
- 新增 `src/cloud/`、`src/storage/{remote,cloudBackend,cloudAdapter}.ts`、`src/auth/{username,useAuthStore}.ts`，
  全部走可 mock 的纯函数，便于单测
- 数据库：`user_state(owner_id PK DEFAULT auth.uid(), payload jsonb, updated_at, schema_version)` + 4 条 RLS 策略；
  账号相关的 5 个函数全部 `SECURITY DEFINER` 且钉死 `search_path`

### 未做

- **微信 / QQ / WorkBuddy 账号登录**：这类账号没有「邮箱 + 口令」这个锚点 —— 既没有密码可同步，
  也可能没有邮箱。硬塞进来会让「用户名 + 密码」这条链路直接断掉，需要另设计一套账号绑定流程，留待后续

### 测试

- `src/auth/__tests__/useAuthStore.test.ts`（14 项）：把「先发码、验码时不重发」这条契约钉死，
  覆盖用户名冲突、`isExistingUser` 分支、用户名换邮箱、建号后登记用户名失败仍保持登录、口令错误不暴露账号是否存在
- `src/auth/__tests__/username.test.ts`（5 项）：锁死与前端的共享规则
- `cloudAdapter.test.ts` 扩到 16 项：新增 `createCloudBackend` 的 7 项（写入不带 `owner_id`、
  删除先读 owner 再删、权限错误可识别）
- 全量：typecheck 0 / lint 0 / `npm test` 115 项通过 / 生产构建 + 单文件构建均通过，
  单文件 jsdom 真跑（101 题 + 43 处公式）/ `npm run probe:cloud` 对真实数据面 10 项全 PASS

## [1.6.0] - 2026-10-15

学习报告导出：把分散在练习、模考、错题、复习里的数据聚合成一份可复盘、可分享的备考报告。

### 新增

- 「报告」页（导航新增 📈 入口）：聚合总览、知识模块进度、各维度（题型/难度/届次）正确率、薄弱知识点、错题 TOP、到期复习队列、限时模考记录、近期练习轨迹、备考建议
- `src/core/report.ts`：纯函数 `buildReport(state)` 与 `reportToMarkdown(report)`，复用既有 `stats.ts` / `scheduler.ts` 统计逻辑，便于单测与复用
- 导出 Markdown：一键生成 `cmc-学习报告-YYYY-MM-DD.md`（UTF-8，`text/markdown`）
- 打印 / 导出 PDF：基于 `window.print` 零依赖实现，配套 `@media print` 样式只保留报告卡片，浏览器选「另存为 PDF」即可
- 报告自动给出备考建议（薄弱模块优先、到期复习催收、模考补强等）
- 新增 6 个报告单测（空数据 / 正常数据 / 薄弱点 / 到期复习 / Markdown 序列化 / 边界）

### 注意

- 报告页与导出逻辑全部走纯函数核心层，不触碰 DOM，与离线单文件版、在线版、App 三端共用同一份实现

## [1.5.0] - 2026-10-15

题库导入校验器 CLI：让社区贡献题目时格式可被机器检查，降低坏数据进仓库的概率。

### 新增

- `scripts/validate-bank.cjs`：零依赖题库格式校验脚本，`npm run validate` 即可运行
- 校验规则（与 `src/core/parser.ts` 字段规则保持一致）：题目/答案必填、组别/难度/分值合法性、图片 `data:` URI 有效性、公式定界符闭合、重复题目标题等
- 错误（缺字段、非法 data URI、标题重复）导致非零退出码，供 CI 拦截；警告（缺解析、外链图片、公式未闭合）不阻断
- `.github/workflows/validate.yml`：PR 或修改题库时自动运行校验
- 新增 7 个校验器单测（合法/缺答案/缺题目/非法 data URI/重复标题/公式未闭合）+ 真实 101 题集成测试

### 注意

- 校验器刻意与解析器保持同样「未知字段名并入上一已知字段」的吸收逻辑，避免把解析正文里的「证明：」「注：」误报为未知字段
- 当前内置 101 题校验零错误零警告

## [1.4.0] - 2026-10-15

图片题支持：题干、解析、思路、易错点等富文本字段现在可以内嵌图片。

### 新增

- `RichText` 支持 Markdown 图片语法 `![alt](src)`，在练习 / 模考 / 错题 / 题库页统一渲染
- 图片以 `data:` URI 内嵌，在线版与单文件 `file://` 离线版均可直接显示，无需额外构建或外链资源
- 题库新增格式说明：在 `题目:` / `解析:` 等字段里粘贴 `![](data:image/...)` 即可插图
- 新增 4 个 `RichText` 渲染单测（图片渲染、data URI 不截断、公式与图片共存、无图退化）

### 技术说明

- 刻意采用 data URI 而非 `public/figs` 外链资源：避免单文件 `file://` 离线场景断图，也省去一套资源管线
- 当前内置 101 题均为纯文本，暂无图形题；该能力为后续收录图形 / 函数图像题预留

## [1.3.0] - 2026-10-15

把持久化从「裸 localStorage」重构为可插拔存储适配器，为更大题库与将来的云端后端铺路。

### 新增

- **可插拔 `StorageAdapter` 接口**（`src/storage/`）：统一隔离「数据存哪、怎么存」，业务层只认接口不认实现
- **IndexedDB 适配器**：在线版 / 安装后的 App / Capacitor 改用 IndexedDB 持久化（容量大、异步写入，不再受 localStorage 5MB 上限约束）
- **`file://` 单文件模式自动走 localStorage**：IndexedDB 在 file:// 下不可靠，按运行环境自动选择，单文件双击体验不变
- **首次运行自动迁移**：旧版本写在 localStorage 的数据自动迁入 IndexedDB，并清理旧键（避免「重置后又复活」）

### 优化

- **「题库」页新增独立「💾 数据备份」卡片**：导出 / 恢复 / 重置按钮更醒目，并提示「清缓存会丢数据、请定期导出备份」，缓解无账号期的痛点
- 写入串行化（write-chain），快速连续保存不再互相打断事务

### 架构

- 将来接入云端后端（账号体系）只需再实现一个 `CloudAdapter`，store 与各页面无需改动

## [1.2.0] - 2026-10-15

支持「安装为 App」与离线使用，让备考不挑网络。

### 新增

- **PWA 离线安装**：新增 `manifest.webmanifest` 与 `public/icons/`（192/512 PNG + 满铺 maskable + SVG 矢量，
  沿用 favicon 的蓝色 ∑ 设计），可「安装到桌面/手机」，独立图标与启动屏
- **Service Worker 离线缓存**：`public/sw.js` 预缓存应用壳，导航请求 network-first + 回退缓存、
  静态资源 stale-while-revalidate；首次在线访问后即支持断网刷题（地铁、考场外）
- **安装提示横幅**：`PwaInstall` 组件监听 `beforeinstallprompt`，在满足条件时给出可关闭的「安装」入口；
  `main.tsx` 仅在「生产构建 + http(s)」下注册 SW，`file://` 单文件模式自动跳过

### 兼容性

- 零新增运行时依赖：PWA 用原生 manifest + 手写 Service Worker 实现，延续项目「少依赖」取向
- 图标由 `scripts/gen-icons.py`（纯标准库，无需 Pillow/ImageMagick）生成，CI 与普通开发机都能复现
- README 路线图勾选「PWA 离线安装」；功能特性表新增「离线安装」一行

### 测试

- 沿用既有 52 项单测；typecheck / lint 零问题
- 生产构建 `dist/` 含 `sw.js`、`manifest.webmanifest`、`icons/`；单文件 `build:single` 仍正常产出 2MB
  可 `file://` 双击运行的 HTML（无 module/preload 残留）

## [1.1.0] - 2026-10-15

把「凭感觉重做错题」升级为「按遗忘曲线安排复习」。

### 新增

- **间隔重复复习（SM-2）**：`core/scheduler.ts` 实现 SuperMemo SM-2 简化版——
  按每次复习结果调整记忆难度系数（easiness，1.3~2.5）与间隔（1 → 6 → interval×EF 天，上限 365 天），
  答错重置间隔、部分正确放缓增速；到期自动进入今日任务（优先级最高）
- **长间隔召回**：已掌握的题到期后仍会周期性召回复习，把短期记忆固化成长期记忆
- 错题本展示「下次复习时间」，待复习题置顶并提供一键「🔁 复习到期题」
- 统计页与备考概览新增「待复习」计数

### 兼容性

- 调度字段（easiness/interval/dueDate/reps）全部可选：升级前保存的旧错题
  没有这些字段，按「待复习的新卡片」兜底，首次升级即完整过一轮复习
- README 路线图勾选「间隔重复复习算法」；英文特性中 spaced review 自此名副其实

### 测试

- 新增 18 项单测：SM-2 爬坡阶梯（1→6→15→38）、答错重置、EF 上下限、
  间隔上限、到期判定与队列排序、旧数据兜底、与学习路径的集成
- 全量：typecheck / lint 零问题，52 项单测通过，生产构建与单文件
  `file://` 运行校验（101 题、43 处公式、零错误）通过

## [1.0.0] - 2026-10-14

首个正式版。MVP 的全部功能经过测试验证，并补齐了开源分发渠道。

### 新增

- **GitHub Pages 在线版**：推送即自动部署，免安装打开即用（`pages.yml`）
- **Release 单文件分发**：打 `v*` 标签自动构建 `CMC-Lab-<版本>.html` 并挂到 Release 附件，
  不装 Node 的用户下载双击即可运行（`release.yml`）
- favicon：内联 data-URI SVG，单文件构建下同样显示

### 修复

- README「使用方式」原先声称「仓库根目录的 `CMC Lab.html`」，该文件并不在仓库中，
  已改为在线版 / Releases / 自行构建三条真实路径
- 页面viewport 已移除 `maximum-scale=1`（禁用缩放伤及弱视用户，iOS 16+ 本就忽略）

### 测试

- 判题等价性、题库解析（101 题完整性）、组别模型、学习路径、评卷规则均覆盖单元测试
- 单文件产物经 `scripts/verify-singlefile.cjs` 在 `file://` 协议下验证：启动、101 题加载、
  KaTeX 渲染、零运行时错误

## [0.1.0] - 2026-10-14

首个可运行版本（MVP）。从单文件 HTML 应用重构为 React + TypeScript + Vite 多端工程。

### 新增

- **备考页**：报考组别、初赛日期倒计时、每日目标、覆盖率、知识模块进度、今日任务、8 周打卡日历
- **限时模考**：整套真题计时作答，过程中不反馈对错，超时自动交卷，交卷生成成绩报告与失分知识点
- **练习**：选择 / 填空 / 解答三题型，填空支持 LaTeX 等价判定，解答题自评并留存思路
- **错题本**：错误次数、错因、标记掌握，未掌握错题自动进入每日任务
- **统计**：总正确率、连续打卡、薄弱知识点、题型 / 难度 / 届次正确率
- **公式手册**：43 条公式定理，12 个模块，支持搜索
- **竞赛资讯**：赛制与赛程规律（静态数据，数据源与页面解耦）
- **题库管理**：拖拽导入 Markdown、JSON 备份导出/恢复、搜索与预览
- 内置题库 101 题（第 10–17 届，含补赛）

### 架构

- 核心算法（判题、知识点、统计、学习路径、评卷）抽到 `src/core/`，纯函数、无 DOM 依赖、可单测
- 持久化抽象为仓储层，MVP 用 localStorage，预留 IndexedDB
- 题库以 Markdown 存放，构建时由 Vite 打包，贡献门槛最低

### 测试

- 判题等价性、题库解析（101 题完整性）、组别模型、学习路径、评卷规则均覆盖单元测试

### 迁移说明

旧版单文件 `CMC判题系统_v2.html` 不再维护，其判题引擎与内容数据已由
`scripts/extract-core.cjs`、`scripts/extract-data.cjs` 程序化迁移，逻辑保持一致。
