// Списки для офлайн-страницы: что откроется без сети. На входе — адреса и разметка
// из кеша сервис-воркера в порядке добавления, на выходе — статьи с разделом
// и остальные страницы, свежие сверху.
const SITE_SUFFIX = / — Дока$/
const SECTIONS = '(a11y|css|html|js|tools|recipes)'
const ARTICLE_PATH = new RegExp(`^/${SECTIONS}/[^/]+/$`)
const SECTION_PATH = new RegExp(`^/${SECTIONS}/$`)

export function getSavedPages(entries, { currentPath = '' } = {}) {
  const parser = new DOMParser()
  const articles = []
  const others = []
  const seen = new Set()

  for (const { url, html } of [...entries].reverse()) {
    const { pathname } = new URL(url)
    // Страница с utm-метками лежит в кеше отдельной записью. Обход идёт от свежих
    // записей, поэтому остаётся самая свежая копия
    if (seen.has(pathname)) {
      continue
    }
    seen.add(pathname)
    const title = parser.parseFromString(html, 'text/html').title.trim().replace(SITE_SUFFIX, '')

    // Демки воркер сохраняет, чтобы статьи без сети открывались с ними, но сами по себе
    // это не страницы для чтения. Сама заглушка и недоступная страница вели бы сюда же.
    if (!title || pathname === '/offline/' || pathname === currentPath || pathname.includes('/demos/')) {
      continue
    }

    const section = pathname.match(ARTICLE_PATH)?.[1]
    if (section) {
      // В заголовке статьи раздел идёт последним: «<header> — HTML»
      const parts = title.split(' — ')
      articles.push({
        href: pathname,
        title: parts.slice(0, -1).join(' — ') || title,
        section,
        sectionName: parts.at(-1),
      })
    } else if (pathname === '/') {
      others.push({ href: pathname, title: 'главная', order: 0 })
    } else if (SECTION_PATH.test(pathname)) {
      // Без слова «раздел» название путается с плашкой раздела в списке статей
      others.push({ href: pathname, title: `раздел ${title}`, order: 1 })
    } else {
      others.push({ href: pathname, title, order: 2 })
    }
  }

  // Главная, потом разделы, потом остальное. Внутри группы свежие сверху: sort устойчивая
  others.sort((a, b) => a.order - b.order)

  return { articles, others: others.map(({ href, title }) => ({ href, title })) }
}
