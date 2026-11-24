/**
 * @jest-environment jsdom
 */

const { getSavedPages } = require('../saved-pages.js')

const page = (path, title) => ({
  url: `https://doka.guide${path}`,
  html: `<!DOCTYPE html><html><head><title>${title}</title></head><body></body></html>`,
})

test('статья: заголовок без раздела и названия сайта, раздел отдельно', () => {
  const { articles } = getSavedPages([page('/html/header/', '&lt;header&gt; — HTML — Дока')])

  expect(articles).toEqual([{ href: '/html/header/', title: '<header>', section: 'html', sectionName: 'HTML' }])
})

test('разделы, главная и страницы участников идут отдельно: главная, разделы, остальное', () => {
  const { articles, others } = getSavedPages([
    page('/', 'Дока'),
    page('/people/solarrust/', 'Алёна Батицкая — Дока'),
    page('/html/', 'HTML — Дока'),
    page('/css/', 'CSS — Дока'),
  ])

  expect(articles).toEqual([])
  // Без слова «раздел» название путается с плашкой раздела у статей
  expect(others.map(({ title }) => title)).toEqual(['главная', 'раздел CSS', 'раздел HTML', 'Алёна Батицкая'])
})

test('свежие страницы сверху', () => {
  const { articles } = getSavedPages([
    page('/css/grid/', 'Grid — CSS — Дока'),
    page('/js/promise/', 'Promise — JavaScript — Дока'),
  ])

  expect(articles.map(({ href }) => href)).toEqual(['/js/promise/', '/css/grid/'])
})

test('не показывает саму офлайн-страницу и ту, что не открылась', () => {
  // Заглушка отдаётся по адресу недоступной страницы, ссылка на него вела бы обратно сюда
  const { articles, others } = getSavedPages(
    [
      page('/offline/', 'Вы сейчас не в сети — Дока'),
      page('/js/promise/', 'Promise — JavaScript — Дока'),
      page('/css/', 'CSS — Дока'),
    ],
    { currentPath: '/js/promise/' },
  )

  expect(articles).toEqual([])
  expect(others).toEqual([{ href: '/css/', title: 'раздел CSS' }])
})

test('не показывает демки из статей', () => {
  const { articles, others } = getSavedPages([
    page('/html/h1-h6/', '&lt;h1&gt;…&lt;h6&gt; — HTML — Дока'),
    page('/html/h1-h6/demos/levels/', 'Заголовки 6 уровней — &lt;h1&gt;-&lt;h6&gt;'),
  ])

  expect(articles.map(({ href }) => href)).toEqual(['/html/h1-h6/'])
  expect(others).toEqual([])
})

test('одна страница с разными строками запроса попадает в список один раз', () => {
  const { articles } = getSavedPages([
    page('/css/grid/', 'Grid — CSS — Дока'),
    page('/css/grid/?utm_source=tg', 'Grid — CSS — Дока'),
  ])

  expect(articles.map(({ href }) => href)).toEqual(['/css/grid/'])
})

test('пропускает страницы без заголовка', () => {
  expect(getSavedPages([page('/feed/', '')])).toEqual({ articles: [], others: [] })
})
