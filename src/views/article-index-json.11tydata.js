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

      // Раньше здесь читался внутренний API 11ty — template._frontMatterDataCache
      // и template.inputContent. В третьей версии их нет, всё нужное лежит в
      // публичных article.data и article.rawInput. Важное отличие: rawInput
      // отдаёт текст уже без фронтматтера, поэтому пропускать его split'ом
      // по «---» больше не надо.
      //
      // Заодно убраны async-колбэки у filter и reduce. Промис всегда истинный,
      // поэтому filter ничего не отсеивал, а аккумулятор reduce после первой
      // итерации становился промисом — из-за этого в файл попадала ровно одна
      // статья вместо всего раздела.
      // 11ty зондирует вычисляемые поля через Proxy, чтобы понять, какие
      // данные они читают. На этом проходе categoryArticles — не массив,
      // поэтому проверка обязательна.
      if (!Array.isArray(categoryArticles)) {
        return {}
      }

      return categoryArticles
        .filter((article) => article.data.tags?.includes('doka'))
        .reduce((map, article) => {
          const lines = (article.rawInput ?? '').split('\n')
          const headingIndices = []

          lines.forEach((line, index) => {
            if (line.startsWith('## ')) {
              headingIndices.push(index)
            }
          })

          map[article.data.title] = {
            path: `/${category}/${article.fileSlug}/`,
            related: article.data.related,
            summary: lines
              .slice(0, headingIndices[1])
              .filter((line) => line !== '')
              .filter((line) => line !== '## Кратко'),
          }

          return map
        }, {})
    },
  },
}
