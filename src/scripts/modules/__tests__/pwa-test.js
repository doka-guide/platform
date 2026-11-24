/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://doka.guide/html/header/"}
 */

// Модуль вешает обработчики на window при загрузке. Тест перехватывает их,
// чтобы каждый тест работал со своей копией модуля и не копил чужие обработчики.

let mockIsOfflineResult
jest.mock('../../libs/network-status.js', () => ({ isOffline: () => mockIsOfflineResult }))

const flush = () => new Promise((resolve) => setTimeout(resolve))

// Загружает модуль и страницу с сетью: обработчики online и offline появляются после load
async function loadModule() {
  const handlers = {}
  jest.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
    handlers[type] = handler
  })
  jest.isolateModules(() => {
    require('../pwa.js')
  })
  mockIsOfflineResult = Promise.resolve(false)
  handlers.load()
  await flush()
  return handlers
}

function setOnLine(value) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

function mockWorker({ controller }) {
  const postMessage = jest.fn()
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      controller,
      register: async () => {},
      ready: Promise.resolve({ active: { postMessage } }),
    },
  })
  return postMessage
}

beforeEach(() => {
  document.body.className = ''
  document.body.innerHTML = '<a class="link" href="/css/grid/">Grid</a><div class="offline-notice"></div>'
  // jsdom не знает popover: подсказка получает методы вручную
  const notice = document.querySelector('.offline-notice')
  notice.showPopover = jest.fn()
  notice.hidePopover = jest.fn()
  notice.matches = () => false
  global.caches = { match: async () => undefined }
  setOnLine(true)
  mockWorker({ controller: null })
})

afterEach(() => {
  jest.restoreAllMocks()
  delete global.caches
})

describe('сеть', () => {
  test('без сети отмечает недоступные ссылки и показывает подсказку', async () => {
    const handlers = await loadModule()
    setOnLine(false)
    mockIsOfflineResult = Promise.resolve(true)

    handlers.offline()
    await flush()

    expect(document.body.classList.contains('offline')).toBe(true)
    expect(document.querySelector('.link').classList.contains('link--non-cached')).toBe(true)
    expect(document.querySelector('.offline-notice').showPopover).toHaveBeenCalled()
  })

  test('не показывает подсказку поверх баннера о куках', async () => {
    document.body.insertAdjacentHTML('beforeend', '<div class="cookie-notification"></div>')
    const handlers = await loadModule()
    setOnLine(false)
    mockIsOfflineResult = Promise.resolve(true)

    handlers.offline()
    await flush()

    expect(document.body.classList.contains('offline')).toBe(true)
    expect(document.querySelector('.offline-notice').showPopover).not.toHaveBeenCalled()
  })

  test('сеть вернулась, пока проверялся кеш, — страница остаётся обычной', async () => {
    // Так бывает в поезде и при смене Wi-Fi: offline и online приходят почти подряд
    let finishCacheCheck
    global.caches = { match: () => new Promise((resolve) => (finishCacheCheck = resolve)) }
    const handlers = await loadModule()
    setOnLine(false)
    mockIsOfflineResult = Promise.resolve(true)

    handlers.offline()
    await flush()
    setOnLine(true)
    handlers.online()
    finishCacheCheck()
    await flush()

    expect(document.body.classList.contains('offline')).toBe(false)
    expect(document.querySelector('.offline-notice').showPopover).not.toHaveBeenCalled()
  })
})

describe('воркер', () => {
  test('просит сохранить страницу, загруженную до воркера', async () => {
    const postMessage = mockWorker({ controller: null })
    await loadModule()

    expect(postMessage).toHaveBeenCalledWith({ type: 'cache-page', url: 'https://doka.guide/html/header/' })
  })

  test('не перезапрашивает страницу, которую воркер уже сохранил', async () => {
    // Иначе каждый просмотр качал бы HTML дважды
    const postMessage = mockWorker({ controller: {} })
    await loadModule()

    expect(postMessage).not.toHaveBeenCalled()
  })
})
