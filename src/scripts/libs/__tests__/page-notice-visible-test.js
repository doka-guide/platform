/**
 * @jest-environment jsdom
 */

const { isAnyNoticeVisible } = require('../page-notice.js')

afterEach(() => {
  document.body.innerHTML = ''
})

test('окон на странице нет — можно показать своё', () => {
  document.body.innerHTML = '<div class="cookie-notification" hidden></div><dialog class="subscribe-popup"></dialog>'

  expect(isAnyNoticeVisible()).toBe(false)
})

test('виден баннер о куках', () => {
  document.body.innerHTML = '<div class="cookie-notification"></div>'

  expect(isAnyNoticeVisible()).toBe(true)
})

test('открыто приглашение подписаться', () => {
  document.body.innerHTML = '<dialog class="subscribe-popup" open></dialog>'

  expect(isAnyNoticeVisible()).toBe(true)
})

test('закрытые подсказки на popover не мешают', () => {
  document.body.innerHTML = '<div class="hotkey-notice" popover></div>'
  // jsdom не знает :popover-open, поэтому состояние подставляем сами
  document.querySelector('.hotkey-notice').matches = () => false

  expect(isAnyNoticeVisible()).toBe(false)
})

test('открыта подсказка на popover', () => {
  document.body.innerHTML = '<div class="hotkey-notice" popover></div>'
  document.querySelector('.hotkey-notice').matches = (selector) => selector === ':popover-open'

  expect(isAnyNoticeVisible()).toBe(true)
})
