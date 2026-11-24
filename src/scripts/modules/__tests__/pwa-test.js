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
  document.body.innerHTML = `
    <a class="link" href="/css/grid/">Grid</a>
    <div class="offline-notice"><button class="offline-notice__close"></button></div>
    <p class="offline-status" role="status"></p>
  `
  sessionStorage.clear()
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
  test('отмечает и плитки разделов в меню и на главной', async () => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<a class="nav-list__link" href="/js/">JS</a><a class="article-indexes-list__link" href="/a11y/">A11y</a>',
    )
    const handlers = await loadModule()
    setOnLine(false)
    mockIsOfflineResult = Promise.resolve(true)

    handlers.offline()
    await flush()

    expect(document.querySelector('.nav-list__link').classList.contains('link--non-cached')).toBe(true)
    expect(document.querySelector('.article-indexes-list__link').classList.contains('link--non-cached')).toBe(true)
  })

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
    // Иначе скринридер при работающей сети читал бы «без сети не откроется»
    expect(document.querySelector('.link').hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('подсказка', () => {
  async function goOffline(handlers) {
    setOnLine(false)
    mockIsOfflineResult = Promise.resolve(true)
    handlers.offline()
    await flush()
  }

  function goOnline(handlers) {
    setOnLine(true)
    handlers.online()
  }

  test('объявляет скринридеру, что сети нет, через живую область вне подсказки', async () => {
    // Живая область внутри popover с display: none скринридер может не заметить
    const handlers = await loadModule()
    const status = document.querySelector('.offline-status')

    await goOffline(handlers)
    expect(status.textContent).toMatch(/^Нет сети/)

    goOnline(handlers)
    expect(status.textContent).toBe('')
  })

  test('связывает недоступную ссылку с пояснением для скринридера', async () => {
    // Бледность скринридер не передаёт
    const handlers = await loadModule()
    const link = document.querySelector('.link')

    await goOffline(handlers)
    expect(link.getAttribute('aria-describedby')).toBe('offline-link-hint')

    goOnline(handlers)
    expect(link.hasAttribute('aria-describedby')).toBe(false)
  })

  test('закрытая крестиком подсказка не всплывает снова, когда сеть мигает', async () => {
    const handlers = await loadModule()
    const notice = document.querySelector('.offline-notice')

    await goOffline(handlers)
    document.querySelector('.offline-notice__close').click()
    goOnline(handlers)
    await goOffline(handlers)

    expect(notice.showPopover).toHaveBeenCalledTimes(1)
    // Пометки на ссылках остаются: подсказку закрыли, а сети по-прежнему нет
    expect(document.body.classList.contains('offline')).toBe(true)
  })

  test('закрытая подсказка не всплывает и на следующей странице', async () => {
    sessionStorage.setItem('offline-notice-dismissed', '1')
    const handlers = await loadModule()

    await goOffline(handlers)

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
