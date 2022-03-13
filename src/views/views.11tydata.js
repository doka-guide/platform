const path = require('path')
const fsp = require('fs/promises')
const frontMatter = require('gray-matter')
const { baseUrl } = require('../../config/constants')
const categoryColors = require('../../config/category-colors')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

module.exports = {
  featuredArticlesMaxCount: 12,

  eleventyComputed: {
    documentTitle: function (data) {
      return titleFormatter([data.title, 'Дока'])
    },

    socialTitle: function (data) {
      const { documentTitle } = data
      return documentTitle
    },

    documentDescription: function (data) {
      const { documentDescription, description } = data
      return documentDescription || description
    },

    hasCategory: function (data) {
      return !!data.categoryName
    },

    baseUrl,

    pageUrl: function (data) {
      return data.page.url
    },

    fullPageUrl: function (data) {
      return data.baseUrl + data.pageUrl
    },

    defaultOpenGraphPath: function (data) {
      return data.fullPageUrl + 'images/covers/og.png'
    },

    defaultTwitterPath: function (data) {
      return data.fullPageUrl + 'images/covers/twitter.png'
    },

    featuredArticles: async function (data) {
      const { featuredArticlesMaxCount } = data
      const { docsById } = data.collections

      if (!(docsById && Object.keys(docsById).length > 0)) {
        return null
      }

      const pathToFeaturedSettingsFile = path.join('src', 'settings', 'featured.md')
      const fileContent = await fsp.readFile(pathToFeaturedSettingsFile, {
        encoding: 'utf-8',
      })
      const frontMatterInfo = frontMatter(fileContent)
      const featuredArticlesIds = frontMatterInfo?.data?.active

      if (!featuredArticlesIds) {
        return null
      }

      return featuredArticlesIds
        .slice(0, featuredArticlesMaxCount)
        .map((id) => docsById[id])
        .filter(Boolean)
        .map((article) => {
          const section = article.filePathStem.split('/')[1]

          return {
            title: article.data.title,
            cover: article.data.cover,
            get imageLink() {
              return `${this.link}${this.cover.mobile}`
            },
            description: article.data.description,
            link: `/${section}/${article.fileSlug}/`,
            linkTitle: article.data.title.replace(/`/g, ''),
            section,
          }
        })
    },

    themeColor: function (data) {
      const { category } = data
      return categoryColors[category || 'default']
    },

    logoLetters: function (data) {
      const { pageUrl } = data

      switch (pageUrl) {
        case '/licenses/':
          return 'U©ᴥ©U'
        default:
          return null
      }
    },
  },
}
