/**
 * @jest-environment jsdom
 */

import { isApplePlatform, localizeHotkeys } from '../linked-article-navigation.js'

const renderHotkeys = () => {
  document.body.innerHTML = `
    <div class="linked-article__hotkeys">
      <kbd data-modifier="ctrl">ctrl</kbd> + <kbd data-modifier="alt">alt</kbd> + <kbd>←</kbd>
    </div>
  `
}

const keys = () => [...document.querySelectorAll('kbd')].map((kbd) => kbd.textContent)

afterEach(() => {
  document.body.innerHTML = ''
})

test('распознаёт macOS и iOS по платформе', () => {
  expect(isApplePlatform('macOS')).toBe(true)
  expect(isApplePlatform('MacIntel')).toBe(true)
  expect(isApplePlatform('iPad')).toBe(true)
  expect(isApplePlatform('iPhone')).toBe(true)
  expect(isApplePlatform('Windows')).toBe(false)
  expect(isApplePlatform('Win32')).toBe(false)
  expect(isApplePlatform('Linux x86_64')).toBe(false)
  expect(isApplePlatform('')).toBe(false)
})

test('на Mac подписывает модификаторы как на клавиатуре Apple', () => {
  renderHotkeys()
  localizeHotkeys(document, 'macOS')

  expect(keys()).toEqual(['control', 'option', '←'])
})

test('на остальных системах оставляет ctrl и alt', () => {
  renderHotkeys()
  localizeHotkeys(document, 'Windows')

  expect(keys()).toEqual(['ctrl', 'alt', '←'])
})
