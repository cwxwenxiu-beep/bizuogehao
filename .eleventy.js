// Eleventy 配置
// 原则:现有手写页面一律 passthrough 原样拷贝(字节级一致),只新增 /news/ 版块由模板生成。

const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // 开启 markdown 内联 HTML(用于文章内嵌数据图表)
  eleventyConfig.setLibrary("md", markdownIt({ html: true, breaks: false, linkify: true }));
  // 日期格式化:统一输出 YYYY-MM-DD
  eleventyConfig.addFilter("ymd", (d) => {
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  });

  // 按分类筛选文章(用于分类页 + 空状态判断)
  eleventyConfig.addFilter("byCategory", (posts, cat) =>
    (posts || []).filter((p) => p.data.category === cat)
  );

  // 现有手写页面:逐个原样拷贝(排除 news.html —— 被新的 /news/ 列表取代,旧址用 _redirects 301)
  ["index", "drama", "business", "about", "contact", "legal", "privacy", "404"].forEach((p) =>
    eleventyConfig.addPassthroughCopy(p + ".html")
  );
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("_redirects");
  // assets:拷贝所有文件,但排除未使用的大PNG(已替换为WebP)
  eleventyConfig.addPassthroughCopy("assets", {
    filter: path => {
      const name = path.split(/[\/\\]/).pop() || "";
      // 排除未被引用的文件
      if (name === "10.png" || name === "10.webp") return false;
      if (name === "17.png" || name === "17.webp") return false;
      if (name.includes("chatgpt-image")) return false;
      // 其他PNG已换WebP,不拷贝(仅保留logo-mark.png)
      if (name.endsWith(".png") && name !== "logo-mark.png") return false;
      return true;
    }
  });
  eleventyConfig.addPassthroughCopy("admin"); // Decap CMS 后台
  eleventyConfig.addPassthroughCopy("ai");    // AI-readable knowledge files
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
