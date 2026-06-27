// Eleventy 配置 —— 阶段1:只做"现有站原样直出"
// 原则:现有手写页面一律 passthrough 原样拷贝,不经任何模板处理 → 输出字节级一致。
// 后续 news 版块的文章/列表/分类模板(.njk/.md)再逐步加入。

module.exports = function (eleventyConfig) {
  // ---- 现有静态资产:原样拷贝到 _site,内容一字节不动 ----
  eleventyConfig.addPassthroughCopy("*.html");   // 现有 6+ 个页面
  eleventyConfig.addPassthroughCopy("*.xml");     // sitemap.xml
  eleventyConfig.addPassthroughCopy("*.txt");     // robots.txt
  eleventyConfig.addPassthroughCopy("assets");    // css/js/img/svg
  eleventyConfig.addPassthroughCopy("admin");     // Decap CMS 后台
  eleventyConfig.addPassthroughCopy("content");   // CMS 数据(JSON 等)

  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    // 只有 njk/md 才当模板处理;.html 一律按上面的 passthrough 原样拷贝(不渲染)
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: false
  };
};
