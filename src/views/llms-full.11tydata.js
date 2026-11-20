const { baseUrl } = require('../../config/constants')

module.exports = {
  permalink: '/llms-full.txt',
  eleventyExcludeFromCollections: true,

  eleventyComputed: {
    llmsFull: function (data) {
      const { collections } = data

      if (!Array.isArray(collections.articleIndexes) || !Array.isArray(collections.docs)) {
        return ''
      }

      const blocks = collections.articleIndexes.map((section) => {
        const id = section.fileSlug
        const docs = collections.docs
          .filter((doc) => doc.filePathStem.split('/')[1] === id)
          .filter((doc) => !(doc.data.tags || []).includes('placeholder'))
          .sort((a, b) => a.fileSlug.localeCompare(b.fileSlug, 'ru'))

        const lines = docs.map((doc) => {
          const title = (doc.data.title || doc.fileSlug).replace(/\n/g, ' ')
          const url = `${baseUrl}${doc.filePathStem.replace(/\/index$/, '/')}index.md`
          const description = (doc.data.description || '').replace(/\s+/g, ' ').trim()
          return description ? `- [${title}](${url}): ${description}` : `- [${title}](${url})`
        })

        return [`## ${section.data.name || id}`, '', ...lines, ''].join('\n')
      })

      return [
        '# Дока — полный список материалов',
        '',
        '> Ссылки ведут на markdown-версии. Заготовки без текста в список не попадают.',
        `> Краткая справка о проекте: ${baseUrl}/llms.txt`,
        '',
        ...blocks,
      ].join('\n')
    },
  },
}
