// дата-заглушка, если в статье нет даты последнего обновления
const updatedDatePlaceholder = new Date(2021, 1, 9)

module.exports = {
  layout: 'base.njk',

  bodyClass: 'aside-page',

  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc'
  },

  permalink: '/{{doc.filePathStem}}.html',

  eleventyComputed: {
    title: function(data) {
      const { doc } = data

      return doc.data.title
    },

    docPath: function(data) {
      return data.doc.filePathStem.replace('index', '');
    },

    practices: function(data) {
      const allPractices = data.collections.practice
      const { docPath } = data

      return allPractices.filter(practice => {
        return practice.filePathStem.includes(docPath)
      })
    },

    updatedAt: function(data) {
      const { doc } = data
      const date = doc.data.updatedAt
        ? doc.data.updatedAt instanceof Date
          ? doc.data.updatedAt
          : new Date(doc.data.updatedAt)
        : updatedDatePlaceholder
      return date
    }
  }
}
