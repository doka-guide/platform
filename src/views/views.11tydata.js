const path = require('path')
const sharp = require('sharp')
const { baseUrl, mainSections } = require('../../config/constants')
const categoryColors = require('../../config/category-colors')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

function getImageMetaData(imagePath) {
  return sharp(imagePath).metadata()
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

      return Promise.all(articlesForShow
        .filter(Boolean)
        .map(async article => {
          const section = article.filePathStem.split('/')[1]

          return {
            title: article.data.title,
            cover: article.data.cover,
            get imageLink() {
              return `${this.link}/${this.cover.mobile}`
            },
            imageMetaData: article.data?.cover?.mobile
              ? await getImageMetaData(path.join('src', section, article.fileSlug, article.data.cover.mobile))
              : null,
            description: article.data.description,
            link: `/${section}/${article.fileSlug}`,
            linkTitle: article.data.title.replace(/`/g, ''),
            section,
          }
        })
      )
    },

    themeColor: function(data) {
      const { category } = data
      return categoryColors[category || 'default']
    }
  },
}
