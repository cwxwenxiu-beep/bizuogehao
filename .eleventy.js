// Eleventy 配置
// 原则:现有手写页面一律 passthrough 原样拷贝(字节级一致),只新增 /news/ 版块由模板生成。

module.exports = function (eleventyConfig) {
  // 日期格式化:统一输出 YYYY-MM-DD
  eleventyConfig.addFilter("ymd", (d) => {
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  });

  // 现有手写页面:逐个原样拷贝(排除 news.html —— 被新的 /news/ 列表取代,旧址用 _redirects 301)
  ["index", "drama", "business", "about", "contact", "legal", "privacy", "404"].forEach((p) =>
    eleventyConfig.addPassthroughCopy(p + ".html")
  );
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("assets");   // css/js/img/svg(含新增 news.css)
  eleventyConfig.addPassthroughCopy("admin");    // Decap CMS 后台
  // CMS 数据 JSON:逐个原样拷贝(content/news/*.md 走模板处理,不在此列)
  eleventyConfig.addPassthroughCopy("content/settings.json");
  eleventyConfig.addPassthroughCopy("content/home.json");
  eleventyConfig.addPassthroughCopy("content/business.json");
  eleventyConfig.addPassthroughCopy("content/works.json");
  // 注意:sitemap.xml 现由 sitemap.njk 生成(含文章),不再 passthrough 静态版

  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: false
  };
};
