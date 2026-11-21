// Инструменты WebMCP: браузерный агент вызывает их прямо на странице Доки
// вместо того, чтобы разбирать вёрстку. Имена и параметры search_doka и
// read_doka совпадают с npm-пакетом @doka-guide/mcp: агент, который знает
// один сервер, без подсказок работает и со вторым.
//
// Всё внешнее (fetch, подтверждение, адрес страницы) приходит снаружи,
// поэтому инструменты проверяются тестами без браузера.

export const SECTIONS = {
  css: 'CSS',
  html: 'HTML',
  js: 'JavaScript',
  a11y: 'Доступность',
  tools: 'Веб-платформа',
  recipes: 'Рецепты',
}

const SEARCH_URL = 'https://search.doka.guide'
const API_URL = 'https://api.doka.guide'

// Готовые ответы кнопок формы «Статья была полезной?» — сервер ждёт их дословно
export const FEEDBACK_ANSWERS = [
  'Понравилось',
  'Статья слишком сложная',
  'Статья устарела',
  'В статье не хватает информации',
]

// Тот же порог, что у поля «Другая причина» в форме отзыва
const COMMENT_THRESHOLD = 4

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/

const sectionEnum = Object.keys(SECTIONS)

// «css/overflow», «/css/overflow/», «https://doka.guide/css/overflow/#пример» → «/css/overflow/».
// Демки и вложенные страницы сводим к самой статье.
export function normalizeArticlePath(input) {
  const clean = String(input ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?doka\.guide/, '')
    .replace(/[?#].*$/, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length < 2 || !SECTIONS[parts[0]]) {
    return null
  }
  return `/${parts[0]}/${parts[1]}/`
}

const ENTITIES = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'" }

// Поиск подсвечивает совпадения тегом <mark> и отдаёт заголовки с HTML-сущностями
export function cleanSearchText(text) {
  return String(text ?? '')
    .replace(/<\/?mark>/g, '')
    .replace(/&(lt|gt|amp|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatSearchHits(hits, query, limit) {
  // поиск отдаёт и индексы разделов — у них пустой заголовок
  const found = (hits || []).filter((hit) => cleanSearchText(hit.title)).slice(0, limit)
  if (!found.length) {
    return `В Доке ничего не нашлось по запросу «${query}».`
  }
  const lines = found.map((hit) => {
    const fragment = cleanSearchText(hit.fragments?.[0]).replace(/^\.\.\.|\.\.\.$/g, '')
    const section = SECTIONS[hit.category] ? ` — ${SECTIONS[hit.category]}` : ''
    return `- ${cleanSearchText(hit.title)}${section}\n  путь: ${hit.link}${fragment ? `\n  ${fragment}` : ''}`
  })
  return (
    `Нашлось в Доке (${found.length}):\n\n${lines.join('\n')}\n\n` +
    'Чтобы прочитать материал целиком, вызовите read_doka с полем path.'
  )
}

// Индекс раздела: { "заголовок": { path, related, summary } }
export function formatSectionIndex(index, section) {
  const lines = Object.entries(index || {})
    .map(([title, item]) => `- ${title.replace(/`/g, '')} — ${item.path}`)
    .sort((a, b) => a.localeCompare(b, 'ru'))
  return `Раздел «${SECTIONS[section]}», материалов: ${lines.length}.\n\n${lines.join('\n')}`
}

export function text(value) {
  return { content: [{ type: 'text', text: value }] }
}

export function createTools({ fetch, confirm, location }) {
  async function getJson(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      throw new Error(`${response.status} — ${url}`)
    }
    return response.json()
  }

  // Без path берём статью, которую читает пользователь
  function resolvePath(path) {
    return normalizeArticlePath(path || location.pathname)
  }

  async function post(endpoint, body) {
    const { token } = await getJson('/api.json')
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token },
      body: JSON.stringify({ ...body, author_id: 1 }),
    })
    if (!response.ok) {
      throw new Error(`${response.status} — ${endpoint}`)
    }
  }

  return [
    {
      name: 'search_doka',
      title: 'Поиск по Доке',
      description:
        'Найти материалы Доки — открытой энциклопедии по веб-разработке на русском языке. ' +
        'Разделы: CSS, HTML, JavaScript, доступность, веб-платформа, рецепты. ' +
        'Отдаёт заголовки, пути и фрагменты текста. Полный текст читайте инструментом read_doka.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            minLength: 2,
            description: 'Что искать: название свойства, метода, тега или тема по-русски',
          },
          section: { type: 'string', enum: sectionEnum, description: 'Ограничить раздел' },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
            description: 'Сколько материалов вернуть, по умолчанию 8',
          },
        },
        required: ['query'],
      },
      annotations: { readOnlyHint: true },
      async execute({ query, section, limit = 8 }) {
        const url = new URL(SEARCH_URL)
        url.searchParams.set('search', query)
        if (section) {
          url.searchParams.set('category', section)
        }
        return text(formatSearchHits(await getJson(url.toString()), query, limit))
      },
    },
    {
      name: 'read_doka',
      title: 'Прочитать материал Доки',
      description:
        'Отдаёт материал Доки целиком в markdown вместе с шапкой: дата обновления, поддержка браузерами ' +
        '(поле baseline), авторы, связанные материалы, лицензия. Поле baseline — источник правды о поддержке. ' +
        'Без path отдаёт статью, открытую на этой странице.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Путь к материалу: «css/overflow-wrap», «/js/array-map/» или полный адрес на doka.guide',
          },
        },
      },
      annotations: { readOnlyHint: true },
      async execute({ path } = {}) {
        const articlePath = resolvePath(path)
        if (!articlePath) {
          return text('Укажите path: эта страница — не материал Доки. Найти материал поможет search_doka.')
        }
        const response = await fetch(`${articlePath}index.md`)
        if (response.status === 404) {
          return text(`Материала ${articlePath} в Доке нет. Найти похожий поможет search_doka.`)
        }
        if (!response.ok) {
          throw new Error(`${response.status} — ${articlePath}index.md`)
        }
        return text(await response.text())
      },
    },
    {
      name: 'list_section',
      title: 'Оглавление раздела Доки',
      description: 'Отдаёт все материалы раздела Доки: заголовок и путь. Подходит, чтобы выбрать, что читать дальше.',
      inputSchema: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: sectionEnum, description: 'Раздел' },
        },
        required: ['section'],
      },
      annotations: { readOnlyHint: true },
      async execute({ section }) {
        if (!SECTIONS[section]) {
          return text(`Такого раздела нет. Разделы: ${sectionEnum.join(', ')}.`)
        }
        return text(formatSectionIndex(await getJson(`/${section}/index.json`), section))
      },
    },
    {
      name: 'get_related',
      title: 'Связанные материалы',
      description:
        'Отдаёт материалы, которые редакция Доки советует читать вместе с этим: связанные, предыдущий и ' +
        'следующий в разделе. Без path — для статьи на этой странице.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Путь к материалу, как в read_doka' },
        },
      },
      annotations: { readOnlyHint: true },
      async execute({ path } = {}) {
        const articlePath = resolvePath(path)
        if (!articlePath) {
          return text('Укажите path: эта страница — не материал Доки.')
        }
        const { links } = await getJson(`${articlePath}index.json`)
        const groups = [
          ['Связанные', links.relatedArticles || []],
          ['Предыдущий в разделе', [links.previousArticle].filter(Boolean)],
          ['Следующий в разделе', [links.nextArticle].filter(Boolean)],
        ].filter(([, paths]) => paths.length)

        if (!groups.length) {
          return text(`У материала ${articlePath} нет связанных.`)
        }

        // заголовки берём из json самих статей; не ответила одна — показываем только путь
        const names = new Map()
        const allPaths = [...new Set(groups.flatMap(([, paths]) => paths))]
        const answers = await Promise.allSettled(allPaths.map((p) => getJson(`${p}index.json`)))
        answers.forEach((answer, i) => {
          if (answer.status === 'fulfilled') {
            names.set(allPaths[i], answer.value.name.replace(/`/g, ''))
          }
        })

        const body = groups
          .map(([label, paths]) => {
            const items = paths.map((p) => (names.has(p) ? `- ${names.get(p)} — ${p}` : `- ${p}`))
            return `${label}:\n${items.join('\n')}`
          })
          .join('\n\n')
        return text(body)
      },
    },
    {
      name: 'send_feedback',
      title: 'Оценить статью',
      description:
        'Отправляет редакции Доки оценку статьи, открытой на этой странице, — как кнопки «Статья была полезной?». ' +
        'Вызывайте только по просьбе пользователя: перед отправкой страница спросит его подтверждение.',
      inputSchema: {
        type: 'object',
        properties: {
          answer: {
            type: 'string',
            enum: FEEDBACK_ANSWERS,
            description: 'Готовый ответ. Не нужен, если есть comment',
          },
          comment: {
            type: 'string',
            minLength: COMMENT_THRESHOLD,
            description: 'Своя причина словами пользователя, если готовые ответы не подходят',
          },
        },
      },
      annotations: { consequentialHint: true },
      async execute({ answer, comment } = {}) {
        const articlePath = normalizeArticlePath(location.pathname)
        if (!articlePath) {
          return text('Оценить можно только статью: откройте материал Доки.')
        }
        const value = comment?.trim() || answer
        if (!value || value.length < COMMENT_THRESHOLD) {
          return text(
            `Нужен answer (${FEEDBACK_ANSWERS.join(', ')}) или comment не короче ${COMMENT_THRESHOLD} символов.`,
          )
        }
        if (!confirm(`Отправить редакции Доки отзыв о статье ${articlePath}?\n\n«${value}»`)) {
          return text('Пользователь отказался отправлять отзыв.')
        }
        // так же, как форма: article_id — путь страницы
        await post('/form', {
          type: 'feedback',
          data: JSON.stringify({ answer: value, article_id: location.pathname }),
        })
        return text('Отзыв отправлен. Спасибо!')
      },
    },
    {
      name: 'subscribe',
      title: 'Подписаться на рассылку Доки',
      description:
        'Подписывает на рассылку Доки о новых материалах. Вызывайте только по просьбе пользователя: ' +
        'страница спросит его подтверждение, а на почту придёт письмо, без которого подписка не начнётся.',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Адрес пользователя' },
        },
        required: ['email'],
      },
      annotations: { consequentialHint: true },
      async execute({ email }) {
        const address = String(email ?? '').trim()
        if (!EMAIL_PATTERN.test(address)) {
          return text(`«${address}» не похож на адрес почты.`)
        }
        if (!confirm(`Подписать ${address} на рассылку Доки?`)) {
          return text('Пользователь отказался от подписки.')
        }
        // как форма в попапе: active: false, подписку включает письмо
        await post('/subscription', { email: address, data: JSON.stringify({ active: false }) })
        return text(`Готово. На ${address} придёт письмо — подписка начнётся после него.`)
      },
    },
  ]
}
