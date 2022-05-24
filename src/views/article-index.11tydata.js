const { titleFormatter } = require('../libs/title-formatter/title-formatter')

const letterOnlyRegExp = /[a-zа-яё]/i

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.articleIndexes',
    size: 1,
    alias: 'articleIndex',
  },

  permalink: '/{{ articleIndex.fileSlug }}/',

  eleventyComputed: {
    category: function (data) {
      const { articleIndex } = data
      return articleIndex.fileSlug
    },

    categoryName: function (data) {
      const { articleIndex } = data
      return articleIndex.data.name
    },

    documentTitle: function (data) {
      return titleFormatter([data.categoryName, 'Дока'])
    },

    documentDescription: function (data) {
      const { categoryName } = data
      return `Статьи Доки по теме «${categoryName}»`
    },

    categoryLink: function (data) {
      const { category } = data
      return `/${category}/`
    },

    categoryArticles: function (data) {
      const { collections, category } = data
      return collections[category]
    },

    categoryArticlesBySlug: function (data) {
      const { categoryArticles } = data
      return categoryArticles?.reduce?.((map, article) => {
        map[article.fileSlug] = article
        return map
      }, {})
    },

    categoryArticlesByAlphabet: function (data) {
      const { categoryArticles } = data
      return categoryArticles?.reduce?.((map, article) => {
        const { title } = article.data

        let firstLetter
        for (const letter of title) {
          if (letterOnlyRegExp.test(letter)) {
            firstLetter = letter.toLowerCase()
            break
          }
        }

        map[firstLetter] = map[firstLetter] || []
        map[firstLetter].push(article.fileSlug)
        return map
      }, {})
    },

    firstLettersOfArticles: function (data) {
      const { categoryArticlesByAlphabet = {} } = data
      return Object.keys(categoryArticlesByAlphabet).sort()
    },

    allGroups: function (data) {
      const { collections, category } = data
      const { articleIndexes } = collections
      const { allGroupsByCategory } = articleIndexes

      return allGroupsByCategory?.[category]
    },

    groupsBySlug: function (data) {
      const { collections } = data
      const { articleIndexes } = collections

      return articleIndexes.groupsByArticle
    },
  },
}
