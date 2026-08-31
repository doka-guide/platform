// Разбор CHANGELOG.md из репозитория контента в записи для RSS-фида.
//
// Файл выглядит так:
//
//   ## Июль 2026
//
//   - 18 июля, [`WebSocket`](https://doka.guide/js/websocket/), Игорь Теплостанский
//
// Год живёт в заголовке месяца, день и месяц — в самой строке, поэтому
// разбирать приходится построчно, запоминая последний встреченный год.

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const YEAR_HEADING = /^## .+ (\d{4})$/
const POST_LINE = /^- (\d{1,2}) ([а-яё]+), \[(.+)\]\((https?:\/\/[^)\s]+)\)/

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (symbol) => HTML_ESCAPES[symbol])
}

function parseChangelog(markdown) {
  const posts = []
  let year = null

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim()

    const heading = line.match(YEAR_HEADING)
    if (heading) {
      year = Number(heading[1])
      continue
    }

    const post = line.match(POST_LINE)
    if (!post || year === null) {
      continue
    }

    const [, day, monthName, title, url] = post
    const month = MONTHS.indexOf(monthName)
    if (month === -1) {
      continue
    }

    posts.push({
      // Дата собирается в UTC: Date.parse('2026-8-31') разбирает строку как
      // локальное время, и на машине восточнее Гринвича статья уезжала
      // на день назад — фид отличался от собранного на сервере.
      date: new Date(Date.UTC(year, month, Number(day))).toISOString(),
      // Заголовки в CHANGELOG приходят с разметкой: `:autofill`.
      title: title.replace(/`/g, ''),
      url,
    })
  }

  return posts
}

// Обложка — та же картинка, что уходит в og:image на странице материала:
// либо явная из фронтматтера, либо сгенерированная снаружи репозитория
// по соглашению об именах (см. «Social cards» в docs/recipes.md).
function coverUrl(post, articleData) {
  return post.url + (articleData?.cover?.og ?? 'images/covers/og.png')
}

// Описание приходит с markdown-разметкой: «содержимого `<details>`». В соцсети
// такое уезжает через doc.11tydata.js с вырезанными кавычками и скобками —
// там значение метатега, разметке взяться неоткуда. В содержимом записи
// разметка своя, поэтому код становится кодом, а скобки остаются на месте.
function descriptionToHtml(description) {
  return escapeHtml(description).replace(/`([^`]+)`/g, '<code>$1</code>')
}

// Материала может не быть в сборке: CHANGELOG приходит из main репозитория
// контента, а локально подключены не все разделы (CONTENT_REP_FOLDERS).
// Адрес обложки собирается из ссылки, поэтому есть всегда, описание — нет.
function enrichPost(post, articleData) {
  return {
    ...post,
    cover: coverUrl(post, articleData),
    content: articleData?.description ? `<p>${descriptionToHtml(articleData.description)}</p>` : '',
  }
}

module.exports = { parseChangelog, enrichPost }
