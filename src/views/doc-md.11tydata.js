const { baseUrl } = require('../../config/constants')

const SOURCE_REPO = 'https://github.com/doka-guide/content/blob/main'
const LICENSE = 'CC BY-NC-SA 4.0'

// Ссылки внутри статьи относительные: `demos/foo/`, `images/bar.png`.
// В markdown-версии их некому достроить, поэтому делаем абсолютными.
function absolutize(text, docUrl) {
  return text
    .replace(/(!?\[[^\]]*\]\()(?!https?:|\/|#|mailto:)/g, `$1${docUrl}`)
    .replace(/(\s(?:src|href|poster)=")(?!https?:|\/|#|data:)/g, `$1${docUrl}`)
}

function scalar(value) {
  // JSON — подмножество YAML, так что кавычки и бэктики в заголовках не ломают фронтматтер
  return JSON.stringify(value ?? null)
}

function list(values) {
  const items = (Array.isArray(values) ? values : [values]).filter(Boolean)
  return items.length ? `[${items.map(scalar).join(', ')}]` : null
}

function date(value) {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10)
}

module.exports = {
  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc',
  },

  permalink: '/{{doc.filePathStem}}.md',

  eleventyComputed: {
    markdown: function (data) {
      const { doc, collections } = data

      // 11ty зондирует вычисляемые поля через Proxy: на этом проходе
      // коллекции ещё не массивы, поэтому проверяем перед обходом
      if (!doc || !doc.filePathStem) {
        return ''
      }

      const category = doc.filePathStem.split('/')[1]
      const docPath = doc.filePathStem.replace(/\/index$/, '/')
      const docUrl = `${baseUrl}${docPath}`
      const tags = doc.data.tags || []

      const sectionName = Array.isArray(collections.articleIndexes)
        ? collections.articleIndexes.find((section) => section.fileSlug === category)?.data.name
        : null

      const frontMatter = [
        ['title', scalar(doc.data.title)],
        ['description', scalar(doc.data.description)],
        ['url', scalar(docUrl)],
        ['section', scalar(sectionName || category)],
        ['createdAt', scalar(date(doc.data.createdAt))],
        ['updatedAt', scalar(date(doc.data.updatedAt))],
        ['baseline', doc.data.baseline ? JSON.stringify(doc.data.baseline) : null],
        ['authors', list(doc.data.authors)],
        ['contributors', list(doc.data.contributors)],
        ['editors', list(doc.data.editors)],
        ['related', list(doc.data.related)],
        ['isPlaceholder', tags.includes('placeholder') ? 'true' : null],
        ['source', scalar(`${SOURCE_REPO}${doc.filePathStem}.md`)],
        ['license', scalar(LICENSE)],
      ]
        .filter(([, value]) => value !== null && value !== 'null')
        .map(([key, value]) => `${key}: ${value}`)

      const title = (doc.data.title || '').replace(/^"|"$/g, '')
      const body = absolutize(doc.rawInput ?? '', docUrl).trim()

      const practices = Array.isArray(collections.practice)
        ? collections.practice
            .filter((practice) => practice.filePathStem.startsWith(`${docPath}practice/`))
            .map((practice) => {
              const personId = practice.fileSlug
              const person = collections.peopleById?.[personId]
              const name = person?.data?.name || personId
              const text = absolutize(practice.rawInput ?? '', docUrl).trim()
              return `## На практике: ${name}\n\n${text}`
            })
        : []

      return ['---', ...frontMatter, '---', '', `# ${title}`, '', body, ...practices.flatMap((p) => ['', p]), ''].join(
        '\n',
      )
    },
  },
}
