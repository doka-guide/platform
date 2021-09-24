const { baseUrl, mainSections } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

function getPersons(personKey) {
  return function(data) {
    const { doc } = data
    return doc.data[personKey]
  }
}

function getPopulatedPersons(personKey) {
  return function(data) {
    const { peopleById } = data.collections
    const personsIds = data[personKey] || []

    return personsIds.map(personId => peopleById[personId]
      ? peopleById[personId]
      : {
          data: {
            name: personId
          }
        }
    )
  }
}

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc'
  },

  permalink: '/{{doc.filePathStem}}.html',

  pageType: 'Article',

  eleventyComputed: {
    title: function(data) {
      const { doc } = data
      return doc.data.title
    },

    cover: function(data) {
      const { doc } = data
      return doc.data.cover
    },

    description: function(data) {
      const { doc } = data
      return doc.data.description
    },

    authors: getPersons('authors'),

    populatedAuthors: getPopulatedPersons('authors'),

    contributors: getPersons('contributors'),

    populatedContributors: getPopulatedPersons('contributors'),

    editors: getPersons('editors'),

    populatedEditors: getPopulatedPersons('editors'),

    docPath: function(data) {
      const { doc } = data
      // Удаляем `/index` с конца пути
      return doc.filePathStem.replace('/index', '')
    },

    category: function(data) {
      const { doc } = data
      return doc.filePathStem.split('/')[1]
    },

    categoryName: function(data) {
      const { category, collections } = data
      return collections.articleIndexes
        .find(section => section.fileSlug === category)?.data.name
    },

    type: function(data) {
      const { doc } = data
      return hasTag(doc.data.tags, 'article') ? 'article' : 'doka'
    },

    baseUrl,

    practices: function(data) {
      const allPractices = data.collections.practice
      const { docPath } = data

      return allPractices.filter(practice => {
        return practice.filePathStem.startsWith(`${docPath}/practice`)
      })
    },

    containsPractice: function(data) {
      const { practices } = data
      return (practices.length > 0) ? 'true' : 'false'
    },

    createdAt: function(data) {
      const { doc } = data
      return doc.data.createdAt ? new Date(doc.data.createdAt) : null
    },

    updatedAt: function(data) {
      const { doc } = data
      return doc.data.updatedAt ? new Date(doc.data.updatedAt) : null
    },

    isPlaceholder: function(data) {
      const { doc } = data
      return hasTag(doc.data.tags, 'placeholder')
    },

    documentTitle: function(data) {
      return titleFormatter([data.title, data.categoryName, 'Дока'])
    },

    articleTag: function(data) {
      const { doc } = data
      return doc.data.tags[0]
    },

    articleCategory: function(data) {
      const { docPath } = data
      const categoryKeys = Object.keys(mainSections)
      for (const index in categoryKeys) {
        if (docPath.includes(categoryKeys[index])) {
          return mainSections[categoryKeys[index]]
        }
      }
    }
  }
}
