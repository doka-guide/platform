const { mainSections } = require('../../config/constants')

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

module.exports = {
  layout: 'base.njk',
  permalink: '/',
  title: 'Дока',

  featuredArticlesMaxCount: 18,
  featuredTag: 'featured',

  eleventyComputed: {
    featuredArticles: function(data) {
      // массив массивов
      const allFeaturedArticles = mainSections.map(section =>
        data.collections[section]
          // TODO: uncomment
          // .filter(article => hasTag(article.data.tags, data.featuredTag))
          .slice(0, data.featuredArticlesMaxCount)
      )

      const sectionsCount = allFeaturedArticles.length;

      const articlesForShow = []

      for (let i = 0; i < data.featuredArticlesMaxCount; i++) {
        const sectionIndex = (i + sectionsCount) % sectionsCount
        const sectionArticles = allFeaturedArticles[sectionIndex]
        const articleIndex = Math.floor(i / sectionsCount)
        articlesForShow.push(sectionArticles[articleIndex])
      }

      return articlesForShow
        .filter(Boolean)
        .map(article => {
          const section = article.filePathStem.split('/')[1];
          return {
            title: article.data.title,
            cover: article.data.cover,
            description: article.data.description,
            link: `/${section}/${article.fileSlug}`,
            section,
            type: hasTag(article.data.tags, 'article') ? 'article': 'doka'
          }
        })
    }
  }
}
