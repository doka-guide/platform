/**
 * @jest-environment jsdom
 */

import { init, withTracking } from '../webmcp.js'

function fakeContext() {
  const tools = []
  return { tools, registerTool: jest.fn((tool) => tools.push(tool.name)) }
}

afterEach(() => {
  document.body.innerHTML = ''
})

test('без WebMCP в браузере ничего не регистрирует и не шлёт цели', () => {
  const report = jest.fn()
  expect(() => init({ report })).not.toThrow()
  expect(report).not.toHaveBeenCalled()
})

test('на странице без формы отзыва нет send_feedback', () => {
  const context = fakeContext()
  const report = jest.fn()
  init({ context, report })
  expect(context.tools).toEqual(['search_doka', 'read_doka', 'list_section', 'get_related', 'subscribe'])
  expect(report).toHaveBeenCalledWith('webmcp_ready')
})

test('на статье с формой отзыва send_feedback есть', () => {
  document.body.innerHTML = '<form class="feedback-form"></form>'
  const context = fakeContext()
  init({ context, report: jest.fn() })
  expect(context.tools).toContain('send_feedback')
})

test('вызов инструмента отправляет цель в Метрику', async () => {
  const report = jest.fn()
  const execute = jest.fn(async () => 'ok')
  const tool = withTracking({ name: 'read_doka', execute }, report)
  await tool.execute(undefined, { signal: null })
  expect(report).toHaveBeenCalledWith('webmcp_read_doka')
  expect(execute).toHaveBeenCalledWith({}, { signal: null })
})
