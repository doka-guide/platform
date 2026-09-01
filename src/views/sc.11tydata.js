const { titleFormatter } = require('../libs/title-formatter/title-formatter')

module.exports = {
  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc',
  },

  permalink: '{{doc.filePathStem}}.sc.html',

  eleventyComputed: {
    // Нужен для <title> на странице карточки: в head он обязателен по
    // спецификации, хотя сама страница нужна только под скриншот.
    documentTitle: function (data) {
      const { doc } = data
      return titleFormatter([doc.data.title, 'Дока'])
    },

    cover: function (data) {
      const { doc } = data
      return doc.data.cover
    },

    docPath: function (data) {
      const { doc } = data
      return doc.filePathStem.replace('index', '')
    },

    category: function (data) {
      const { doc } = data
      return doc.filePathStem.split('/')[1]
    },

    categoryName: function (data) {
      const { category, collections } = data
      return collections.articleIndexes.find((section) => section.fileSlug === category)?.data.name
    },
  },
}
