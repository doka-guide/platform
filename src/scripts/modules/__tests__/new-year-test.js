/**
 * @jest-environment jsdom
 */

const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(__dirname, '../new-year.js'), 'utf8')

function runOn(date) {
  document.documentElement.className = ''
  jest.useFakeTimers().setSystemTime(date)
  const log = jest.spyOn(console, 'log').mockImplementation(() => {})
  new Function(source)()
  const result = {
    hasClass: document.documentElement.classList.contains('new-year'),
    logged: log.mock.calls.length > 0,
  }
  log.mockRestore()
  jest.useRealTimers()
  return result
}

describe('new-year', () => {
  test.each([
    ['20 декабря', new Date(2026, 11, 20)],
    ['31 декабря', new Date(2026, 11, 31, 23, 59)],
    ['1 января', new Date(2027, 0, 1)],
    ['11 января', new Date(2027, 0, 11, 23, 59)],
  ])('включается %s', (_, date) => {
    expect(runOn(date)).toEqual({ hasClass: true, logged: true })
  })

  test.each([
    ['19 декабря', new Date(2026, 11, 19, 23, 59)],
    ['12 января', new Date(2027, 0, 12)],
    ['1 июля', new Date(2027, 6, 1)],
  ])('молчит %s', (_, date) => {
    expect(runOn(date)).toEqual({ hasClass: false, logged: false })
  })
})
