module.exports = function transformArticleData(article) {
  const section = article.filePathStem.split('/')[1]

  return {
    title: article.data.title,
    cover: article.data.cover ?? {},
    get imageLink() {
      return `${this.cover.mobile}`
    },
    description: article.data.description,
    link: `/${section}/${article.fileSlug}/`,
    linkTitle: article.data.title.replace(/`/g, ''),
    section,
  }
}
