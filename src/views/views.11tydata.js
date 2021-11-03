const { baseUrl, mainSections } = require('../../config/constants')
const categoryColors = require('../../config/category-colors')
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

    socialTitle: function(data) {
      const { documentTitle } = data
      return documentTitle
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

    defaultOpenGraphPath: function(data) {
      return data.fullPageUrl + 'images/covers/og.png'
    },

    defaultTwitterPath: function(data) {
      return data.fullPageUrl + 'images/covers/twitter.png'
    },

    featuredArticles: function(data) {
      // массив массивов
      const allFeaturedArticles = mainSections.map(section =>
        data.collections[section]
          .filter(article => hasTag(article.data.tags, data.featuredTag))
          .slice(0, data.featuredArticlesMaxCount)
      )

      const sectionsCount = allFeaturedArticles.length

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
          const section = article.filePathStem.split('/')[1]

          return {
            title: article.data.title,
            cover: article.data.cover,
            get imageLink() {
              return `${this.link}/${this.cover.mobile}`
            },
            description: article.data.description,
            link: `/${section}/${article.fileSlug}`,
            linkTitle: article.data.title.replace(/`/g, ''),
            section,
          }
        })
    },

    themeColor: function(data) {
      const { category } = data
      return categoryColors[category || 'default']
    }
  },
}
