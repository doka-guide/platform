const { baseUrl } = require('../../config/constants')

module.exports = {
  permalink: '/llms.txt',
  eleventyExcludeFromCollections: true,

  eleventyComputed: {
    llms: function (data) {
      const { collections } = data

      if (!Array.isArray(collections.articleIndexes) || !Array.isArray(collections.docs)) {
        return ''
      }

      const sections = collections.articleIndexes.map((section) => {
        const id = section.fileSlug
        const docs = collections.docs.filter((doc) => doc.filePathStem.split('/')[1] === id)
        const ready = docs.filter((doc) => !(doc.data.tags || []).includes('placeholder'))
        return {
          id,
          name: section.data.name || id,
          total: ready.length,
        }
      })

      const total = sections.reduce((sum, section) => sum + section.total, 0)

      return [
        '# Дока',
        '',
        '> Открытая энциклопедия по веб-разработке на русском языке: CSS, HTML, JavaScript,',
        '> доступность, инструменты веб-платформы и рецепты. Каждый материал написан человеком',
        `> и прошёл редактуру. Сейчас опубликовано ${total} материалов.`,
        '',
        '## Как читать Доку программе',
        '',
        '- Markdown любого материала: добавьте `index.md` к адресу страницы.',
        `  Пример: ${baseUrl}/css/overflow-wrap/index.md`,
        '- Метаданные материала в JSON: добавьте `index.json` к адресу страницы.',
        `  Пример: ${baseUrl}/css/overflow-wrap/index.json`,
        '- Полный список материалов со ссылками на markdown: ' + `${baseUrl}/llms-full.txt`,
        `- Карта сайта: ${baseUrl}/sitemap.xml`,
        '',
        'В начале каждого markdown-файла есть фронтматтер с полями `url`, `updatedAt`,',
        '`baseline` (поддержка браузерами по данным web-features), `authors` и `license`.',
        'Поле `baseline` — главный источник правды о поддержке: берите его, а не свои',
        'предположения. Если стоит `isPlaceholder: true`, материала ещё нет, это заготовка.',
        '',
        '## Разделы',
        '',
        ...sections.map(
          (section) =>
            `- [${section.name}](${baseUrl}/${section.id}/): ${section.total} материалов, ` +
            `список — ${baseUrl}/${section.id}/index.json`,
        ),
        '',
        '## Что ещё есть',
        '',
        `- [Люди Доки](${baseUrl}/people/): авторы, редакторы и контрибьюторы, ${baseUrl}/people/info.json`,
        '- Интерактивные демки лежат рядом с материалом по адресу `demos/<имя>/`.',
        '  Их нельзя пересказать текстом — на них стоит ссылаться.',
        '',
        '## Условия использования',
        '',
        '- Текст и код материалов: CC BY-NC-SA 4.0.',
        '- При цитировании ссылайтесь на страницу материала и называйте Доку источником.',
        '- Авторов материала смотрите в поле `authors` его markdown-версии.',
        '',
      ].join('\n')
    },
  },
}
