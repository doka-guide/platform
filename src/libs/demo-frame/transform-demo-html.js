// Метка, по которой сборка узнаёт уже обработанную демку.
const MARKER_ATTRIBUTE = 'data-demo-frame'

// Ручная шапка из старого шаблона демок. Вторую такую же не добавляем,
// иначе в отдельной вкладке их будет два комплекта.
const HAND_MADE_FRAME = /class\s*=\s*["'][^"']*\bdemo-(?:logo|meta)\b/i

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Собирает тег скрипта рамки. Все данные для подписи едут в data-атрибутах:
 * саму рамку скрипт рисует в браузере и только вне iframe.
 *
 * @param {{ baseUrl: string, articleUrl: string, title: string, authors: { name: string, url: string }[], accent: string }} data
 * @returns {string}
 */
function buildScriptTag(data) {
  const attributes = {
    src: '/scripts/demo-frame.js',
    [MARKER_ATTRIBUTE]: '',
    'data-base-url': data.baseUrl,
    'data-article-url': data.articleUrl,
    'data-article-title': data.title,
    'data-authors': JSON.stringify(data.authors),
    'data-accent': data.accent,
  }

  const serialized = Object.entries(attributes)
    .map(([name, value]) => (value === '' ? name : `${name}="${escapeAttribute(value)}"`))
    .join(' ')

  return `<script ${serialized}></script>`
}

/**
 * Добавляет в HTML демки скрипт, который вне iframe рисует рамку Доки:
 * лого, ссылку на статью и авторов.
 *
 * HTML не пересобирается через парсер, а дополняется строкой. Так демка
 * остаётся байт в байт прежней: парсер переставлял вложенный доктайп SVG
 * в начало файла и переводил страницу в режим совместимости.
 *
 * Идемпотентна: повторный вызов возвращает файл без изменений.
 *
 * @param {string} html — исходный HTML демки
 * @param {{ baseUrl: string, articleUrl: string, title: string, authors: { name: string, url: string }[], accent: string }} data
 * @returns {string} обновлённый HTML
 */
function transformDemoHtml(html, data) {
  if (html.includes(MARKER_ATTRIBUTE) || HAND_MADE_FRAME.test(html)) {
    return html
  }

  const tag = buildScriptTag(data)

  // Перед </head>: так `<meta charset>` остаётся в первых байтах файла.
  const headEnd = html.search(/<\/head\s*>/i)
  if (headEnd !== -1) {
    return `${html.slice(0, headEnd)}${tag}\n${html.slice(headEnd)}`
  }

  const bodyStart = html.search(/<body[\s>]/i)
  if (bodyStart !== -1) {
    return `${html.slice(0, bodyStart)}${tag}\n${html.slice(bodyStart)}`
  }

  return `${html}\n${tag}\n`
}

module.exports = { transformDemoHtml, MARKER_ATTRIBUTE }
