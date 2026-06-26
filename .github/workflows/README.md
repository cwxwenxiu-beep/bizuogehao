# 国内云自动部署 · 使用说明(腾讯云 COS)

`deploy-tencent-cos.yml` —— 把网站从 GitHub 自动同步到 **腾讯云 COS + CDN**(国内这条腿)。

## 现在的状态
设成了 **手动触发(workflow_dispatch)**,所以:
- ✅ 不会在每次 push 时自动跑;
- ✅ 现在没配密钥也**不会报错**(不会出现红叉);
- 只是"预置好放这儿",等腾讯云账号 + 存储桶就绪。

## 启用步骤
1. 在 GitHub 仓库 → **Settings → Secrets and variables → Actions** 加这 4 个密钥:
   - `TENCENT_SECRET_ID`   腾讯云 SecretId(建议子账号)
   - `TENCENT_SECRET_KEY`  腾讯云 SecretKey
   - `COS_BUCKET`          存储桶名(带 APPID),例:`bizuogehao-site-1250000000`
   - `COS_REGION`          地域,例:`ap-beijing`
2. 打开 `deploy-tencent-cos.yml`,把 `on:` 里被注释的 `push:` 两行取消注释;
3. 之后每次 push 到 `main`,自动把网站同步到 COS。

## 注意
- 上传已排除 `.git` / `.github`,只传网站文件;
- `clean: true` 让云端与仓库保持一致(仓库删的文件,云端也删);
- www → 非 www 的 301 跳转,需在腾讯云 CDN 侧另配(代码里没有);
- 完整方案见 `C:\Users\cwxjo\Documents\比昨个好-国内云备案-双托管迁移方案.md`。
