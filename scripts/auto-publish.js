// scripts/auto-publish.js
// 官网自动发布:读选题日历 -> DeepSeek 生成 -> GLM 润色 -> 写 markdown -> git push -> Netlify 自动上线
// 通过 Windows 任务计划程序每天 09:00 触发(见 setup-task.bat)

'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(ROOT, 'content', 'news');
const LOG_DIR  = path.join(ROOT, 'logs');
const NOW      = new Date();
const TODAY    = NOW.toISOString().slice(0, 10);  // YYYY-MM-DD
const DOW      = NOW.getDay();                     // 0=周日

// 加载 .env
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const GLM_KEY      = process.env.GLM_API_KEY;
const GLM_MODEL    = process.env.GLM_CHAT_MODEL || 'glm-5.2';

// 选题日历(与 bizuogehao-ai-marketing/scripts/content-calendar.js 保持一致)
const WEEK_PLAN = {
  1: { industry: 'AI短剧',  category: 'ai-drama', prefix: 'ai-duanju',  topic: 'AI短剧行业本周动态：值得关注的新趋势与新作' },
  2: { industry: '达人营销', category: 'daren',    prefix: 'daren',     topic: '达人投放实操干货：本周一个可落地的方法' },
  3: { industry: '短剧出海', category: 'ai-drama', prefix: 'chuhai',    topic: '短剧出海：海外市场最新进展与平台动向' },
  4: { industry: 'AI短剧',  category: 'ai-drama', prefix: 'baokuan',   topic: '近期爆款短剧拆解：为什么它能火' },
  5: { industry: '达人营销', category: 'daren',    prefix: 'daren-fk',  topic: '达人运营本周复盘：哪种内容形式效果更好' },
  6: { industry: '短剧出海', category: 'ai-drama', prefix: 'chuhai-qushi', topic: '短剧出海趋势观察：下一个机会在哪里' },
  0: null  // 周日休息
};

// 日志
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, `auto-publish-${TODAY}.log`);
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
}

// API 调用
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 2200, temperature: 0.72 })
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content.trim();
}

async function callGLM(prompt) {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GLM_KEY}` },
    body: JSON.stringify({ model: GLM_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 2000, temperature: 0.5 })
  });
  if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content.trim();
}

function extractJSON(raw) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('未找到 JSON 块');
  return JSON.parse(m[0]);
}

async function main() {
  log('=== 自动发布启动 ===');

  // 1. 检查今日是否休息
  const plan = WEEK_PLAN[DOW];
  if (!plan) { log('周日休息，跳过。'); return; }
  log(`今日选题: ${plan.industry} · ${plan.topic}`);

  // 2. 检查今日是否已发
  const slug = `${plan.prefix}-${TODAY.replace(/-/g, '')}`;
  const outFile = path.join(NEWS_DIR, `${slug}.md`);
  if (fs.existsSync(outFile)) { log(`${outFile} 已存在，跳过重复发布。`); return; }

  // 3. DeepSeek 生成
  if (!DEEPSEEK_KEY) throw new Error('缺少 DEEPSEEK_API_KEY');
  log('DeepSeek 生成内容...');
  const genPrompt = `你是「比昨个好文化传媒」的内容编辑，专注短剧出海、达人营销、品牌内容营销。
请围绕主题「${plan.topic}」，写一篇发布在官网「行业观察」专栏的文章（受众：品牌方、内容方、出海从业者）。

严格要求：
- 标题：吸引行业从业者，30 字以内，不要引号
- 摘要：100 字以内，概括核心价值
- 正文：1200-1800 字，3-5 个 ## 二级标题，专业有料不废话，**加粗**关键信息
- 正文末尾加一个 markdown 格式对比表（2-4列，总结核心对比点）
- 结尾自然引导联系我们，链接用 /contact.html，不强行推销
- 不要编造具体客户案例或具体数据（可用「行业数据显示」「通常」「普遍来看」等表述）
- 只输出 JSON，格式：{"title":"...","summary":"...","body":"markdown正文","hashtags":["tag1","tag2","tag3"]}
- body 里换行用真正的换行符（不是 \\n 字符串）`;

  const raw1 = await callDeepSeek(genPrompt);
  let article = extractJSON(raw1);
  log(`DeepSeek 标题: ${article.title}`);

  // 4. GLM 润色
  if (GLM_KEY) {
    log('GLM 润色...');
    const refinePrompt = `你是资深内容编辑，请审阅并优化以下文章：
1. 语气更专业、行文更有层次
2. 确保正文末尾有 markdown 对比表格
3. 结尾引导自然（/contact.html）
4. 输出相同 JSON 格式：{"title":"...","summary":"...","body":"...","hashtags":[...]}

原文 JSON：
${JSON.stringify(article, null, 2)}`;
    try {
      const raw2 = await callGLM(refinePrompt);
      const refined = extractJSON(raw2);
      if (refined.title && refined.body) {
        article = refined;
        log(`GLM 润色后标题: ${article.title}`);
      }
    } catch (e) { log(`GLM 润色失败，使用原稿: ${e.message}`); }
  }

  // 5. 写 markdown 文件
  const body = (article.body || '').replace(/\\n/g, '\n');
  const md = `---
title: "${(article.title || plan.topic).replace(/"/g, '\\"')}"
slug: "${slug}"
category: "${plan.category}"
date: "${TODAY}"
summary: "${(article.summary || '').replace(/"/g, '\\"')}"
author: "比昨个好编辑部"
draft: false
---

${body}
`;
  fs.writeFileSync(outFile, md, 'utf8');
  log(`文章写入: ${outFile}`);

  // 6. git commit + push -> Netlify 自动上线
  log('提交 GitHub...');
  execSync(`git -C "${ROOT}" add "content/news/${slug}.md"`, { stdio: 'pipe' });
  execSync(`git -C "${ROOT}" commit -m "auto: ${article.title || plan.topic}"`, { stdio: 'pipe' });
  execSync(`git -C "${ROOT}" push origin main`, { stdio: 'pipe' });
  log('✅ 推送成功！Netlify 约 1 分钟后自动上线。');
}

main().catch(e => {
  log(`❌ 失败: ${e.message}`);
  process.exit(1);
});
