# CMC Lab

> 全国大学生数学竞赛（CMC）备考助手 —— 一套代码，同时跑在网页与手机 App 上。

[中文](#功能特性) | [English](#features)

[![CI](https://github.com/Ruan1027/cmc-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/Ruan1027/cmc-lab/actions/workflows/ci.yml)
[![Pages](https://github.com/Ruan1027/cmc-lab/actions/workflows/pages.yml/badge.svg)](https://github.com/Ruan1027/cmc-lab/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

CMC Lab 是一个完全离线可用的竞赛备考工具：内置 101 道历年真题（第 10–17 届，含补赛），  
支持**按知识模块追踪进度**、**限时整卷模考**、**错题复盘**与**公式速查**，  
并根据你的报考组别和剩余备考时间自动生成每日任务。

它不是又一个「能刷题的页面」，而是一个**有目标、有节奏、可复盘**的备考系统。

## 仓库地址

- GitHub（主仓库）：https://github.com/Ruan1027/cmc-lab
- **主在线版（带云同步）**：https://cmc-lab.app.workbuddy.host
- GitHub Pages（**纯本地**开源版）：https://ruan1027.github.io/cmc-lab/
- Gitee（国内镜像）：配置中，见 [docs/GITEE.md](./docs/GITEE.md)

**为什么有两个在线版？**

同一个代码库，构建时注入了云配置就是「主在线版」（可注册账号、跨设备同步），
没注入就是「纯本地版」——数据只落在你自己的浏览器里，不发任何网络请求。

云配置（`cloud.config.json`）**不在仓库里**，所以：

- 你 fork 下来的仓库构建出的是**纯本地版**，不会被指到本项目作者的后端上
- GitHub Pages 由本仓库 CI 自动部署，同样没有云配置 → 也是纯本地版
- 想自己接后端，见 [docs/CLOUD.md](./docs/CLOUD.md)

**不想装环境？** 直接打开上面的主在线版，或到
[Releases](https://github.com/Ruan1027/cmc-lab/releases/latest) 下载单文件版
（约 2 MB，双击即用，完全离线、纯本地）。

```bash
git clone https://github.com/Ruan1027/cmc-lab.git
cd cmc-lab && npm install && npm run dev
```

---

## 功能特性

| 模块        | 说明                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| 🎯 备考     | 设置报考组别与初赛日期 → 倒计时、覆盖率、每日题量建议、今日任务（错题优先 → 薄弱点 → 新题）、8 周打卡日历               |
| 🧭 知识模块 | 按 14 个一级知识域统计「覆盖率 + 正确率」，一眼看出哪个模块是短板                                                       |
| 📝 练习     | 选择 / 填空 / 解答三种题型；填空支持 LaTeX 等价判定；解答题自评并留存解题思路                                           |
| ⏱ 限时模考  | 选整套真题，倒计时作答（**过程中不显示对错**），超时自动交卷，交卷后出成绩报告与失分知识点                              |
| ❌ 错题本   | 记录错误次数、错因、最近错误时间；**SM-2 间隔重复调度**：到期自动召回复习（含已掌握题的长间隔巩固）；支持重做与标记掌握 |
| 📊 统计     | 总正确率、连续打卡、薄弱知识点、题型 / 难度 / 届次正确率                                                                |
| 📖 公式手册 | 43 条核心公式定理，12 个模块，支持搜索，KaTeX 渲染                                                                      |
| 📢 竞赛资讯 | 赛制、赛程规律、备考经验（数据源与页面解耦，方便后续接官方通知）                                                        |
| 📥 题库管理 | 拖拽导入 Markdown、JSON 备份导出/恢复、题库搜索与预览                                                                   |
| 📲 离线安装 | PWA：可「安装到桌面/手机」，首次在线访问后断网（地铁、考场外）也能刷题；支持一键安装提示                              |
| ☁️ 多端云同步 | 登录账号后，学习数据（进度/错题/统计/模考/设置）跨设备自动同步；用户名/邮箱 + 密码登录，后端为 WorkBuddy 云服务 |

**题库构成**：第 10–14 届非数学类（含 13 届补赛、14 届第二次补赛）71 题 + 第 15–17 届非数学 A 类 30 题。

> ⚠️ 组别说明：2022 年及以前只有「非数学类」一卷，A/B 类考生都考它；2023 年（第 15 届）起才分 A、B 卷。  
> 因此报**非数学 A 类**时，练习范围 = A 类卷 + 往年非数学类旧卷（即内置题库全部适用）。

---

## 使用方式

四种，按你的习惯选：

| 方式                 | 适合                | 怎么做                                                                                                                 |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **主在线版**         | 想跨设备同步        | 打开 <https://cmc-lab.app.workbuddy.host>，注册账号（用户名 + 邮箱 + 密码）后学习数据自动跟着账号走                      |
| **GitHub Pages 版**  | 不想注册、只在本机用 | 打开 [在线版](https://ruan1027.github.io/cmc-lab/)（纯本地，数据存在你浏览器里，不联网）                                 |
| **下载单文件**       | 想离线、双击就用    | 到 [Releases](https://github.com/Ruan1027/cmc-lab/releases) 下载最新版的 `CMC-Lab-<版本>.html`，双击打开，无需任何环境   |
| **本地开发**         | 改代码              | `npm install && npm run dev` → http://localhost:5173                                                                   |
| **构建部署**         | 自己发布 / 打包 App | `npm run build` → `dist/`                                                                                              |

想自己生成单文件：`npm run build:single`（产物在 `dist/index.html`，复制出来即可双击运行）。
每个版本发布时会自动构建并挂到 Release 附件，见 [.github/workflows/release.yml](./.github/workflows/release.yml)。

> 为什么不能直接双击项目根目录的 `index.html`？
> 那是 Vite 的**入口模板**，引用的是未编译的 `src/main.tsx`，且浏览器在 `file://` 下
> 会因 CORS 拒绝加载 ES module。想免安装使用，走上面的「在线用」或「下载单文件」。
>
> 单文件模式为兼容 `file://` 做了三件事：打包成 IIFE 经典脚本（不是 module）、
> 转义代码里的字面量 `</script>`（否则 HTML 会提前闭合脚本块导致白屏）、
> 把脚本移到 `</body>` 前（`defer` 对内联脚本无效）。
>
> ⚠️ `file://` 下所有本地页面共享同一份浏览器存储，换浏览器或清缓存会丢数据。
> 重要进度请定期用「题库」页的**导出备份**存一份 JSON。

## 快速开始

```bash
# 需要 Node >= 20
npm install
npm run dev           # 本地开发 http://localhost:5173
npm run build         # 类型检查 + 生产构建（dist/）
npm run build:single  # 单文件 HTML，可双击运行
npm test              # 运行单元测试
npm run lint          # 代码检查
```

打包移动端（需先装好 Android Studio / Xcode）：

```bash
npm run cap:sync            # 构建并把 dist 同步到原生工程
npm run cap:android         # 打开 Android Studio
npm run cap:ios             # 打开 Xcode（仅 macOS）
```

首次添加原生平台：`npx cap add android` / `npx cap add ios`。

---

## 技术选型与理由

多端复用与开发效率是本项目的第一约束（单人维护，要同时覆盖 Web 与 App）。对比过的主流方案：

| 方案                                      | 结论                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **React + TS + Vite + Capacitor（选用）** | 一套 TS/React 代码直接构建 Web，再套 Capacitor 打包 iOS/Android，逻辑 100% 复用；生态最大，简历与开源受众都认 |
| Flutter                                   | 移动端体验好，但 Web 输出弱，且要重写全部业务逻辑；Dart 对 KaTeX 这类生态支持差                               |
| React Native                              | 不能复用 Web 代码，等于维护两套                                                                               |
| uni-app / Taro                            | 国内小程序强，但 GitHub 国际受众几乎不认，Star 潜力低                                                         |

具体选择：

- **TypeScript strict**：开源项目的代码规范基线，`core/` 层零 `any` 外泄
- **Vite**：秒级冷启动；`import.meta.glob` 直接把 Markdown 题库打包进来
- **Capacitor**：把同一份 `dist` 变成原生 App，不需要为移动端写任何新代码
- **Zustand**：状态管理，比 Redux 轻一个数量级，中等规模刚好
- **KaTeX**：公式渲染比 MathJax 快一个数量级，且可离线打包（移动端刚需）
- **原生 CSS 变量**：不引入 Tailwind / UI 框架。本项目 UI 不复杂，原生 CSS 足够表达设计语言，少两个依赖、贡献者无需学额外约定
- **Vitest**：与 Vite 同源，零额外配置；核心算法全部有单测覆盖
- **可插拔存储适配器（MVP → IndexedDB → Cloud）**：仓储层抽象出统一 `StorageAdapter` 接口，`file://` 单文件走 localStorage（IndexedDB 在 file:// 不可靠），在线版 / 安装后的 App / Capacitor 走 IndexedDB（容量大、异步）；云端后端通过 `CloudAdapter` 包装本地适配器接入，**业务代码零改动**，未配置/未登录时自动退化为纯本地
- **账号体系：平台身份 = 邮箱，用户名是应用层的一层字典**：平台不支持用户名登录，也不存在「未经验证的密码注册」，所以注册先走邮箱验证码建号、再在 `accounts` 表登记用户名；登录时用户名先经服务端的口令闸门换回邮箱，再走平台密码登录。邮箱本身只对服务端可见（Server-only 表 + `SECURITY DEFINER` 函数），避免用户名→邮箱枚举。详见 [docs/CLOUD.md](./docs/CLOUD.md)
- **云 SDK 只在需要时打包**：单文件离线版通过 vite alias 把云 SDK 换成空壳，Release 附件不背这 ~75 KB；在线版才是真货

---

## 项目结构

```
cmc-lab/
├── src/
│   ├── core/           # 纯逻辑层：不依赖 React、不依赖浏览器 API，可单测、可迁移
│   │   ├── judge.ts      # 判题引擎：表达式等价性判定
│   │   ├── knowledge.ts  # 知识点体系（同义词归一 + 一级域划分）
│   │   ├── parser.ts     # Markdown 题库解析 / 反导出
│   │   ├── groups.ts     # 参赛组别与适用卷别
│   │   ├── stats.ts      # 统计与进度计算
│   │   ├── planner.ts    # 学习路径规划
│   │   ├── exam.ts       # 限时模考评卷
│   │   └── __tests__/    # 单元测试
│   ├── data/           # 内容数据
│   │   ├── bank/*.md     # 真题题库（Markdown，贡献友好）
│   │   ├── formulas.ts   # 公式手册
│   │   ├── pitfalls.ts   # 常见易错点库
│   │   └── news.ts       # 竞赛资讯
│   ├── cloud/          # 云服务客户端（配置读取 + SDK 单例 + 单文件空壳）
│   ├── storage/        # 持久化（仓储层，可替换实现；CloudAdapter 在此）
│   ├── auth/           # 账号：登录/注册状态机 + 用户名校验规则
│   ├── store/          # Zustand 全局状态
│   ├── components/     # 通用组件
│   ├── pages/          # 8 个页面
│   ├── types/          # 领域模型
│   └── styles/         # 原生 CSS
├── db/                 # 云端数据库结构（表 / RLS / 函数，逐条执行的权威记录）
├── docs/               # 架构说明、云同步设计、双平台仓库配置
├── scripts/            # 题库校验器、云探针、单文件校验等
└── .github/            # Issue / PR 模板、CI
```

**分层原则**：`core/` 是纯函数，输入明确、输出明确、无副作用。UI 只负责渲染与交互，  
业务规则一律下沉到 `core/`。这样将来接后端、换框架、加 CLI 都能直接复用。

---

## 添加自己的题目

题库是纯 Markdown，新增试题 = 往 `src/data/bank/` 丢一个 `.md`：

```markdown
## 2024 第十六届CMC预赛 非数学A类 填空1

类型: 填空
知识点: 极限, 等价无穷小
难度: 3
分值: 6
题目: 计算 $\lim_{x\to 0}\frac{\sin 3x}{x}$
答案: 3
备选: 3.0
思路: 用等价无穷小替换
易错点: 和差项中不能随便替换等价无穷小
解析:
当 $x\to 0$ 时 $\sin 3x \sim 3x$，故极限为 3。
```

也可以在应用内「题库」页直接拖拽导入。字段说明见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 路线图

- [x] 真题练习、判题、解析、错题本
- [x] 知识模块进度、限时模考、学习路径、公式手册
- [x] 间隔重复复习算法（SM-2：到期自动召回复习，已掌握题长间隔巩固）
- [x] PWA 离线安装（地铁、考场外也能刷，可「安装为 App」）
- [x] 持久化迁移到 IndexedDB（可插拔存储适配器：`file://` 走 localStorage，在线版/App 走 IndexedDB；将来云端后端同此接口接入，业务零改动）
- [x] 图片题支持（几何图形、函数图像：题干/解析可内嵌 `![](data:...)`，Markdown 图片语法，离线单文件版同样可用）
- [x] 题库导入校验器 CLI（`scripts/validate-bank.cjs`：`npm run validate` 手动跑，PR 触发 GitHub Actions 自动校验格式）
- [x] 学习报告导出（Markdown / PDF：总览、模块进度、各维度正确率、薄弱知识点、错题 TOP、到期复习、模考轨迹、备考建议，可导出 Markdown 或打印为 PDF）
- [x] 多端云同步（后端：WorkBuddy 云服务；用户名/邮箱 + 密码登录，仅同步学习数据，内置 101 题永远本地重建不同步）

欢迎提 Issue 或 PR，见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 多端云同步（v2.0.0）

登录账号后，你的**学习数据**会自动跨设备同步（手机 ↔ 电脑 ↔ 换浏览器），换设备/清缓存也不再丢进度。

### 同步什么

- **同步**：错题本、练习/模考记录、统计、设置、导入的自定义题库、复习调度标记
- **不同步**：内置 101 道真题。它们人人相同、本地永远由 `loadBuiltinProblems()` 重建，
  上传既冗余又会在多端互相覆盖，因此同步子集（`SyncedPayload`）只取学习数据

> **本机已有的进度不用手动搬**：注册后第一次登录会把本机数据**自动上传**到云端 ——
> 「先本地用、后注册」的老用户走的就是这条路径，不需要点任何按钮。换设备登录同一账号即可看到。
> 没有账号、只想在浏览器之间搬数据，则用「题库」页的导出 / 导入备份。

### 账号怎么用

| 步骤 | 填什么                                        |
| ---- | --------------------------------------------- |
| 注册 | 用户名 + 邮箱 → 收邮箱验证码 → 设密码 → 建号  |
| 登录 | 用户名 **或** 邮箱 + 密码                     |
| 忘记密码 | 邮箱 + 验证码 + 新密码                     |

用户名要**全站唯一**（大小写不敏感），已存在会提示「该用户名已存在，请重新设置」。
用户名支持 2–20 位中文 / 字母 / 数字 / 下划线。

> 平台不支持用户名登录，所以用户名是应用层加的一层字典：登录时先用用户名换回邮箱
> （服务端校验口令后才返回，防止拿用户名批量枚举邮箱），再走平台的邮箱 + 密码登录。

### 三种形态的定位

| 形态 | 云同步 | 数据存哪 | 联网 |
| --- | --- | --- | --- |
| **主在线版**（workbuddy.host 域名） | ✅ 登录后自动同步 | 云端 + 本机 | 是 |
| **GitHub Pages 版 / 自行 fork 构建** | ❌ 无账号入口 | 仅本机浏览器 | 否 |
| **单文件 Release 版** | ❌ 无账号入口 | 仅本机浏览器 | 否 |

后两种是同一个代码库在**没有** `cloud.config.json` 时的构建结果 —— 这是仓库里不含云配置的直接效果：
fork 下来就是纯本地开源版。

### 安全与隐私

- 数据库三张表全部开启行级权限（RLS）：`user_state` 只允许 `authenticated` 读写自己那一行；
  `accounts` / `account_secrets` 是 **Server-only**（开 RLS + 零策略 + 零 GRANT），只能经服务端函数访问
- **邮箱不作为可读字段暴露**：用户名→邮箱必须通过口令闸门，口令不对返回 `null`，无法区分
  「用户名不存在」和「密码错」
- 口令在服务端存 bcrypt 散列（`pgcrypto`），前端不接触、不落盘
- 同步采用 LWW（Last-Write-Wins）：云端 `updated_at` 晚于本地 `lastSyncAt` 才采用，避免把旧数据写回云端
- 云配置（`cloud.config.json`）不入仓库，`publishableKey` 只标识应用、不带权限，安全边界在服务端 Origin 精确匹配 + RLS

完整设计、自建后端的步骤、以及「哪些能验、哪些必须在发布域名上人工验」见
[docs/CLOUD.md](./docs/CLOUD.md)；表结构与函数定义见 [db/schema.sql](./db/schema.sql)。

---

## 参与贡献

- 提交题目纠错：用「题目纠错」Issue 模板
- 新增试题：直接 PR 一个 `.md` 文件到 `src/data/bank/`
- 功能建议：先用 Issue 讨论，避免重复劳动

## 许可证

[MIT](./LICENSE) —— 题库内容为公开真题整理，转载请注明来源。

---

<a name="features"></a>

## Features (English)

CMC Lab is an offline-first study tool for the **Chinese Mathematics Competitions (CMC)**.  
It ships with 101 past exam problems (10th–17th, non-math-major tracks), and provides:

- Knowledge-domain progress tracking (coverage + accuracy per module)
- Timed full-paper mock exams with automatic submission and score reports
- Wrong-answer book with reason tagging and spaced review
- Formula/theorem cheat sheet (43 entries, KaTeX)
- Personalized daily plan based on your track and days left before the exam

Built with React + TypeScript + Vite + Capacitor: one codebase for web, iOS and Android.

No install needed: use the [online version](https://ruan1027.github.io/cmc-lab/),
or download the single-file build from [Releases](https://github.com/Ruan1027/cmc-lab/releases).

```bash
npm install && npm run dev
```
