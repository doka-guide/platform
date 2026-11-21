/**
 * @jest-environment jsdom
 */

import { findGoal, init } from '../metrika-goals.js'
import { reachGoal } from '../../core/metrika.js'

function gallery() {
  return `
    <section class="articles-gallery">
      <ul class="featured-articles-list">
        <li class="featured-articles-list__item"><a class="featured-article__link" href="/css/layer/">Слои</a></li>
        <li class="featured-articles-list__item"><a class="featured-article__link" href="/js/var-let/">var и let</a></li>
      </ul>
      <button class="articles-gallery__more-button">Показать ещё</button>
    </section>
  `
}

afterEach(() => {
  document.body.innerHTML = ''
  delete window.ym
})

test('клик по избранной статье на главной отдаёт позицию и адрес', () => {
  document.body.innerHTML = `<div class="container"><div class="intro"></div>${gallery()}</div>`
  const link = document.querySelectorAll('.featured-article__link')[1]

  expect(findGoal(link)).toEqual({ goal: 'main_featured_click', params: { position: 2, url: '/js/var-let/' } })
  expect(findGoal(document.querySelector('.articles-gallery__more-button')).goal).toBe('main_featured_more')
})

test('та же галерея под статьёй считается отдельной целью', () => {
  document.body.innerHTML = `<div class="doc__related-articles">${gallery()}</div>`
  const link = document.querySelector('.featured-article__link')

  expect(findGoal(link)).toEqual({ goal: 'article_related_click', params: { position: 1, url: '/css/layer/' } })
})

test('ссылка на демку внутри статьи не попадает в общие ссылки текста', () => {
  document.body.innerHTML = `
    <div class="article__content-inner">
      <a href="/css/grid/">Гриды</a>
      <figure><figcaption class="figure__caption"><a href="/css/demos/x/" target="_blank">Открыть демо</a></figcaption></figure>
    </div>
  `
  const [contentLink, demoLink] = document.querySelectorAll('a')

  expect(findGoal(contentLink).goal).toBe('article_content_link')
  expect(findGoal(demoLink).goal).toBe('article_demo_open')
})

test('позиция в выдаче поиска считается по пунктам списка, а не внутри карточки', () => {
  document.body.innerHTML = `
    <ul class="search-result-list">
      <li class="search-result-list__item"><article class="search-hit"><a class="search-hit__link" href="/a/">А</a></article></li>
      <li class="search-result-list__item"><article class="search-hit"><a class="search-hit__link" href="/b/">Б</a></article></li>
    </ul>
  `
  const link = document.querySelectorAll('.search-hit__link')[1]

  expect(findGoal(link)).toEqual({ goal: 'search_hit_click', params: { position: 2, url: '/b/' } })
})

test('клик мимо размеченных элементов цель не шлёт', () => {
  document.body.innerHTML = '<p>Просто текст</p>'

  expect(findGoal(document.querySelector('p'))).toBeNull()
  expect(findGoal(document)).toBeNull()
})

test('цель доходит, даже если компонент остановил всплытие', () => {
  const root = document.createElement('div')
  root.innerHTML = '<div class="block-code"><button class="block-code__copy-button">Копировать</button></div>'
  const report = jest.fn()
  const button = root.querySelector('button')
  button.addEventListener('click', (event) => event.stopPropagation())

  init(root, report)
  button.click()

  expect(report).toHaveBeenCalledWith('article_copy_code', undefined)
})

test('копирование команды MCP выделением тоже цель', () => {
  document.body.innerHTML = '<code class="intro__command">claude mcp add doka</code><p>Текст</p>'
  const report = jest.fn()
  init(document.body, report)

  document.getSelection().selectAllChildren(document.querySelector('p'))
  document.body.dispatchEvent(new Event('copy'))
  document.getSelection().selectAllChildren(document.querySelector('.intro__command'))
  document.body.dispatchEvent(new Event('copy'))

  expect(report.mock.calls).toEqual([['main_mcp_copy']])
})

test('страница с data-page-goal отправляет цель при загрузке', () => {
  const root = document.createElement('div')
  root.innerHTML = '<div class="not-found" data-page-goal="page_404"></div>'
  const report = jest.fn()

  init(root, report)

  expect(report).toHaveBeenCalledWith('page_404')
})

test('reachGoal кладёт параметры под именем цели и молчит без счётчика', () => {
  expect(() => reachGoal('main_featured_more')).not.toThrow()

  window.ym = jest.fn()
  reachGoal('main_featured_click', { position: 1 })
  reachGoal('main_featured_more')

  expect(window.ym).toHaveBeenNthCalledWith(1, 83244811, 'reachGoal', 'main_featured_click', {
    main_featured_click: { position: 1 },
  })
  expect(window.ym).toHaveBeenNthCalledWith(2, 83244811, 'reachGoal', 'main_featured_more', undefined)
})
