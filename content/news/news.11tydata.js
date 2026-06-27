// content/news 目录下所有文章共用的配置:套 article 布局、生成 /news/<slug>/ 页面、draft 不发布
module.exports = {
  layout: "article.njk",
  tags: "post",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/news/${data.slug}/index.html`)
  }
};
