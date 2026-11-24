import { getSavedPages } from '../libs/saved-pages.js'

// Без сети офлайн-страница показывает то, что откроется: страницы из кеша
// сервис-воркера. Имя кеша задаёт src/sw.js, версию в нём берём любую.
const PAGES_CACHE_PREFIX = 'doka-pages-'

async function readCachedPages() {
  const names = (await caches.keys()).filter((name) => name.startsWith(PAGES_CACHE_PREFIX))
  const entries = []
  for (const name of names) {
    const cache = await caches.open(name)
    for (const request of await cache.keys()) {
      const response = await cache.match(request)
      entries.push({ url: request.url, html: await response.text() })
    }
  }
  return entries
}

function createLink(href, text) {
  const link = document.createElement('a')
  link.className = 'offline-page__link link'
  link.href = href
  link.textContent = text
  return link
}

function renderArticles(list, articles) {
  list.replaceChildren(
    ...articles.map(({ href, title, section, sectionName }) => {
      const item = document.createElement('li')
      const label = document.createElement('span')
      item.className = 'offline-page__article'
      label.className = 'offline-page__section'
      label.style.setProperty('--accent-color', `var(--color-${section})`)
      label.textContent = sectionName
      item.append(label, createLink(href, title))
      return item
    }),
  )
  list.hidden = false
}

function renderOthers(paragraph, others) {
  others.forEach(({ href, title }, index) => {
    paragraph.append(createLink(href, title), index < others.length - 1 ? ', ' : '')
  })
  paragraph.hidden = false
}

async function init() {
  const list = document.querySelector('.offline-page__articles')
  if (!list) {
    return
  }

  // Сеть вернулась — открываем страницу, ради которой пришёл читатель, не дожидаясь нажатия кнопки
  window.addEventListener('online', () => window.location.reload(), { once: true })

  if (!('caches' in window)) {
    return
  }

  const { articles, others } = getSavedPages(await readCachedPages(), { currentPath: window.location.pathname })
  if (articles.length === 0 && others.length === 0) {
    return
  }

  document.querySelector('.offline-page__hint').textContent = 'Зато эти страницы сохранены и откроются:'
  if (articles.length > 0) {
    renderArticles(list, articles)
  }
  if (others.length > 0) {
    renderOthers(document.querySelector('.offline-page__others'), others)
  }
}

init()
