const { isKnownError } = require('../lint-html.js')

// Строки в том виде, в каком их печатает vnu с `--format gnu`
const originTrial =
  '"file:/dist/index.html":1.199-1.457: error: Bad value “origin-trial” for attribute “http-equiv” on element “meta”.'

test('токен пробной версии Chrome не считается ошибкой разметки', () => {
  expect(isKnownError(originTrial)).toBe(true)
})

test('другие плохие значения http-equiv остаются ошибками', () => {
  expect(isKnownError(originTrial.replace('origin-trial', 'refresh-me'))).toBe(false)
})

test('прочие ошибки остаются ошибками', () => {
  expect(isKnownError('"file:/dist/index.html":3.1-3.5: error: Stray end tag “div”.')).toBe(false)
})
