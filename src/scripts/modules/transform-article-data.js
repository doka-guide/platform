module.exports = function transformArticleData(article) {
  const section = article.filePathStem.split('/')[1]

  return {
    title: article.data.title,
    cover: article.data.cover ?? {},
    get imageLink() {
      return Object.keys(this.cover).includes('mobile') ? `${this.cover.mobile}` : undefined
    },
    description: article.data.description,
    link: `/${section}/${article.fileSlug}/`,
    linkTitle: article.data.title.replace(/`/g, ''),
    section,
  }
}
