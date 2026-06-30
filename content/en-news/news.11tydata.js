// English article defaults: en-article layout, enpost tag, /en/news/<slug>/ permalink
module.exports = {
  layout: "en-article.njk",
  tags: "enpost",
  author: "Better Than Yesterday Studio",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/en/news/${data.slug}/index.html`)
  }
};
