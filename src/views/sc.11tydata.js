const { mainSections } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

function getPersons(personKey) {
  return function (data) {
    const { doc } = data
    return doc.data[personKey]
  }
}

module.exports = {
  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc',
  },

  permalink: '{{doc.filePathStem}}.sc.html',

  eleventyComputed: {
    title: function (data) {
      const { doc } = data
      return doc.data.title
    },

    cover: function (data) {
      const { doc } = data
      return doc.data.cover
    },

    description: function (data) {
      const { doc } = data
      return doc.data.description
    },

    authors: getPersons('authors'),

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

    documentTitle: function (data) {
      return titleFormatter([data.title, data.categoryName, 'Дока'])
    },

    articleTag: function (data) {
      const { doc } = data
      return doc.data.tags[0]
    },

    articleCategory: function (data) {
      const { docPath } = data
      const categoryKeys = Object.keys(mainSections)
      for (const index in categoryKeys) {
        if (docPath.includes(categoryKeys[index])) {
          return mainSections[categoryKeys[index]]
        }
      }
    },
  },
}
