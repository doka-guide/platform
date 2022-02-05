const { titleFormatter } = require('../libs/title-formatter/title-formatter')

const letterOnlyRegExp = /[a-zа-яё]/i

module.exports = {
  pagination: {
    data: 'collections.articleIndexes',
    size: 1,
    alias: 'articleIndex',
  },

  permalink: '/{{ articleIndex.fileSlug }}/index.sc.html',

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

    categoryLink: function (data) {
      const { category } = data
      return `/${category}/`
    },

    groups: function (data) {
      const { articleIndex } = data
      return articleIndex.data.groups
    },

    categoryArticles: function (data) {
      const { collections, category } = data
      return collections[category]
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
  },
}
