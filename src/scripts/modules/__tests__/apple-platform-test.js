/**
 * @jest-environment jsdom
 */

const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(__dirname, '../apple-platform.js'), 'utf8')

function runWithPlatform({ platform, userAgentData }) {
  document.documentElement.className = ''
  Object.defineProperty(navigator, 'platform', { value: platform, configurable: true })
  Object.defineProperty(navigator, 'userAgentData', { value: userAgentData, configurable: true })
  new Function(source)()
  return document.documentElement.classList.contains('apple-platform')
}

describe('apple-platform', () => {
  test.each(['MacIntel', 'iPhone', 'iPad'])('ставит класс на %s', (platform) => {
    expect(runWithPlatform({ platform })).toBe(true)
  })

  test('берёт платформу из userAgentData, если она есть', () => {
    expect(runWithPlatform({ platform: 'Win32', userAgentData: { platform: 'macOS' } })).toBe(true)
  })

  test('при пустой платформе в userAgentData смотрит navigator.platform', () => {
    expect(runWithPlatform({ platform: 'MacIntel', userAgentData: { platform: '' } })).toBe(true)
  })

  test.each(['Win32', 'Linux x86_64'])('не ставит класс на %s', (platform) => {
    expect(runWithPlatform({ platform, userAgentData: { platform: 'Windows' } })).toBe(false)
  })
})
