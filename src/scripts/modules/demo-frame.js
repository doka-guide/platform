// Рамка демки: полоса внизу с лого Доки, ссылкой на статью и авторами.
//
// Сборка (src/libs/demo-frame/) кладёт в каждую демку тег этого скрипта
// с данными в data-атрибутах. Сама рамка появляется только тогда, когда
// демку открыли отдельной вкладкой. В iframe статьи скрипт ничего не делает:
// DOM демки остаётся прежним.
//
// Рамка живёт в Shadow DOM. Стили демки (`a { … }`, `footer { … }`, шрифт
// body) до неё не достают, а её стили не задевают демку.

export const HOST_TAG = 'doka-demo-frame'

const MONO_FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

const STYLES = `
  :host {
    all: initial;
  }

  .bar {
    --accent: hsl(0 0% 100%);

    position: fixed;
    z-index: 2147483647;
    right: 0;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    column-gap: 16px;
    padding: 4px 16px;
    padding-bottom: max(4px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--accent);
    background-color: #18191C;
    color: #FFFFFF;
    color-scheme: dark;
    font: 400 13px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    letter-spacing: normal;
    text-align: left;
    -webkit-font-smoothing: antialiased;
  }

  .main {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    column-gap: 12px;
    min-width: 0;
  }

  /* Полоса всегда в одну строку: длинный заголовок и авторы
     обрезаются многоточием, полный текст — в подсказке. */
  .title,
  .authors {
    overflow: hidden;
    min-width: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .authors {
    flex: 0 1 auto;
    max-width: 40%;
    /* Место под обводку фокуса: иначе её обрежет overflow. */
    margin: -4px -4px -4px auto;
    padding: 4px;
  }

  /* Каждый автор — свой блок со своим многоточием: так обводка фокуса
     у обрезанного имени остаётся целой. */
  .authors a {
    overflow: hidden;
    max-width: 100%;
    padding: 0;
    vertical-align: top;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  a {
    display: inline-block;
    padding-top: 4px;
    padding-bottom: 4px;
    border-radius: 2px;
    color: inherit;
    text-decoration-line: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, var(--accent) 75%, transparent);
    text-underline-offset: 0.2em;
    transition: text-decoration-color 0.15s, opacity 0.15s;
  }

  a:hover {
    text-decoration-color: var(--accent);
  }

  a:active {
    opacity: 0.7;
  }

  a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .logo {
    font-family: ${MONO_FONT};
    letter-spacing: -0.05em;
    flex-shrink: 0;
    white-space: nowrap;
    text-decoration-line: none;
    opacity: 0.8;
  }

  .logo:hover,
  .logo:focus-visible {
    opacity: 1;
  }

  .spacer {
    position: absolute;
    left: 0;
    width: 1px;
    height: 1px;
    visibility: hidden;
    pointer-events: none;
  }

  code {
    font-family: ${MONO_FONT};
    font-size: 0.95em;
  }

  @media print {
    .bar,
    .spacer {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
`

/**
 * Достаёт данные рамки из data-атрибутов тега скрипта.
 *
 * @param {HTMLScriptElement | null} script
 * @returns {{ baseUrl: string, articleUrl: string, title: string, authors: { name: string, url: string }[], accent: string } | null}
 */
export function readFrameData(script) {
  if (!script) {
    return null
  }

  const { baseUrl, articleUrl, articleTitle, authors, accent } = script.dataset
  if (!baseUrl || !articleUrl || !articleTitle) {
    return null
  }

  return { baseUrl, articleUrl, title: articleTitle, authors: parseAuthors(authors), accent: accent || '' }
}

function parseAuthors(json) {
  try {
    const authors = JSON.parse(json || '[]')
    return Array.isArray(authors) ? authors.filter((author) => author && author.name && author.url) : []
  } catch {
    return []
  }
}

/**
 * Превращает заголовок статьи в узлы: части в обратных кавычках — в `<code>`,
 * как на сайте. Всё вставляется через textContent, без разбора HTML.
 *
 * @param {Document} doc
 * @param {string} title
 * @returns {Node[]}
 */
export function renderTitle(doc, title) {
  return title.split('`').map((part, index) => {
    if (index % 2 === 0) {
      return doc.createTextNode(part)
    }
    const code = doc.createElement('code')
    code.textContent = part
    return code
  })
}

function createLink(doc, { href, text, className, label, hint }) {
  const link = doc.createElement('a')
  link.href = href
  if (className) {
    link.className = className
  }
  if (label) {
    link.setAttribute('aria-label', label)
  }
  if (hint) {
    link.title = hint
  }
  if (typeof text === 'string') {
    link.textContent = text
  } else {
    link.append(...text)
  }
  return link
}

/**
 * Рисует рамку и добавляет её в `<html>` после body.
 *
 * @param {Document} doc
 * @param {{ baseUrl: string, articleUrl: string, title: string, authors: { name: string, url: string }[], accent: string }} data
 * @returns {HTMLElement} хост рамки
 */
export function mountFrame(doc, data) {
  const host = doc.createElement(HOST_TAG)
  // Инлайн-стиль сильнее правил демки вроде `body > * { … }`.
  host.setAttribute('style', 'all: initial !important')

  const root = host.attachShadow({ mode: 'open' })

  const style = doc.createElement('style')
  style.textContent = STYLES

  const bar = doc.createElement('aside')
  bar.className = 'bar'
  bar.setAttribute('aria-label', 'Демка из Доки')
  // Демка может быть на другом языке, а подписи в полосе всегда русские.
  bar.setAttribute('lang', 'ru')
  if (data.accent) {
    bar.style.setProperty('--accent', data.accent)
  }

  const main = doc.createElement('div')
  main.className = 'main'
  main.append(
    createLink(doc, { href: data.baseUrl, text: 'U•ᴥ•U Дока', className: 'logo', label: 'Дока — на главную' }),
    createLink(doc, {
      href: data.articleUrl,
      text: renderTitle(doc, data.title),
      className: 'title',
      hint: data.title.replace(/`/g, ''),
    }),
  )
  bar.append(main)

  if (data.authors.length > 0) {
    const authors = doc.createElement('div')
    authors.className = 'authors'
    authors.title = data.authors.map((author) => author.name).join(', ')
    data.authors.forEach((author, index) => {
      if (index > 0) {
        authors.append(doc.createTextNode(', '))
      }
      authors.append(createLink(doc, { href: author.url, text: author.name }))
    })
    bar.append(authors)
  }

  root.append(style, bar)
  // Не в body: если body в демке — flex или grid, даже пустой хост
  // становится элементом раскладки и сдвигает содержимое.
  doc.documentElement.append(host)

  return host
}

const REPLACED_ELEMENTS =
  'img, svg, canvas, video, iframe, object, embed, picture, input, button, select, textarea, meter, progress'

function hasOwnText(element) {
  for (const node of element.childNodes) {
    if (node.nodeType === 3 && node.textContent.trim() !== '') {
      return true
    }
  }
  return false
}

function isHidden(element, style) {
  if (typeof element.checkVisibility === 'function') {
    // Видит и скрытых предков, например содержимое закрытого <details>.
    return !element.checkVisibility({ visibilityProperty: true })
  }
  return style.visibility === 'hidden' || style.display === 'none'
}

function isClipping(overflow) {
  return Boolean(overflow) && overflow !== 'visible'
}

/**
 * Можно ли вообще прокрутить страницу. Если демка запретила прокрутку
 * (`overflow: hidden` у html или body), распорка ничего не откроет.
 *
 * @param {Document} doc
 * @returns {boolean}
 */
export function canScrollPage(doc) {
  const win = doc.defaultView
  const htmlOverflow = win.getComputedStyle(doc.documentElement).overflowY
  const overflow = isClipping(htmlOverflow) ? htmlOverflow : win.getComputedStyle(doc.body).overflowY
  return overflow !== 'hidden' && overflow !== 'clip'
}

/**
 * Нижний край видимой области элемента с учётом предков, которые обрезают
 * содержимое (`overflow` не `visible`). Текст внутри прокручиваемого блока
 * демки ниже края блока не виден, и распорка под ним не нужна.
 *
 * @param {Element | null} element
 * @param {Window} win
 * @param {Map<Element, number>} cache
 * @returns {number} координата во вьюпорте или Infinity
 */
function getClipBottom(element, win, cache) {
  if (!element || element === element.ownerDocument.documentElement) {
    return Infinity
  }
  if (cache.has(element)) {
    return cache.get(element)
  }

  let clip = getClipBottom(element.parentElement, win, cache)
  // overflow у body уходит вьюпорту, если у html он visible: тогда body не обрезает.
  const doc = element.ownerDocument
  const ownsOverflow = element !== doc.body || isClipping(win.getComputedStyle(doc.documentElement).overflowY)
  if (ownsOverflow && isClipping(win.getComputedStyle(element).overflowY)) {
    clip = Math.min(clip, element.getBoundingClientRect().bottom)
  }

  cache.set(element, clip)
  return clip
}

/**
 * Нижняя граница содержимого демки в координатах документа: текста,
 * картинок, полей ввода. Фоновые обёртки во всю высоту не считаются:
 * под рамкой у них нет ничего важного. Содержимое прокручиваемых блоков
 * считается только до края блока. Fixed-элементы и всё внутри них
 * тоже не считаются: они не двигаются при прокрутке, и распорка
 * под ними росла бы без конца.
 *
 * @param {Document} doc
 * @returns {number}
 */
export function measureContentBottom(doc) {
  const win = doc.defaultView
  const fixedElements = []
  const clipCache = new Map()
  let bottom = 0

  for (const element of doc.body.querySelectorAll('*')) {
    if (fixedElements.some((fixed) => fixed.contains(element))) {
      continue
    }

    const style = win.getComputedStyle(element)
    if (style.position === 'fixed') {
      fixedElements.push(element)
      continue
    }

    if (!(element.matches(REPLACED_ELEMENTS) || hasOwnText(element)) || isHidden(element, style)) {
      continue
    }

    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      continue
    }

    const visibleBottom = Math.min(rect.bottom, getClipBottom(element.parentElement, win, clipCache))
    bottom = Math.max(bottom, visibleBottom + win.scrollY)
  }

  return bottom
}

// Зазор между концом содержимого и рамкой, чтобы они не слипались.
const SPACER_GAP = 8

/**
 * Где поставить нижний край распорки: под содержимым демки высота рамки и зазор.
 * Если документ и так длиннее, распорка ничего не меняет. Если короче,
 * у страницы появляется ровно столько прокрутки, сколько нужно, чтобы
 * рамка не закрывала содержимое.
 *
 * @param {{ contentBottom: number, barHeight: number }} sizes
 * @returns {number}
 */
export function getSpacerBottom({ contentBottom, barHeight }) {
  return Math.ceil(contentBottom + barHeight + SPACER_GAP)
}

/**
 * Не даёт рамке закрыть конец демки. Внутри Shadow DOM стоит невидимая
 * абсолютно спозиционированная распорка до нижнего края содержимого плюс
 * высота рамки. Она продлевает прокрутку при любой вёрстке демки, даже
 * при `html { height: 100% }`, и не влияет на flex и grid: у элементов
 * вне потока нет места в раскладке.
 *
 * @param {Document} doc
 * @param {HTMLElement} host
 */
export function reserveSpace(doc, host) {
  const win = doc.defaultView
  const root = host.shadowRoot
  const bar = root.querySelector('.bar')
  const spacer = doc.createElement('div')
  spacer.className = 'spacer'
  spacer.setAttribute('aria-hidden', 'true')
  root.append(spacer)

  const update = () => {
    spacer.style.top = '0px'
    if (!canScrollPage(doc)) {
      return
    }

    const barHeight = bar.getBoundingClientRect().height
    const bottom = getSpacerBottom({ contentBottom: measureContentBottom(doc), barHeight })

    // Начало координат распорки зависит от того, спозиционирован ли html
    // в демке. Поэтому распорка стоит в 0, и мы меряем, где этот 0.
    const origin = spacer.getBoundingClientRect().top + win.scrollY
    spacer.style.top = `${bottom - origin - 1}px`
  }

  update()
  win.addEventListener('load', update)
  win.addEventListener('resize', update)
  if ('ResizeObserver' in win) {
    new win.ResizeObserver(update).observe(doc.body)
  }
}

/**
 * Точка входа: рисует рамку, если демка открыта отдельной вкладкой.
 *
 * @param {HTMLScriptElement | null} script — тег скрипта с данными
 * @param {Window} win
 * @returns {boolean} нарисована ли рамка
 */
export function init(script, win = window) {
  if (win.self !== win.top) {
    return false
  }

  const data = readFrameData(script)
  if (!data) {
    return false
  }

  const doc = win.document
  const mount = () => {
    if (doc.querySelector(HOST_TAG)) {
      return
    }
    const host = mountFrame(doc, data)
    reserveSpace(doc, host)
  }

  if (doc.body) {
    mount()
  } else {
    doc.addEventListener('DOMContentLoaded', mount, { once: true })
  }

  return true
}
