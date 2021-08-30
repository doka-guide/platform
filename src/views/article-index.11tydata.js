module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.articleIndexes',
    size: 1,
    alias: 'articleIndex'
  },

  permalink: '/{{articleIndex.fileSlug}}/',

  firstLetterBlackList: ['::', ':', '!', '@'],

  eleventyComputed: {
    category: function(data) {
      const { articleIndex } = data
      return articleIndex.fileSlug
    },

    categoryName: function(data) {
      const { articleIndex } = data
      return articleIndex.data.name
    },

    groups: function(data) {
      const { articleIndex } = data
      return articleIndex.data.groups
    },

    categoryArticles: function(data) {
      const { collections, category } = data
      return collections[category]
    },

    categoryArticlesBySlug: function(data) {
      const { categoryArticles } = data
      return categoryArticles?.reduce?.((map, article) => {
        map[article.fileSlug] = article
        return map
      }, {})
    },

    categoryArticlesByAlphabet: function(data) {
      const { categoryArticles, firstLetterBlackList } = data
      return categoryArticles?.reduce?.((map, article) => {
        let { title } = article.data

        // удаляем '<' из начала названия статьи
        if (title[0] === '<') {
          title = title.replace('<', '')
        }

        // удаляем символы из `firstLetterBlackList` из начала названия статьи
        for (const symbols of firstLetterBlackList) {
          if (title.startsWith(symbols)) {
            title = title.replace(symbols, '')
            break
          }
        }

        const firstLetter = title[0].toLowerCase()
        map[firstLetter] = map[firstLetter] || []
        map[firstLetter].push(article.fileSlug)
        return map
      }, {})
    },

    firstLettersOfArticles: function(data) {
      const { categoryArticlesByAlphabet = {} } = data
      return Object.keys(categoryArticlesByAlphabet).sort()
    }
  }
}
