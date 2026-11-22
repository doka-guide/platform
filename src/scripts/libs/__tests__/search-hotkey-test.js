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
  const beforeEnd = new Date(HOTKEY_NOTICE_END.getTime() - 1)

  test('показывает, пока подсказку не закрыли', () => {
    expect(shouldShowHotkeyNotice(null, beforeEnd)).toBe(true)
  })

  test('не показывает закрытую подсказку', () => {
    expect(shouldShowHotkeyNotice('CLOSED', beforeEnd)).toBe(false)
  })

  test('не показывает после окончания срока', () => {
    expect(shouldShowHotkeyNotice(null, HOTKEY_NOTICE_END)).toBe(false)
  })
})
