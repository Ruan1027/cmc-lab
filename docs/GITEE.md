# 双平台仓库配置（GitHub + Gitee）

国内用户访问 Gitee 更快，海外与开源社区看 GitHub。两个平台都推，覆盖面最大。

## 1. 在两端创建仓库

- GitHub：新建空仓库，**不要**勾选初始化 README（本地已有）
- Gitee：新建空仓库，同样不要初始化

仓库名建议统一为 `cmc-lab`。

## 2. 本地配置两个远端

```bash
git remote add github git@github.com:<你的用户名>/cmc-lab.git
git remote add gitee  git@gitee.com:<你的用户名>/cmc-lab.git

# 一次性推送两边
git push github master
git push gitee  master
```

想省事可以设一个组合远端（一次 push 推两边）：

```bash
git remote add all git@github.com:<你的用户名>/cmc-lab.git
git remote set-url --add --push all git@github.com:<你的用户名>/cmc-lab.git
git remote set-url --add --push all git@gitee.com:<你的用户名>/cmc-lab.git

git push all master
```

## 3. 自动同步（可选）

GitHub 侧用 Action 在推送后镜像到 Gitee：

```yaml
# .github/workflows/mirror.yml
name: Mirror to Gitee
on:
  push:
    branches: [master]
jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Mirror
        uses: Yikun/hub-mirror-action@master
        with:
          src: github/<你的用户名>
          dst: gitee/<你的用户名>
          dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
          dst_token: ${{ secrets.GITEE_TOKEN }}
          static_list: cmc-lab
          force_update: true
```

需要在仓库 Settings → Secrets 里配 `GITEE_PRIVATE_KEY`（SSH 私钥）与 `GITEE_TOKEN`（Gitee 私人令牌）。
Gitee 账号需完成实名认证才能正常使用。

## 4. 注意事项

| 事项 | 说明 |
| --- | --- |
| 分支保护 | 两端都建议保护 `master`，要求 PR + CI 通过 |
| CI | GitHub Actions 已配好（`.github/workflows/ci.yml`）；Gitee 的 Gitee Go 需另行开通 |
| Issue 模板 | 两端共用 `.github/ISSUE_TEMPLATE/`（Gitee 兼容该目录） |
| 仓库描述 | Gitee 上建议加中文简介与标签，利于站内搜索 |
| 许可证 | `LICENSE` 已放在根目录，两端都能识别 |

## 5. 提升 Star 的小建议

- README 首屏说清「这是什么、给谁用、能解决什么」
- 配一张真机/桌面截图（GIF 更好）
- 保持 CHANGELOG 更新，让别人看到项目在动
- 题库持续扩充，并在 README 显著位置写清覆盖届次
- Issue 模板里的「题目纠错」能带来真实参与感
