const { baseUrl } = require('../../config/constants')
const llms = require('./llms.11tydata')

module.exports = {
  permalink: '/index.md',
  eleventyExcludeFromCollections: true,

  eleventyComputed: {
    // Текст тот же, что в llms.txt, но с фронтматтером, как у markdown-версий статей:
    // агент узнаёт название и адрес, не разбирая текст. В сам llms.txt фронтматтер
    // не ставим — по формату файл начинается с заголовка.
    markdown: function (data) {
      const text = llms.eleventyComputed.llms(data)

      if (!text) {
        return ''
      }

      return [
        '---',
        'title: "Дока"',
        'description: "Документация для разработчиков на понятном языке"',
        `url: "${baseUrl}/"`,
        '---',
        '',
        text,
      ].join('\n')
    },
  },
}
