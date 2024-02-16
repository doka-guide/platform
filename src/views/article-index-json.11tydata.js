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
        ?.filter?.(async (article) => {
          const cache = await article.template._frontMatterDataCache
          return cache['tags'].includes('doka')
        })
        ?.reduce?.(async (map, article) => {
          const data = {}
          const cache = await article.template._frontMatterDataCache
          const content = await article.template.inputContent
          data['path'] = `/${category}/${article.fileSlug}/`
          data['related'] = cache['related']
          const summary = content.replace('\n\n', '\n').split('---')[2].split('\n')
          let headerIndices = []
          summary.forEach((string, index) => {
            if (string.startsWith('## ')) {
              headerIndices.push(index)
            }
          })
          map[cache['title']] = {
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
