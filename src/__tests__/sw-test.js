// Тесты сервис-воркера.
//
// Файл воркера ничего не экспортирует, поэтому загружается с заглушками вместо
// self, caches и fetch, а из заглушки self достаются зарегистрированные
// обработчики. Так проверяется настоящий отгружаемый код, а не его копия.

const ORIGIN = 'https://doka.guide'

const OFFLINE_HTML =
  '<link rel="stylesheet" href="/styles/index-abc.css">' +
  '<link rel="preload" href="/fonts/graphik/graphik-regular.woff2">' +
  '<script src="/scripts/index-def.js"></script>' +
  '<img src="/images/logo/logo-offline.svg">' +
  '<a href="/css/">CSS</a>'

const keyOf = (request) => new URL(typeof request === 'string' ? request : request.url, ORIGIN).href

// Хранилище кешей в памяти: имена кешей и порядок добавления ключей те же,
// что в браузере, этого достаточно для проверки стратегий и обрезки.
function createCaches(initial = {}) {
  const store = new Map()
  const open = async (name) => {
    if (!store.has(name)) {
      store.set(name, new Map())
    }
    const entries = store.get(name)
    return {
      put: async (request, response) => {
        entries.delete(keyOf(request))
        entries.set(keyOf(request), response)
      },
      match: async (request, { ignoreSearch } = {}) => {
        const withoutSearch = (url) => url.split('?')[0]
        const key = ignoreSearch
          ? [...entries.keys()].find((url) => withoutSearch(url) === withoutSearch(keyOf(request)))
          : keyOf(request)
        return entries.get(key)?.clone()
      },
      keys: async () => [...entries.keys()].map((url) => new Request(url)),
      delete: async (request) => entries.delete(keyOf(request)),
      addAll: async (urls) => {
        for (const url of urls) {
          entries.set(keyOf(url), await global.fetch(url))
        }
      },
    }
  }

  for (const [name, urls] of Object.entries(initial)) {
    store.set(name, new Map(urls.map((url) => [keyOf(url), new Response(`из кеша: ${url}`)])))
  }

  return {
    store,
    open,
    keys: async () => [...store.keys()],
    delete: async (name) => store.delete(name),
    match: async (request, { cacheName, ...options } = {}) => (await open(cacheName)).match(request, options),
    urls: (name) => [...(store.get(name)?.keys() ?? [])].map((url) => url.replace(ORIGIN, '')),
  }
}

// Сеть: по адресу отдаёт заданный ответ, без сети падает, как настоящий fetch.
function createNetwork(routes = {}) {
  const network = { online: true, requested: [], options: {} }
  network.fetch = async (request, options) => {
    const url = keyOf(request).replace(ORIGIN, '')
    network.requested.push(url)
    network.options[url] = options
    if (!network.online) {
      throw new TypeError('Failed to fetch')
    }
    const route = routes[url]
    if (typeof route === 'function') {
      return route()
    }
    return new Response(route ?? `из сети: ${url}`, {
      status: route === undefined && url.includes('missing') ? 404 : 200,
    })
  }
  return network
}

function loadWorker({ caches = createCaches(), network = createNetwork({ '/offline/': OFFLINE_HTML }) } = {}) {
  const listeners = {}
  const calls = { skipWaiting: 0, claim: 0, preload: 0 }

  global.self = {
    location: new URL(ORIGIN),
    registration: {
      navigationPreload: {
        enable: async () => {
          calls.preload += 1
        },
      },
    },
    clients: {
      claim: async () => {
        calls.claim += 1
      },
    },
    skipWaiting: () => {
      calls.skipWaiting += 1
    },
    addEventListener: (type, handler) => {
      listeners[type] = handler
    },
  }
  global.caches = caches
  global.fetch = network.fetch

  jest.isolateModules(() => {
    require('../sw.js')
  })

  return { listeners, caches, network, calls }
}

// Событие в том виде, в каком его видит воркер. Работу, отданную через
// waitUntil, тест дожидается так же, как браузер.
function createEvent(props = {}) {
  const pending = []
  const event = {
    ...props,
    waitUntil: (promise) => pending.push(promise),
    respondWith: (promise) => {
      event.response = promise
    },
    settled: async () => {
      const response = await event.response
      await Promise.all(pending)
      return response
    },
  }
  return event
}

const navigation = (path) => {
  const event = createEvent({ request: new Request(`${ORIGIN}${path}`) })
  // mode у Request в Node задать нельзя, а воркер различает переходы именно по нему
  Object.defineProperty(event.request, 'mode', { value: 'navigate' })
  return event
}
const asset = (path, destination = 'style') => {
  const event = createEvent({ request: new Request(`${ORIGIN}${path}`) })
  Object.defineProperty(event.request, 'destination', { value: destination })
  return event
}

afterEach(() => {
  delete global.self
  delete global.caches
  delete global.fetch
})

describe('установка', () => {
  it('кеширует офлайн-страницу и её стили, скрипты, шрифты и картинки', async () => {
    const { listeners, caches, calls } = loadWorker()
    const event = createEvent()

    listeners.install(event)
    await event.settled()

    expect(caches.urls('doka-pages-v1')).toEqual(['/offline/'])
    expect(caches.urls('doka-assets-v1')).toEqual([
      '/styles/index-abc.css',
      '/fonts/graphik/graphik-regular.woff2',
      '/scripts/index-def.js',
      '/images/logo/logo-offline.svg',
    ])
    expect(calls.skipWaiting).toBe(1)
  })

  it('скачивает офлайн-страницу мимо кеша браузера', async () => {
    // Старая копия из HTTP-кеша ссылалась бы на стили, которые деплой уже удалил
    const { listeners, network } = loadWorker()
    const event = createEvent()

    listeners.install(event)
    await event.settled()

    expect(network.options['/offline/']).toEqual({ cache: 'no-cache' })
  })

  it('не активируется, если офлайн-страница не скачалась', async () => {
    // Без офлайн-страницы воркер без сети отдал бы пустую ошибку. Пусть лучше
    // браузер повторит установку в следующий раз.
    const network = createNetwork({ '/offline/': () => new Response('', { status: 500 }) })
    const { listeners, calls } = loadWorker({ network })
    const event = createEvent()

    listeners.install(event)

    await expect(event.settled()).rejects.toThrow('офлайн-страницу')
    expect(calls.skipWaiting).toBe(0)
  })
})

describe('активация', () => {
  it('удаляет кеши прежних версий и сломанного воркера, но не чужие', async () => {
    const caches = createCaches({
      'doka-pages-v1': [],
      'doka-assets-v1': [],
      'doka-pages-v0': [],
      'doka-dynamic-even': [],
      'workbox-precache': [],
    })
    const { listeners, calls } = loadWorker({ caches })
    const event = createEvent()

    listeners.activate(event)
    await event.settled()

    expect([...caches.store.keys()].sort()).toEqual(['doka-assets-v1', 'doka-pages-v1', 'workbox-precache'])
    expect(calls.claim).toBe(1)
    expect(calls.preload).toBe(1)
  })
})

describe('страницы', () => {
  it('берёт страницу из сети и кладёт копию в кеш', async () => {
    const caches = createCaches({ 'doka-pages-v1': ['/html/header/'] })
    const { listeners } = loadWorker({ caches })
    const event = navigation('/html/header/')

    listeners.fetch(event)
    const response = await event.settled()

    // Из сети, а не из кеша: иначе читатель видел бы устаревшую статью
    expect(await response.text()).toBe('из сети: /html/header/')
    expect(await (await caches.match('/html/header/', { cacheName: 'doka-pages-v1' })).text()).toBe(
      'из сети: /html/header/',
    )
  })

  it('берёт ответ предзагрузки, если браузер его прислал', async () => {
    const { listeners, network } = loadWorker()
    const event = navigation('/css/')
    event.preloadResponse = Promise.resolve(new Response('предзагрузка'))

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('предзагрузка')
    expect(network.requested).toEqual([])
  })

  it('без сети отдаёт сохранённую копию', async () => {
    const caches = createCaches({ 'doka-pages-v1': ['/html/header/'] })
    const { listeners, network } = loadWorker({ caches })
    network.online = false
    const event = navigation('/html/header/')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из кеша: /html/header/')
  })

  it('без сети и без копии отдаёт офлайн-страницу', async () => {
    const caches = createCaches({ 'doka-pages-v1': ['/offline/'] })
    const { listeners, network } = loadWorker({ caches })
    network.online = false
    const event = navigation('/js/promise/')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из кеша: /offline/')
  })

  it('без сети находит копию по адресу без строки запроса', async () => {
    // Так открываются ссылки из соцсетей с utm-метками
    const caches = createCaches({ 'doka-pages-v1': ['/offline/', '/css/grid/'] })
    const { listeners, network } = loadWorker({ caches })
    network.online = false
    const event = navigation('/css/grid/?utm_source=tg')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из кеша: /css/grid/')
  })

  describe('медленная сеть', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    // Ответ сети приходит, только когда тест его отпустит
    function slowNetwork(path) {
      let finish
      const network = createNetwork({
        '/offline/': OFFLINE_HTML,
        [path]: () => new Promise((resolve) => (finish = () => resolve(new Response(`из сети: ${path}`)))),
      })
      return { network, finish: () => finish() }
    }

    it('через 4 секунды отдаёт сохранённую копию, а свежую кладёт в кеш, когда дойдёт', async () => {
      // В метро сеть формально есть, но страница грузится минуту
      const caches = createCaches({ 'doka-pages-v1': ['/html/header/'] })
      const { network, finish } = slowNetwork('/html/header/')
      const { listeners } = loadWorker({ caches, network })
      const event = navigation('/html/header/')

      listeners.fetch(event)
      await jest.advanceTimersByTimeAsync(4000)

      expect(await (await event.response).text()).toBe('из кеша: /html/header/')
      finish()
      await event.settled()
      expect(await (await caches.match('/html/header/', { cacheName: 'doka-pages-v1' })).text()).toBe(
        'из сети: /html/header/',
      )
    })

    it('без сохранённой копии ждёт сеть дольше 4 секунд', async () => {
      const { network, finish } = slowNetwork('/js/promise/')
      const { listeners } = loadWorker({ network })
      const event = navigation('/js/promise/')

      listeners.fetch(event)
      await jest.advanceTimersByTimeAsync(10000)
      finish()

      expect(await (await event.settled()).text()).toBe('из сети: /js/promise/')
    })
  })

  it('не кладёт в кеш страницу с ошибкой', async () => {
    // Иначе без сети вместо офлайн-страницы показалась бы сохранённая 404
    const { listeners, caches } = loadWorker()
    const event = navigation('/missing/')

    listeners.fetch(event)
    const response = await event.settled()

    expect(response.status).toBe(404)
    expect(caches.urls('doka-pages-v1')).toEqual([])
  })

  it('держит в кеше не больше 200 страниц, удаляя самые старые', async () => {
    const paths = Array.from({ length: 200 }, (_, i) => `/page-${i}/`)
    const caches = createCaches({ 'doka-pages-v1': paths })
    const { listeners } = loadWorker({ caches })
    const event = navigation('/new/')

    listeners.fetch(event)
    await event.settled()

    const urls = caches.urls('doka-pages-v1')
    expect(urls).toHaveLength(200)
    expect(urls[0]).toBe('/page-1/')
    expect(urls.at(-1)).toBe('/new/')
  })

  it('не вытесняет офлайн-страницу, даже если она самая старая', async () => {
    const paths = ['/offline/', ...Array.from({ length: 200 }, (_, i) => `/page-${i}/`)]
    const caches = createCaches({ 'doka-pages-v1': paths })
    const { listeners } = loadWorker({ caches })
    const event = navigation('/new/')

    listeners.fetch(event)
    await event.settled()

    const urls = caches.urls('doka-pages-v1')
    expect(urls[0]).toBe('/offline/')
    expect(urls).not.toContain('/page-0/')
    expect(urls.at(-1)).toBe('/new/')
  })
})

describe('стили, скрипты, шрифты и картинки', () => {
  it('отдаёт файл из кеша и обновляет его в фоне', async () => {
    const caches = createCaches({ 'doka-assets-v1': ['/styles/index.css'] })
    const { listeners } = loadWorker({ caches })
    const event = asset('/styles/index.css')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из кеша: /styles/index.css')
    expect(await (await caches.match('/styles/index.css', { cacheName: 'doka-assets-v1' })).text()).toBe(
      'из сети: /styles/index.css',
    )
  })

  it('берёт из сети то, чего нет в кеше, и сохраняет', async () => {
    const { listeners, caches } = loadWorker()
    const event = asset('/html/header/images/cover.png', 'image')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из сети: /html/header/images/cover.png')
    expect(caches.urls('doka-assets-v1')).toEqual(['/html/header/images/cover.png'])
  })

  it('отдаёт файл из сети, не дожидаясь записи в кеш', async () => {
    const caches = createCaches()
    const open = caches.open
    caches.open = async (name) => ({ ...(await open(name)), put: () => new Promise(() => {}) })
    const { listeners } = loadWorker({ caches })
    const event = asset('/styles/index.css')

    listeners.fetch(event)

    // Ожидание записи в кеш повесило бы тест: put здесь не завершается никогда
    expect(await (await event.response).text()).toBe('из сети: /styles/index.css')
  })

  it('без сети отдаёт файл из кеша без ошибок', async () => {
    const caches = createCaches({ 'doka-assets-v1': ['/scripts/index.js'] })
    const { listeners, network } = loadWorker({ caches })
    network.online = false
    const event = asset('/scripts/index.js', 'script')

    listeners.fetch(event)
    const response = await event.settled()

    expect(await response.text()).toBe('из кеша: /scripts/index.js')
  })
})

describe('мимо воркера', () => {
  it.each([
    ['чужой домен', () => createEvent({ request: new Request('https://api.doka.guide/search?q=grid') })],
    ['запрос с телом', () => createEvent({ request: new Request(`${ORIGIN}/form`, { method: 'POST', body: 'x' }) })],
    ['запрос данных из скрипта', () => createEvent({ request: new Request(`${ORIGIN}/css/index.json`) })],
  ])('%s', (_, createRequestEvent) => {
    const { listeners } = loadWorker()
    const event = createRequestEvent()

    listeners.fetch(event)

    expect(event.response).toBeUndefined()
  })
})

describe('первая страница', () => {
  it('кеширует страницу, которую прислал скрипт', async () => {
    const { listeners, caches } = loadWorker()
    const event = createEvent({ data: { type: 'cache-page', url: `${ORIGIN}/html/header/` } })

    listeners.message(event)
    await event.settled()

    expect(caches.urls('doka-pages-v1')).toEqual(['/html/header/'])
  })

  it('не кеширует ответ после редиректа', async () => {
    // Такой ответ браузер не покажет на месте перехода по ссылке
    const network = createNetwork({
      '/html/header': () => {
        const response = new Response('после редиректа')
        Object.defineProperty(response, 'redirected', { value: true })
        return response
      },
    })
    const { listeners, caches } = loadWorker({ network })
    const event = createEvent({ data: { type: 'cache-page', url: `${ORIGIN}/html/header` } })

    listeners.message(event)
    await event.settled()

    expect(caches.urls('doka-pages-v1')).toEqual([])
  })

  it('не берёт адреса чужих доменов', async () => {
    const { listeners, network } = loadWorker()
    const event = createEvent({ data: { type: 'cache-page', url: 'https://evil.example/' } })

    listeners.message(event)
    await event.settled()

    expect(network.requested).toEqual([])
  })
})
