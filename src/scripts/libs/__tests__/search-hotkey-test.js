/**
 * @jest-environment jsdom
 */

const { isSearchHotkey, shouldShowHotkeyNotice, HOTKEY_NOTICE_END } = require('../search-hotkey.js')

document.body.innerHTML = `
  <input class="input">
  <textarea class="textarea"></textarea>
  <div class="editable" contenteditable></div>
`

const keyEvent = (init, selector) => ({
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...init,
  target: selector ? document.querySelector(selector) : document.body,
})

describe('isSearchHotkey', () => {
  test.each([
    ['⌘ K', { metaKey: true, code: 'KeyK' }],
    ['Ctrl K', { ctrlKey: true, code: 'KeyK' }],
  ])('%s открывает поиск', (_, init) => {
    expect(isSearchHotkey(keyEvent(init))).toBe(true)
  })

  test.each(['.input', '.textarea', '.editable'])('⌘ K открывает поиск и из %s', (selector) => {
    expect(isSearchHotkey(keyEvent({ metaKey: true, code: 'KeyK' }, selector))).toBe(true)
  })

  test.each([
    ['«/»', { code: 'Slash' }],
    ['«/» на цифровом блоке', { code: 'NumpadDivide' }],
    ['K без модификатора', { code: 'KeyK' }],
    ['Ctrl Shift K', { ctrlKey: true, shiftKey: true, code: 'KeyK' }],
    ['Ctrl Alt K', { ctrlKey: true, altKey: true, code: 'KeyK' }],
    ['⌘ L', { metaKey: true, code: 'KeyL' }],
  ])('%s не открывает поиск', (_, init) => {
    expect(isSearchHotkey(keyEvent(init))).toBe(false)
  })

  test('«/» в поле ввода не открывает поиск', () => {
    expect(isSearchHotkey(keyEvent({ code: 'Slash' }, '.textarea'))).toBe(false)
  })
})

describe('shouldShowHotkeyNotice', () => {
  const now = new Date(HOTKEY_NOTICE_END.getTime() - 1)
  const returning = { storedValue: null, isCookieAccepted: true, now }

  test('показывает тому, кто бывал на Доке, пока подсказку не закрыли', () => {
    expect(shouldShowHotkeyNotice(returning)).toBe(true)
  })

  test('не показывает новичку, который ещё не принял куки', () => {
    expect(shouldShowHotkeyNotice({ ...returning, isCookieAccepted: false })).toBe(false)
  })

  test('не показывает закрытую подсказку', () => {
    expect(shouldShowHotkeyNotice({ ...returning, storedValue: 'CLOSED' })).toBe(false)
  })

  test('не показывает после окончания срока', () => {
    expect(shouldShowHotkeyNotice({ ...returning, now: HOTKEY_NOTICE_END })).toBe(false)
  })
})
