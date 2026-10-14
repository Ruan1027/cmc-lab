# CMC Lab

> 全国大学生数学竞赛（CMC）备考助手 —— 一套代码，同时跑在网页与手机 App 上。

[中文](#功能特性) | [English](#features)

CMC Lab 是一个完全离线可用的竞赛备考工具：内置 101 道历年真题（第 10–17 届，含补赛），
支持**按知识模块追踪进度**、**限时整卷模考**、**错题复盘**与**公式速查**，
并根据你的报考组别和剩余备考时间自动生成每日任务。

它不是又一个「能刷题的页面」，而是一个**有目标、有节奏、可复盘**的备考系统。

---

## 功能特性

| 模块 | 说明 |
| --- | --- |
| 🎯 备考 | 设置报考组别与初赛日期 → 倒计时、覆盖率、每日题量建议、今日任务（错题优先 → 薄弱点 → 新题）、8 周打卡日历 |
| 🧭 知识模块 | 按 14 个一级知识域统计「覆盖率 + 正确率」，一眼看出哪个模块是短板 |
| 📝 练习 | 选择 / 填空 / 解答三种题型；填空支持 LaTeX 等价判定；解答题自评并留存解题思路 |
| ⏱ 限时模考 | 选整套真题，倒计时作答（**过程中不显示对错**），超时自动交卷，交卷后出成绩报告与失分知识点 |
| ❌ 错题本 | 记录错误次数、错因、最近错误时间；支持重做与标记掌握；未掌握错题自动进入每日任务 |
| 📊 统计 | 总正确率、连续打卡、薄弱知识点、题型 / 难度 / 届次正确率 |
| 📖 公式手册 | 43 条核心公式定理，12 个模块，支持搜索，KaTeX 渲染 |
| 📢 竞赛资讯 | 赛制、赛程规律、备考经验（数据源与页面解耦，方便后续接官方通知） |
| 📥 题库管理 | 拖拽导入 Markdown、JSON 备份导出/恢复、题库搜索与预览 |

**题库构成**：第 10–14 届非数学类（含 13 届补赛、14 届第二次补赛）71 题 + 第 15–17 届非数学 A 类 30 题。

> ⚠️ 组别说明：2022 年及以前只有「非数学类」一卷，A/B 类考生都考它；2023 年（第 15 届）起才分 A、B 卷。
> 因此报**非数学 A 类**时，练习范围 = A 类卷 + 往年非数学类旧卷（即内置题库全部适用）。

---

## 快速开始

```bash
# 需要 Node >= 20
npm install
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 类型检查 + 生产构建
npm test           # 运行单元测试
npm run lint       # 代码检查
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

| 方案 | 结论 |
| --- | --- |
| **React + TS + Vite + Capacitor（选用）** | 一套 TS/React 代码直接构建 Web，再套 Capacitor 打包 iOS/Android，逻辑 100% 复用；生态最大，简历与开源受众都认 |
| Flutter | 移动端体验好，但 Web 输出弱，且要重写全部业务逻辑；Dart 对 KaTeX 这类生态支持差 |
| React Native | 不能复用 Web 代码，等于维护两套 |
| uni-app / Taro | 国内小程序强，但 GitHub 国际受众几乎不认，Star 潜力低 |

具体选择：

- **TypeScript strict**：开源项目的代码规范基线，`core/` 层零 `any` 外泄
- **Vite**：秒级冷启动；`import.meta.glob` 直接把 Markdown 题库打包进来
- **Capacitor**：把同一份 `dist` 变成原生 App，不需要为移动端写任何新代码
- **Zustand**：状态管理，比 Redux 轻一个数量级，中等规模刚好
- **KaTeX**：公式渲染比 MathJax 快一个数量级，且可离线打包（移动端刚需）
- **原生 CSS 变量**：不引入 Tailwind / UI 框架。本项目 UI 不复杂，原生 CSS 足够表达设计语言，少两个依赖、贡献者无需学额外约定
- **Vitest**：与 Vite 同源，零额外配置；核心算法全部有单测覆盖
- **localStorage（MVP）**：零依赖且 Capacitor 环境可用；已抽象为仓储层，题库扩大后平滑迁移 IndexedDB

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
│   ├── storage/        # 持久化（仓储层，可替换实现）
│   ├── store/          # Zustand 全局状态
│   ├── components/     # 通用组件
│   ├── pages/          # 8 个页面
│   ├── types/          # 领域模型
│   └── styles/         # 原生 CSS
├── docs/               # 架构说明、双平台仓库配置
├── scripts/            # 一次性迁移脚本
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
- [ ] PWA 离线安装（地铁、考场外也能刷）
- [ ] 持久化迁移到 IndexedDB（支撑更大规模题库与作答历史）
- [ ] 图片题支持（几何图形、函数图像）
- [ ] 间隔重复复习算法（基于遗忘曲线安排错题重做）
- [ ] 题库导入校验器 CLI（PR 时自动检查格式）
- [ ] 学习报告导出（Markdown / PDF）
- [ ] 多端云同步（可选后端）

欢迎提 Issue 或 PR，见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

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

```bash
npm install && npm run dev
```
