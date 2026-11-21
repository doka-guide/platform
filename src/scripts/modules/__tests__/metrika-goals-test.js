/**
 * @jest-environment jsdom
 */

import { findGoal, init } from '../metrika-goals.js'
import { reachGoal } from '../../core/metrika.js'

afterEach(() => {
  document.body.innerHTML = ''
  delete window.ym
})

test('выделение внутри кода статьи и команды MCP даёт свою цель', () => {
  document.body.innerHTML = `
    <code class="intro__command">claude mcp add doka</code>
    <div class="article__content-inner"><pre><code>const a = 1;</code></pre><p>Текст</p></div>
  `

  expect(findGoal(document.querySelector('.intro__command').firstChild)).toBe('main_mcp_copy')
  expect(findGoal(document.querySelector('pre code').firstChild)).toBe('article_code_select_copy')
  expect(findGoal(document.querySelector('p').firstChild)).toBeNull()
  expect(findGoal(null)).toBeNull()
})

test('копирование команды MCP выделением отправляет цель, обычный текст — нет', () => {
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
  expect(() => reachGoal('page_404')).not.toThrow()

  window.ym = jest.fn()
  reachGoal('search_empty', { query: 'flex' })
  reachGoal('page_404')

  expect(window.ym).toHaveBeenNthCalledWith(1, 83244811, 'reachGoal', 'search_empty', {
    search_empty: { query: 'flex' },
  })
  expect(window.ym).toHaveBeenNthCalledWith(2, 83244811, 'reachGoal', 'page_404', undefined)
})
