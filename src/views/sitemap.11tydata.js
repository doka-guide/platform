const { baseUrl, mainSections } = require('../../config/constants')

module.exports = {
  permalink: '/sitemap.xml',

  eleventyExcludeFromCollections: true,

  eleventyComputed: {
    pages: function (data) {
      const { collections } = data

      const collectionsItems = [...collections['pages'], ...collections['docs'], ...collections['specials']].map(
        (item) => {
          const pathName = item.filePathStem.replace('index', '')
          const url = `${baseUrl}${pathName}`

          const dateField = item.data.updatedAt || item.data.createdAt
          const date = dateField ? new Date(dateField) : item.data.page.date || new Date()

          return {
            url,
            date,
          }
        }
      )

      const standalonePages = [
        // главная страница
        {
          url: `${baseUrl}/`,
          date: new Date(),
        },
        // страница с индексами категорий
        ...mainSections.map((section) => ({
          url: `${baseUrl}/${section}/`,
          date: new Date(),
        })),
      ]

      return [...standalonePages, ...collectionsItems]
    },
  },
}
