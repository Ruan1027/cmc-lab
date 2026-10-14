# 双平台仓库配置（GitHub + Gitee）

国内用户访问 Gitee 更快，海外与开源社区看 GitHub。两个平台都推，覆盖面最大。

## 1. GitHub（✅ 已完成）

| 项 | 值 |
| --- | --- |
| 仓库 | https://github.com/Ruan1027/cmc-lab |
| 可见性 | public |
| 默认分支 | `master` |
| 本地 remote 名 | `github` |
| 当前 remote 地址 | `git@ssh.github.com:Ruan1027/cmc-lab.git` |

本地推送方式（按网络环境二选一）：

```bash
git push github master
```

### 为什么 remote 用 ssh.github.com 而不是 github.com

本项目开发机所在网络对 `github.com` 的 HTTPS（443）有 TLS 握手干扰，`git push` 报
`schannel: failed to receive handshake`；而 `ssh.github.com:443`（GitHub 官方的 SSH over 443
备用通道）可以连通。因此采用 **SSH 部署密钥**方案：

1. 本地生成 ed25519 密钥对：`ssh-keygen -t ed25519 -f ~/.ssh/cmc_lab_deploy -N ""`
2. 通过 API 把公钥加成仓库**部署密钥**（写权限）：仓库 Settings → Deploy keys，
   或 `POST /repos/Ruan1027/cmc-lab/keys`（`read_only: false`）
3. `~/.ssh/config` 固化通道（免每次输端口和密钥路径）：

   ```
   Host ssh.github.com
     HostName ssh.github.com
     Port 443
     User git
     IdentityFile ~/.ssh/cmc_lab_deploy
     IdentitiesOnly yes
   ```

4. remote 使用 scp 风格地址：`git@ssh.github.com:Ruan1027/cmc-lab.git`

> 部署密钥只对 `cmc-lab` 这一个仓库有效，泄露影响面小；换机器时重新生成并替换即可。
> 若你的网络可以直接访问 github.com，把 remote 改回 HTTPS 即可（凭据由
> Git Credential Manager 托管，令牌不明文落盘）：
> `git remote set-url github https://github.com/Ruan1027/cmc-lab.git`

## 2. Gitee（⏳ 待配置）

Gitee 仓库尚未创建，且本地存储的旧凭证已失效（API 返回 401）。需要一个**有效的私人令牌**。

### 第一步：创建 Gitee 仓库

浏览器打开 https://gitee.com/projects/new ，仓库名填 `cmc-lab`，
**不要**勾选「初始化仓库」（本地已有完整提交历史），可见性选公开。

### 第二步：创建私人令牌（PAT）

https://gitee.com/profile/personal_access_tokens → 新建令牌，
权限勾选 **`projects`**（仓库读写）。令牌只显示一次，马上交给下面的保存步骤。

### 第三步：保存令牌到本地凭证管理器

拿到令牌后执行（把 `<令牌>` 换成真实值）：

```bash
printf "protocol=https\nhost=gitee.com\nusername=ruan-xinyang1027\npassword=<令牌>\n\n" \
  | git credential approve
```

Git Credential Manager 会把它加密存入 Windows 凭据管理器，不明文落盘，
之后所有 `git fetch/push` 自动带上，无需重复输入。

### 第四步：配置 remote 并推送

```bash
git remote add gitee https://gitee.com/ruan-xinyang1027/cmc-lab.git
git push gitee master
```

gitee.com 的 HTTPS 直连通常无障碍，用令牌走 HTTPS 即可，不需要 SSH。

### 想省事：组合远端一次推两边

```bash
git remote add all https://github.com/Ruan1027/cmc-lab.git
git remote set-url --add --push all https://github.com/Ruan1027/cmc-lab.git
git remote set-url --add --push all https://gitee.com/ruan-xinyang1027/cmc-lab.git
git push all master
```

## 3. 自动同步（可选）

Gitee 配好后，可以只用 GitHub 侧仓库，靠 Action 镜像过去：

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
          src: github/Ruan1027
          dst: gitee/ruan-xinyang1027
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
