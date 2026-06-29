// Inject invisible JSON-LD into hand-written pages without touching visual HTML/CSS.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOMAIN = 'https://bizuogehao.com';
const ORG_ID = `${DOMAIN}/#organization`;
const SITE_ID = `${DOMAIN}/#website`;

const markerStart = '<!-- AI-SEO: structured-data:start -->';
const markerEnd = '<!-- AI-SEO: structured-data:end -->';

function node(value) {
  return `<script type="application/ld+json">\n${JSON.stringify(value, null, 2)}\n</script>`;
}

function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: '比昨个好（北京）文化传媒有限公司',
    alternateName: ['比昨个好文化传媒', '比昨个好'],
    url: `${DOMAIN}/`,
    logo: `${DOMAIN}/assets/img/logo-mark.png`,
    email: 'north@bizuogehao.com',
    description: '比昨个好文化传媒提供 AI短剧出海、达人营销、小红书种草、品牌内容营销、内容分发与复盘服务。',
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'business cooperation',
      email: 'business@bizuogehao.com',
      availableLanguage: ['zh-CN', 'en'],
      areaServed: ['CN', 'Global'],
    }],
    knowsAbout: ['AI短剧出海', '短剧出海', '达人营销', '达人投放', '小红书种草', '品牌内容营销', '内容分发', 'AIGC内容制作'],
  };
}

function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: '比昨个好文化传媒',
    url: `${DOMAIN}/`,
    publisher: { '@id': ORG_ID },
    inLanguage: 'zh-CN',
  };
}

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function service({ id, name, url, description, type }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${DOMAIN}/#service-${id}`,
    name,
    url,
    serviceType: type,
    description,
    provider: { '@id': ORG_ID },
    areaServed: ['中国', '海外市场'],
    audience: {
      '@type': 'Audience',
      audienceType: '品牌方、内容方、制片公司、MCN、出海团队',
    },
  };
}

function faq(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function webpage({ type = 'WebPage', name, url, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    name,
    url,
    description,
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'zh-CN',
  };
}

const pages = {
  'index.html': [
    organization(),
    website(),
    webpage({
      type: 'WebPage',
      name: '比昨个好文化传媒｜内容营销 · 达人投放 · 短剧出海',
      url: `${DOMAIN}/`,
      description: '比昨个好文化传媒提供内容营销、达人投放、小红书种草、短剧出海和 AI 内容生产服务。',
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '比昨个好核心服务',
      itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@id': `${DOMAIN}/#service-drama` } },
        { '@type': 'ListItem', position: 2, item: { '@id': `${DOMAIN}/#service-daren` } },
        { '@type': 'ListItem', position: 3, item: { '@id': `${DOMAIN}/#service-brand` } },
      ],
    },
    service({
      id: 'drama',
      name: 'AI短剧出海服务',
      url: `${DOMAIN}/drama.html`,
      type: 'AI short drama overseas distribution and production',
      description: '面向内容方、制片公司和出海团队，提供 AI短剧制作、短剧出海、本地化、平台宣发与达人二创协作。',
    }),
    service({
      id: 'daren',
      name: '达人营销与小红书种草服务',
      url: `${DOMAIN}/business.html`,
      type: 'Influencer marketing and Xiaohongshu seeding',
      description: '面向品牌方提供达人筛选、内容共创、小红书种草、短视频推广、达人分销和数据复盘。',
    }),
  ],
  'business.html': [
    organization(),
    webpage({
      type: 'WebPage',
      name: '达人营销 · 达人投放代运营｜小红书种草',
      url: `${DOMAIN}/business.html`,
      description: '达人营销与达人投放代运营服务，覆盖小红书种草、抖音快手达人合作、品牌内容营销和投放复盘。',
    }),
    service({
      id: 'daren',
      name: '达人营销与小红书种草服务',
      url: `${DOMAIN}/business.html`,
      type: '达人营销、达人投放代运营、小红书种草',
      description: '从品类定位、达人筛选、内容共创到投放复盘，帮助品牌把内容做成可执行、可复盘的增长线。',
    }),
    faq([
      { q: '达人投放代运营适合什么品牌？', a: '适合需要稳定内容种草、达人合作、短视频扩散和数据复盘的品牌，尤其是新消费、本地生活、文娱内容和有转化需求的产品团队。' },
      { q: '小红书种草怎么做更稳？', a: '先明确人群、场景关键词和内容钩子，再筛选匹配达人，控制笔记结构与真实体验表达，最后用互动、搜索收录和转化数据复盘。' },
      { q: '比昨个好和普通广告投放有什么区别？', a: '比昨个好更强调内容策略、达人协作和复盘闭环，不只是购买曝光，而是把品牌内容做成可持续积累的资产。' },
    ]),
    breadcrumb([
      { name: '首页', url: `${DOMAIN}/` },
      { name: '内容营销', url: `${DOMAIN}/business.html` },
    ]),
  ],
  'drama.html': [
    organization(),
    webpage({
      type: 'WebPage',
      name: 'AI短剧制作 · 短剧出海服务',
      url: `${DOMAIN}/drama.html`,
      description: 'AI短剧制作与短剧出海服务，覆盖 AI短剧分销、海外真人短剧制作、本地化和平台宣发。',
    }),
    service({
      id: 'drama',
      name: 'AI短剧制作与短剧出海服务',
      url: `${DOMAIN}/drama.html`,
      type: 'AI短剧制作、短剧出海、海外短剧宣发',
      description: '从选题、剧本、本地化、AI视觉制作到平台分发与达人二创，帮助内容方把短剧推向海外市场。',
    }),
    faq([
      { q: '短剧出海公司怎么选？', a: '优先看是否懂目标市场、本地化、平台规则、内容生产和投放复盘，不能只看是否能翻译或代发。' },
      { q: 'AI短剧出海一般从哪里开始？', a: '通常从目标市场、题材适配、剧本本地化和平台分发策略开始，再进入素材制作、达人合作和数据复盘。' },
      { q: 'AI短剧和传统短剧营销有什么区别？', a: 'AI短剧更适合快速生成素材、测试题材和多语言版本，但仍需要人工把控本地化、合规、情绪表达和商业转化。' },
    ]),
    breadcrumb([
      { name: '首页', url: `${DOMAIN}/` },
      { name: '短剧出海', url: `${DOMAIN}/drama.html` },
    ]),
  ],
  'about.html': [
    organization(),
    webpage({
      type: 'AboutPage',
      name: '关于比昨个好文化传媒',
      url: `${DOMAIN}/about.html`,
      description: '比昨个好（北京）文化传媒有限公司是一家聚焦达人内容营销与短剧内容生态的文化传媒公司。',
    }),
    breadcrumb([
      { name: '首页', url: `${DOMAIN}/` },
      { name: '关于我们', url: `${DOMAIN}/about.html` },
    ]),
  ],
  'contact.html': [
    organization(),
    webpage({
      type: 'ContactPage',
      name: '联系比昨个好文化传媒',
      url: `${DOMAIN}/contact.html`,
      description: '联系比昨个好文化传媒，咨询 AI短剧出海、达人投放、小红书种草、品牌内容营销合作。',
    }),
    breadcrumb([
      { name: '首页', url: `${DOMAIN}/` },
      { name: '联系我们', url: `${DOMAIN}/contact.html` },
    ]),
  ],
};

function stripLegacyJsonLd(html) {
  return html
    .replace(/\n<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"Organization","name":"比昨个好[\s\S]*?<\/script>/g, '')
    .replace(/\n<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"WebSite","name":"比昨个好文化传媒"[\s\S]*?<\/script>/g, '');
}

function apply(file, graph) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  html = stripLegacyJsonLd(html);
  const block = `\n${markerStart}\n${graph.map(node).join('\n')}\n${markerEnd}\n`;
  const re = new RegExp(`\\n?${markerStart}[\\s\\S]*?${markerEnd}\\n?`, 'm');
  html = re.test(html) ? html.replace(re, block) : html.replace('</head>', `${block}</head>`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`structured-data: ${file}`);
}

Object.entries(pages).forEach(([file, graph]) => apply(file, graph));
