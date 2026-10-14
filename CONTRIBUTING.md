# 贡献指南

感谢你愿意参与 CMC Lab。这个项目的目标是成为真正好用的竞赛备考工具，
任何形式的贡献都欢迎：纠错一道题、加一套真题、改进判题、完善文档。

## 开发环境

```bash
node -v          # 需要 >= 20
npm install
npm run dev      # http://localhost:5173
npm test         # 单元测试
npm run lint     # ESLint
npm run typecheck
```

提交前请确保三件事都过：`npm run lint`、`npm test`、`npm run build`。

## 目录约定（改代码前先看这里）

```
src/core/      纯逻辑，禁止引入 React / DOM API，必须可单测
src/data/      内容数据（题库、公式、易错点、资讯）
src/storage/   持久化，对外只暴露仓储接口
src/store/     Zustand 全局状态
src/pages/     页面
src/components/ 可复用组件
```

**核心原则**：业务规则下沉到 `core/`，UI 只做渲染与交互。
如果你发现自己在组件里写判题或统计算法，那大概率放错位置了。

## 新增试题

往 `src/data/bank/` 加一个 `.md`，文件名用「第X届CMC预赛（组别）.md」。
每题格式：

```markdown
## 2024 第十六届CMC预赛 非数学A类 填空1
类型: 填空            # 选择 / 填空 / 解答
知识点: 极限, 等价无穷小  # 逗号分隔，导入时会自动归一化同义词
难度: 3               # 1-5
分值: 6               # 可省略，省略后按标准卷计（填空 6、解答 14）
题目: 计算 $\lim_{x\to 0}\frac{\sin 3x}{x}$
答案: 3
备选: 3.0             # 可选，等价写法，判题时同等对待
思路: 用等价无穷小替换   # 可选
易错点: 和差项中不能随便替换  # 可选，不写时按知识点自动兜底
解析:
当 $x\to 0$ 时……
```

要求：

- **答案与解析必须来自官方或可靠来源**，不要凭印象写
- 公式一律 LaTeX，行内 `$...$`，独立成行 `$$...$$`
- 知识点尽量使用已有标签（见 `src/core/knowledge.ts`），避免同义词分裂
- 图片题暂不支持（见路线图），几何/图像题请先跳过

提交后跑 `npm test`，会校验题库总数与各题完整性。

## 改判题引擎

`src/core/judge.ts` 是经过大量用例打磨的，**改之前先补测试**。
新增等价用例请加到 `src/core/__tests__/judge.test.ts`，包括「应该判对」和「不该判对」两类。

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat(practice): 支持按难度筛选题目
fix(judge): 修复根号参数嵌套导致分数展开失败
docs(readme): 补充移动端打包说明
test(judge): 补充隐式乘号用例
refactor(core): 抽出模块进度计算
chore(deps): 升级 vite
```

## PR 流程

1. Fork 并新建分支（`feat/xxx`、`fix/xxx`）
2. 改动 + 测试，`npm run lint && npm test && npm run build` 全绿
3. 提交 PR，描述清楚**改了什么、为什么、怎么验证**
4. 涉及题库或判题的改动，请在描述里说明数据来源

## 行为准则

参与本项目请遵守 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。
