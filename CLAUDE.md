# CLAUDE.md — 比昨个好官网 + 行业观察内容系统(给 AI 看的项目大脑)

> 任何接手这个仓库的 AI / 开发者,**开工前先读完本文件**。
> 这是一个已经上线、有真实流量的生产站点,改坏线上后果直接。

---

## 0. 一句话

「比昨个好文化传媒」的官网(bizuogehao.com)+「行业观察」内容专栏 + 自动发布系统。
做的是 **B2B 获客**:用专业行业内容做 SEO,把短剧出海 / 达人营销 / 品牌营销的潜在客户引进来。

公司业务三块,也正好是内容三分类:
- **AI 短剧 · 出海短剧**(`ai-drama`)
- **达人营销**(`daren`)
- **品牌营销**(`brand`)

---

## 🚫 红线(违反 = 把线上搞坏,后果严重)

1. **现有手写页面字节级不可破坏。** 下面这些 `.html` 是人工精心写的,由 11ty **原样 passthrough 拷贝**,不走模板:
   `index.html` `drama.html` `business.html` `about.html` `contact.html` `legal.html` `privacy.html` `404.html` `admin/index.html`
   - 改任何配置 / 模板后,**必须验证这些文件构建前后内容一致**(见 §9 验证命令)。
   - 唯一允许动过它们的地方:导航里加了「行业观察」→ `/news/` 入口。除非用户明确要求,别再碰它们的正文 / 布局 / 样式。

2. **域名只用非 www:** `https://bizuogehao.com`。`www` 会 301 跳转到非 www。
   所有 canonical / OG / sitemap / JSON-LD 里的 URL **必须是非 www**,否则 SEO 重复收录。

3. **数据准确性 > 速度。** 文章里的具体数字必须有**真实来源**并标注(`chart-source` / 正文注明)。
   - AI **不得编造**客户案例、战绩、精确金额。网上权威来源的数字经常打架(「亿」vs「billion」差 10 倍),拿不准就只用方向明确的比例(增速 / 占比),不放绝对金额。
   - 数据类内容发布前需人工核对。

4. **改动前先记还原点。** 动手前记录当前线上 `main` 的 commit 号,作为一键回退点。
   **绝不 `git push -f` 覆盖未经用户确认的线上状态。**

5. **密钥绝不入库。** `.env`(含 DeepSeek / GLM key)已 gitignore。任何时候不要把真实 key 写进会被提交的文件。

---

## 1. 技术栈

| 角色 | 用什么 |
|------|--------|
| 静态站生成 | **Eleventy (11ty) v3** — 输入 = 仓库根目录,输出 = `_site/` |
| 托管 / 部署 | **Netlify** — 自动部署:push `main` → Netlify 跑 `npm run build` → 上线(约 1 分钟) |
| 代码仓库 | **GitHub** `github.com/cwxwenxiu-beep/bizuogehao`,`main` 分支 = 生产 |
| 内容管理后台 | **Decap CMS**,地址 `/admin/`(git-gateway + Netlify Identity) |
| 文章渲染 | **markdown-it**(已开 `html:true`,文章可内嵌 HTML)|
| 数据图 | **Chart.js 4.4.1**(CDN,**按需**加载) |
| 自动发布生成 | **DeepSeek**(`deepseek-chat`,写文)+ **智谱 GLM**(`glm-5.2`,润色) |

---

## 2. 目录结构(关键文件)

```
bizuogehao-website/
├─ .eleventy.js              # 11ty 配置:markdown html:true、ymd/byCategory filter、passthrough 手写页面
├─ .eleventyignore           # 排除不该被当页面生成的文件(含本 CLAUDE.md)
├─ netlify.toml              # build 命令 / publish 目录 / NODE_VERSION
├─ _redirects                # /news.html → /news/ 等 301
├─ robots.txt                # 声明 Sitemap
├─ sitemap.njk               # 动态生成 sitemap.xml(含所有文章 + 分类)
│
├─ index.html drama.html business.html about.html       # ← 手写页面(红线①,原样拷贝)
│  contact.html legal.html privacy.html 404.html
├─ admin/ (index.html config.yml)                        # ← Decap CMS 后台
│
├─ news.njk                  # /news/ 文章列表页(模板)
├─ news-category.njk         # /news/<分类>/ 分类页(用 byCategory filter,带空状态)
│
├─ _includes/
│  ├─ base.njk               # ★ 文章页 layout:完整 SEO head + 条件加载 Chart.js
│  ├─ article.njk            # 文章正文外壳
│  ├─ page.njk               # 通用页外壳
│  ├─ header.njk footer.njk  # 头尾(含「行业观察」导航入口)
│  └─ post-card.njk          # 列表里的文章卡片
│
├─ _data/
│  ├─ site.json              # 站点信息:domain(非www)/name/company/logo/email
│  ├─ categories.json        # 分类 slug → 中文名 / 描述 映射
│  └─ categoryList.json      # 分类顺序列表(分类页据此生成)
│
├─ content/
│  ├─ news/                  # ★ 所有文章在这:<slug>.md
│  │  ├─ news.11tydata.js    # 给 news 目录下文章注入默认 layout / 集合标签
│  │  ├─ duanju-chuhai-ru-men.md      # 图文示范文(有 data-callout + Chart.js + 表格)
│  │  ├─ daren-toufang-dai-yunying.md
│  │  ├─ pinpai-neirong-yingxiao.md
│  │  └─ ai-duanju-zhizuo-liucheng.md
│  ├─ home.json business.json works.json settings.json   # 手写页的 CMS 数据
│
├─ assets/css/news.css       # ★ 行业观察 + 图文样式(只新增 class,不动 style.css)
├─ assets/js/main.js         # 站点交互
│
├─ scripts/auto-publish.js   # ★ 自动发布核心(见 §6)
├─ run-auto-publish.bat      # 任务计划入口(纯 ASCII)
├─ .env                      # 密钥(gitignore,不入库)
└─ logs/                     # 自动发布日志(gitignore)
```

---

## 3. 现有页面 vs 内容版块(必须分清)

- **手写 `.html`(9 个,含 admin)** → 11ty `addPassthroughCopy` **原样拷贝**,不经模板。改它们 = 碰红线①。
- **`/news/` 行业观察版块** → 由 `.njk` 模板 + `content/news/*.md` **生成**。这才是日常加内容、自动发布动的地方。

> 一句话:**要写内容、加文章、改样式,都在 `/news/` 体系里;手写 9 页除非用户点名,别动。**

---

## 4. 行业观察内容版块(/news/)

### 路由
- `/news/` — 全部文章列表(`news.njk`)
- `/news/ai-drama/`、`/news/daren/`、`/news/brand/` — 分类页(`news-category.njk`)
- `/news/<slug>/` — 文章页(`content/news/<slug>.md` → `_includes/base.njk`)

### 文章 front matter 字段(schema)
```yaml
---
title:   "标题(不带引号会被 ymd filter 处理日期,标题正常写)"
slug:    "url-用的-英文短横线"        # 决定 /news/<slug>/
category: "ai-drama | daren | brand"  # 三选一,决定归到哪个分类
date:    "2026-06-27"                 # YYYY-MM-DD
summary: "100 字内摘要,列表卡片 + SEO description 用"
author:  "比昨个好编辑部"
draft:   false                        # true = 不发布
has_charts: true                      # 可选!正文用 Chart.js 时必须加,否则图表不渲染
cover:   "/assets/img/xxx.jpg"        # 可选,封面图
updated: "2026-06-28"                 # 可选,JSON-LD dateModified 用
---
```

### 分类映射数据
- `_data/categories.json` — slug → 中文名 + 描述
- `_data/categoryList.json` — 分类展示顺序

---

## 5. 图文能力(文章里放数据 / 图 / 表)

`.eleventy.js` 已把 markdown 设为 `html:true`,所以文章 `.md` 里**可以直接写 HTML**。三种组件:

### ① 数据卡 data-callout(一排大数字)
```html
<div class="data-callout">
  <div class="data-callout-item">
    <span class="data-callout-num">+268%</span>
    <span class="data-callout-label">2025 海外短剧<br>下载量同比</span>
  </div>
  <!-- 重复多个 item -->
</div>
```

### ② 数据图 chart-wrap + Chart.js
```html
<div class="chart-wrap">
  <p class="chart-title">图标题</p>
  <div style="position:relative;height:180px"><canvas id="growthChart" ...>降级文字</canvas></div>
  <p class="chart-source">数据来源:…(标注口径)</p>
</div>
<script>
document.addEventListener('DOMContentLoaded', function(){
  var el = document.getElementById('growthChart');
  if (!el || typeof Chart === 'undefined') return;   // 防御:没加载到就不画
  new Chart(el, { type:'bar', data:{...}, options:{...} });
});
</script>
```
**关键:front matter 必须 `has_charts: true`**。`base.njk` 里是 `{% if has_charts %}` 才注入 Chart.js CDN —— 没这个标记,`Chart` 未定义,图不画(但有 `<canvas>` 里的降级文字兜底)。这样**没图表的文章不会白白加载 Chart.js**。

### ③ 表格
直接写标准 markdown 表格(`| 列 | 列 |`),`news.css` 自动套样式(斑马纹 + 红色表头)。

> 所有样式都在 `assets/css/news.css`,**只新增 class,不改 `style.css`**(避免影响手写页)。品牌主色暖红 `#C0392B`。
> 完整示范见 [`content/news/duanju-chuhai-ru-men.md`](content/news/duanju-chuhai-ru-men.md):4 个数据卡 + 1 个柱状图 + 1 个平台对比表。

---

## 6. 自动发布系统

**目标:每天自动生成一篇行业观察文章并上线,无人值守。**

### 流程(`scripts/auto-publish.js`,自包含,只依赖 DeepSeek + GLM)
```
读当天星期 → 查 WEEK_PLAN 选题 → 当天文件已存在? 跳过
  → DeepSeek 生成(JSON: title/summary/body/hashtags)
  → GLM 润色(失败则用原稿,不阻断)
  → 写 content/news/<prefix>-<YYYYMMDD>.md(draft:false)
  → git add + commit + push origin main
  → Netlify 自动 build 上线(约 1 分钟)
日志写 logs/auto-publish-<日期>.log
```

### 选题日历 `WEEK_PLAN`(与营销系统 `content-calendar.js` 对齐)
| 星期 | 行业 | category | 选题方向 |
|------|------|----------|---------|
| 一 | AI 短剧 | ai-drama | 行业本周动态 |
| 二 | 达人营销 | daren | 投放实操干货 |
| 三 | 短剧出海 | ai-drama | 海外市场进展 |
| 四 | AI 短剧 | ai-drama | 爆款拆解 |
| 五 | 达人营销 | daren | 运营复盘 |
| 六 | 短剧出海 | ai-drama | 趋势观察 |
| 日 | — | — | **休息,跳过** |

### 触发方式
Windows **任务计划程序**,每天 09:00 跑 `run-auto-publish.bat`(它 `cd` 到站点目录后 `node scripts/auto-publish.js`)。
注册命令(管理员 cmd,**由用户手动执行一次**):
```
schtasks /create /tn "bizuogehao-auto-publish" /tr "C:\Users\cwxjo\Documents\bizuogehao-website\run-auto-publish.bat" /sc daily /st 09:00 /ru SYSTEM /f
```

### 注意
- 自动发布会**真发文章 + 消耗 API 额度**,手动调试时谨慎,默认「只跑一次省额度」。
- 当前是**全自动直发**(`draft:false`)。数据类内容理想上应加「人工一键确认」轻审核 —— 这个机制**尚未实现**,是已知待办。
- 防重复靠「当天 slug 文件已存在则跳过」,所以同一天多次触发只发一篇。

---

## 7. SEO 设置

- **每篇文章**:`base.njk` 输出完整 head —— title / description / canonical(非 www)/ OG `article` / Twitter card / JSON-LD(`Article` + `BreadcrumbList`)。
- **sitemap**:`sitemap.njk` 动态生成,含所有文章 + 分类页;`robots.txt` 声明 Sitemap 位置。
- **验证**:谷歌已验证通过;百度有验证码(非 www)。百度因无备案,sitemap 手动提交受限,靠 robots 自然发现。
- **所有对外 URL 用 `site.domain`(非 www)**,统一口径。

---

## 8. 部署 / 回退

- **发布**:`git push origin main` → Netlify 自动 build(`npm run build` = eleventy)→ `_site/` 上线。
- **回退**:
  - 代码层:`git reset --hard <还原点commit>` 后 push(谨慎,需用户确认);
  - 或 Netlify 后台 → Deploys → 选历史 deploy → **Publish deploy**(不动 git,最稳)。

---

## 9. 常用命令 / 验证

```bash
# 本地构建
npm run build              # 或 npx @11ty/eleventy

# 本地预览
npm run serve

# ★ 改动后验证手写页没被破坏(红线①)——构建产物应与源文件逐字一致
npx @11ty/eleventy
diff index.html _site/index.html        # 应无输出;9 个手写页逐个比
# 验证图表按需加载:有图表文章应含 chart.umd.js,无图表文章应为 0
grep -c "chart.umd.js" _site/news/duanju-chuhai-ru-men/index.html   # 应为 1
grep -c "chart.umd.js" _site/news/<无图表文章>/index.html            # 应为 0

# 手动跑一次自动发布(会真发 + 烧额度,慎用)
node scripts/auto-publish.js
```

---

## 10. 相关系统(独立项目,不在本仓库)

**`bizuogehao-ai-marketing`** —— 在 `Downloads\比昨个好-完整系统\` 下,Node/Express 后端(端口 5000)+ React 前端。
- `POST /api/pipeline/oneclick` = 「一键出终稿」三模型流水线:**DeepSeek**(文案)+ 智谱 **CogView**(`cogview-3-flash` 配图)+ **GLM-5.2**(收拢润色)。
- `scripts/content-calendar.js` = 选题日历(本仓库自动发布的 `WEEK_PLAN` 与它对齐)。
- **重要:官网自动发布(`auto-publish.js`)是自包含的,不需要这个系统在运行。** 两者只是选题日历口径一致。

---

## 11. 如何扩展(给后来的 AI)

| 想做的事 | 怎么做 |
|---------|--------|
| 加一篇文章 | 在 `content/news/` 新建 `<slug>.md`,填 front matter,push 即上线;或用 `/admin/` CMS 后台 |
| 加图表 | front matter 加 `has_charts: true`,正文用 `chart-wrap` + `<canvas>` + Chart.js script(见 §5) |
| 加数据卡 / 表 | 正文直接写 `data-callout` HTML 或 markdown 表格,样式已就绪 |
| 改 / 加分类 | 改 `_data/categoryList.json` + `_data/categories.json` |
| 改选题日历 | 改 `scripts/auto-publish.js` 的 `WEEK_PLAN` |
| 改样式 | 只动 `assets/css/news.css`,别碰 `style.css`(红线①) |

---

## 12. 当前状态(截至 2026-06-28)

- ✅ 行业观察版块(三分类 + 列表 + 分类页 + 文章页)已上线。
- ✅ 图文能力(data-callout / Chart.js / 表格)已上线,示范文 `duanju-chuhai-ru-men` 验证通过。
- ✅ 自动发布脚本 + bat + 选题日历就位。
- ⏳ 待用户手动执行 `schtasks` 注册定时任务(管理员权限,AI 无法代执行)。
- ⏳ 待办:数据类内容「人工一键确认」轻审核机制(当前为全自动直发);公众号认证后接发布 API。
