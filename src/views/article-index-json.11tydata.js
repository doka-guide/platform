module.exports = {
  pagination: {
    data: 'collections.articleIndexes',
    size: 1,
    alias: 'articleIndex',
  },

  permalink: '/{{ articleIndex.fileSlug }}/index.json',

  eleventyComputed: {
    category: function (data) {
      const { articleIndex } = data
      return articleIndex.fileSlug
    },

    categoryArticles: function (data) {
      const { collections, category } = data
      return collections[category]
    },

    json: function (data) {
      const { category, categoryArticles } = data
      const json = categoryArticles
        ?.filter?.((article) => article.template.dataCache['tags'].includes('doka'))
        ?.reduce?.((map, article) => {
          const data = {}
          data['path'] = `/${category}/${article.fileSlug}/`
          data['related'] = article.template.dataCache['related']
          const summary = article.template.inputContent.replace('\n\n', '\n').split('---')[2].split('\n')
          let headerIndices = []
          summary.forEach((string, index) => {
            if (string.startsWith('## ')) {
              headerIndices.push(index)
            }
          })
          map[article.template.dataCache['title']] = {
            ...data,
            summary: summary
              .slice(0, headerIndices[1])
              .filter((content) => content !== '')
              .filter((content) => content !== '## Кратко'),
          }
          return map
        }, {})
      return json
    },
  },
}
