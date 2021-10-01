const { baseUrl, mainSections } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

module.exports = {
  featuredArticlesMaxCount: 18,
  featuredTag: 'featured',

  eleventyComputed: {
    documentTitle: function(data) {
      return titleFormatter([data.title, 'Дока'])
    },

    hasCategory: function(data) {
      return !!(data.categoryName)
    },

    baseUrl,

    pageUrl: function(data) {
      return data.page.url
    },

    fullPageUrl: function(data) {
      return data.baseUrl + data.pageUrl
    },

    featuredArticles: function(data) {
      // массив массивов
      const allFeaturedArticles = mainSections.map(section =>
        data.collections[section]
          .filter(article => hasTag(article.data.tags, data.featuredTag))
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
            linkTitle: article.data.title.replace(/`/g, ''),
            section,
            type: hasTag(article.data.tags, 'article') ? 'article': 'doka'
          }
        })
    }
  },
}
