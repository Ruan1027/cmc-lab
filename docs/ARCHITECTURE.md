# 架构说明

## 分层

```
┌─────────────────────────────────────────┐
│ pages / components   React 视图层        │  只做渲染与交互
├─────────────────────────────────────────┤
│ store                Zustand 全局状态     │  组合 core，负责持久化时机
├─────────────────────────────────────────┤
│ core                 纯逻辑（无 DOM）      │  判题 / 知识点 / 统计 / 规划 / 评卷
├─────────────────────────────────────────┤
│ data / storage       内容与持久化         │  Markdown 题库、仓储接口
└─────────────────────────────────────────┘
```

依赖方向严格自上而下：`pages → store → core`。`core` 不反向依赖任何上层。

## 为什么 core 必须纯

- **可测试**：判题引擎有几十个边界用例（嵌套分数、隐式乘号、Unicode 符号），纯函数最容易覆盖
- **可迁移**：将来加后端或 CLI，`core/` 直接复用，不用重写业务规则
- **可推理**：输入确定则输出确定，排查 bug 不用关心 React 渲染时机

## 数据流

```
Markdown 题库 ──parseMarkdown──▶ Problem[]
                                    │
用户作答 ──submitAnswer──▶ answerMatch（判题）
                                    │
                          recordResult（store）
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
                stats 累加      wrongBook        history
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                          localStorage（仓储）
```

## 关键模块

### core/judge.ts —— 判题引擎

数学答案写法千差万别（`\frac{\sqrt{3}}{2}` / `sqrt(3)/2` / `√3/2`），
又不适合引入 CAS（太重）。采用**归一化 + 数值兜底**两段式：

1. 归一化：Unicode→ASCII、LaTeX 展开（支持一层花括号嵌套）、补隐式乘号、剥冗余括号
2. 数值兜底：两边都能求值时按 1e-6 容差比较，`π`、`e`、根号都能算

安全：`tryEval` 先过危险词黑名单，再过算术字符白名单，最后才交给 `Function`。

### core/knowledge.ts —— 知识点体系

两级映射：原始标签 → 规范标签（同义词归一）→ 一级域。
归一化的意义是**统计口径不被稀释**：否则「分部积分」「分部积分法」「分部积分公式」会算成三个知识点。

### core/groups.ts —— 组别模型

CMC 组别沿革是易错点：

- 2022 年及以前：只有「非数学类」一卷
- 2023 年起：分「非数学 A 类」「非数学 B 类」

所以组别不是「等于」关系而是「包含」关系，用 `include` 数组表达。

### core/planner.ts —— 学习路径

优先级固定：到期复习（SM-2 调度）→ 错题 → 薄弱知识点新题 → 顺序新题。
每日题量由「未做题数 / 剩余天数」反推，与用户设定的目标对比后给出提示。

### core/scheduler.ts —— 间隔重复调度

SuperMemo SM-2 简化版（Anki 早期同源），纯函数：

- 输入：卡片状态（easiness/interval/reps）+ 复习结果，输出新状态与下次到期时间
- 间隔爬坡：1 天 → 6 天 → round(interval × EF)，上限 365 天
- 答错（q<3）间隔重置为 1 天、reps 归零；部分正确（q=3）EF 下调、增速放缓
- 调度字段挂在 `WrongEntry` 上且全部可选，旧数据由 `schedOf()` 兜底为
  「待复习的新卡片」——升级即触发首轮完整复习，无需写迁移代码

### storage/repository.ts —— 持久化

MVP 用 localStorage（零依赖，Capacitor 环境可用）。
已抽象为接口，题库规模上去后换 IndexedDB 即可，上层无需改动。

## 多端云同步（v2.0.0）

### 适配器分层

```
┌──────────────────────────────────────────────┐
│ CloudAdapter（有登录态时包装本地适配器）       │  load: 拉云端→mergeLWW→写回本地   │
│                                              │  save: 本地落盘 + 防抖上传         │
├──────────────────────────────────────────────┤
│ LocalStorageAdapter / IndexedDBAdapter        │  纯本地，按运行环境选择            │
├──────────────────────────────────────────────┤
│ RemoteBackend（Supabase 实现，零依赖 fetch）  │  PostgREST 读写 user_state 表      │
└──────────────────────────────────────────────┘
```

- `selectAdapter`：在线环境且存在 `getSupabaseConfig()` 时包一层 `CloudAdapter`；`file://` 永远不走云端
- 未配置 / 未登录 / 离线 → `CloudAdapter` 安全降级为纯本地，行为与旧版一致

### 同步子集与 LWW

- `toSyncedPayload(state, builtinIds)`：从全局状态抽取 `SyncedPayload`
  （`wrongBook/stats/history/exams/settings/flags/importedProblems`），**剥离内置 101 题**
- `mergeLWW(local, remote, lastSyncAt, builtin)`：仅当 `remote.updated_at > lastSyncAt` 才采用远端字段，避免把旧本地数据写回
- `applyPayload(local, payload, builtin)`：把云端数据合并回本地状态

### 登录（src/auth）

- `supabaseAuth.ts`：`loadSession/saveSession/clearSession`、`sha256Base64Url` + `randomUrlSafe`（PKCE）、
  `startGithubOAuth`（重定向）、`handleGithubCallback`（code 兑换 token）、`sendOtp` / `verifyOtp`（邮箱/手机号）
- `useAuthStore.ts`：Zustand store 封装登录态、同步状态机（`idle/syncing/synced/offline/error`）、`getAccessToken/getUserId`

### 后端形态

- 仅一个 `user_state(user_id PK, payload jsonb, updated_at timestamptz, schema_version int)` 表
- RLS 4 策略均限制 `auth.uid() = user_id`，用户只能读写自己的行
- 零依赖：因构建机缺 `@supabase/functions-js` 装不上官方 SDK，改用原生 `fetch` 直连 PostgREST + REST Auth

## 扩展点

| 想加什么        | 改动位置                                                      |
| --------------- | ------------------------------------------------------------- |
| 新题型          | `types/ProblemType` + `pages/PracticePage` + `core/exam.ts`   |
| 新知识点        | `core/knowledge.ts` 的 `KNOWLEDGE_ALIAS` / `KNOWLEDGE_DOMAIN` |
| 换持久化        | 新增 `storage/` 实现，替换 store 中的调用                     |
| 接后端 / 云同步 | 在 `storage/` 加远端仓储，`core/` 完全不动                    |
| 新登录方式      | 在 `auth/supabaseAuth.ts` 加对应流程，`useAuthStore` 暴露入口 |
| 新公式          | `data/formulas.ts`                                            |
| 官方资讯源      | 替换 `data/news.ts` 的导出                                    |

## 分发

三种交付形态，全部由 CI 自动产出：

| 形态       | 触发                                                    | 工作流                       | 产物                                |
| ---------- | ------------------------------------------------------- | ---------------------------- | ----------------------------------- |
| 在线版     | 推送 `master`                                           | `pages.yml` → GitHub Pages   | `https://<user>.github.io/cmc-lab/` |
| 离线单文件 | 打 `v*` 标签                                            | `release.yml` → Release 附件 | `CMC-Lab-<版本>.html`（约 2 MB）    |
| 原生 App   | 手动 `npx cap add android/ios` 后 `npm run cap:android` | —                            | Android Studio / Xcode 工程         |

两个构建细节值得说明：

- **Pages 无需配置 base**：vite `base: './'` 产出相对路径，仓库页面在 `/cmc-lab/` 子路径下直接可用
- **单文件模式的三个坑**（实现在 `vite.config.ts` 的插件里，注释详尽）：IIFE 经典脚本
  （`file://` 下 module 被 CORS 拦截）、转义字面量 `</script>`（否则 HTML 提前闭合脚本块）、
  脚本移到 `</body>` 前（`defer` 对内联脚本无效）

## 测试策略

`npm test` 只测 `core/`（纯逻辑）+ 题库完整性：

- 判题等价性（含回归用例）
- 题库解析：101 题、字段完整、往返一致
- 组别模型：71 + 30 构成、A 类包含旧卷
- 学习路径与评卷规则

UI 不做快照测试（收益低、维护成本高），靠手工验证。
