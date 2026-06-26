# 国内云自动部署 · 使用说明(草稿)

这里有两套「GitHub → 国内云」的自动部署草稿,**二选一**用:

- `deploy-aliyun-oss.yml` —— 部署到阿里云 OSS + CDN
- `deploy-tencent-cos.yml` —— 部署到腾讯云 COS + CDN

## 现在的状态
两套都设成了 **手动触发(workflow_dispatch)**,所以:
- ✅ 不会在每次 push 时自动跑;
- ✅ 现在没配密钥也**不会报错**(不会出现红叉);
- 它们只是"预置好放这儿",等你云账号开通。

## 启用步骤(等你定了云商、注册好账号)
1. 在 GitHub 仓库 → **Settings → Secrets and variables → Actions** 里,按你选的那套 yml 顶部注释,把对应的 4 个密钥加进去;
2. 打开对应的 yml,把 `on:` 里被注释的 `push:` 那两行**取消注释**(并删掉只手动触发那行,或保留都行);
3. 之后每次 push 到 `main`,GitHub 会自动把网站同步到国内云;
4. 用不到的那一套 yml 可以删掉,避免混淆。

## 注意
- 上传时已排除 `.git` / `.github`,只传网站文件。
- `--delete` / `clean:true` 会让云端和仓库保持一致(仓库删了的文件,云端也删)。
- www → 非 www 的 301 跳转,需要在国内云 CDN 侧另外配(代码里没有)。
- 详见 `C:\Users\cwxjo\Documents\比昨个好-国内云备案-双托管迁移方案.md`。
