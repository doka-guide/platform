const { markNoticeShown, isNoticeShown } = require('../page-notice.js')

test('окно на странице не показывали — следующее можно показать', () => {
  expect(isNoticeShown()).toBe(false)
})

test('окно на странице показали — следующее ждёт другой страницы', () => {
  markNoticeShown()
  expect(isNoticeShown()).toBe(true)
})
