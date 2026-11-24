// Сервис-воркер: даёт читать без сети то, что читатель уже открывал.
//
// Страницы берутся из сети, а копия кладётся в кеш. Из кеша страница
// отдаётся только без сети или если сеть не ответила за 4 секунды: иначе
// читатель видел бы старую версию статьи.
// Стили, скрипты, шрифты и картинки отдаются из кеша сразу и обновляются в
// фоне. У стилей и скриптов в продакшне хеш в имени, так что устаревший файл
// из кеша не попадёт на страницу с новой разметкой.
//
// Связанные статьи заранее не скачиваются. Прежний воркер делал так и тянул
// десятки страниц, демок и картинок на каждый заход.
//
// Если воркер придётся срочно выключить, не удаляйте этот файл: браузеры уже
// установленных воркеров перезапрашивают /sw.js и без него останутся со старым
// кодом навсегда. Вместо удаления замените его заглушкой, которая чистит кеши
// и снимает регистрацию, — она есть в истории файла.

// Версия в имени кеша. Поднимите её, если поменялось то, что лежит в кеше:
// при активации воркер удалит все кеши Доки с другими именами.
const VERSION = 'v1'
const CACHE_PREFIX = 'doka-'
// Префикс doka-pages- читает и offline-page.js, чтобы вывести список сохранённых страниц
const PAGES_CACHE = `${CACHE_PREFIX}pages-${VERSION}`
const ASSETS_CACHE = `${CACHE_PREFIX}assets-${VERSION}`
// Картинки отдельно от стилей и скриптов: после деплоя старые стили никто не запрашивает,
// и картинки новых статей вытеснили бы их. Сохранённая раньше статья открылась бы без стилей
const IMAGES_CACHE = `${CACHE_PREFIX}images-${VERSION}`
// Демки из iframe отдельно от страниц: иначе они занимали бы место статей
const DEMOS_CACHE = `${CACHE_PREFIX}demos-${VERSION}`

const OFFLINE_PAGE = '/offline/'

// Без предела кеш растёт с каждой открытой статьёй и с каждым деплоем: старые
// стили и скрипты с прежними хешами никто не удаляет. Сверх предела удаляются
// самые старые записи, порядок ключей в кеше — порядок добавления.
const MAX_PAGES = 200
const MAX_ASSETS = 400
const MAX_IMAGES = 400
const MAX_DEMOS = 200

// Сколько ждать страницу из сети, прежде чем отдать сохранённую копию. На слабой
// сети (метро, поезд) запрос висит минуту, а читатель видит белый экран.
const NETWORK_TIMEOUT = 4000

const ASSET_DESTINATIONS = ['style', 'script', 'font']

// Без сети вместо несохранённой демки. Офлайн-страница с шапкой и логотипом внутри
// статьи выглядела бы поломкой
const DEMO_FALLBACK =
  // Без color-scheme: демки стоят на белом фоне в обеих темах, светлый текст на нём пропал бы
  '<!DOCTYPE html><meta charset="utf-8">' +
  '<style>body{margin:0;padding:24px;text-align:center;font:16px/1.5 system-ui,sans-serif;opacity:.7}</style>' +
  '<p>Без сети демо не откроется</p>'

// Страница хранится под адресом без строки запроса: по ссылке с utm-метками открывается
// та же статья, и pwa.js находит копию по обычной ссылке
function pageKey(request) {
  const url = new URL(request.url)
  return url.origin + url.pathname
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  // Офлайн-страница кладётся один раз при установке и оказалась бы первой на удаление
  const keys = (await cache.keys()).filter((key) => new URL(key.url).pathname !== OFFLINE_PAGE)
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)))
}

async function putInCache(cacheName, maxEntries, request, response) {
  // Кешируем только целые ответы: 404 и ошибки сервера не должны подменять
  // страницу без сети, а частичные ответы (206) Cache API не принимает.
  // Ответ после редиректа браузер откажется показать на месте перехода по
  // ссылке, поэтому его тоже не кладём.
  if (!response || response.status !== 200 || response.redirected) {
    return
  }
  const cache = await caches.open(cacheName)
  await cache.put(request, response)
  await trimCache(cacheName, maxEntries)
}

// Стили и скрипты офлайн-страницы. Имена с хешем меняются на каждом деплое,
// поэтому список не вписан сюда, а берётся из разметки самой страницы.
function getShellUrls(html) {
  const urls = new Set()
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?:styles|scripts|fonts|images)\/[^"]+)"/g)) {
    urls.add(url)
  }
  return [...urls]
}

async function precacheOfflinePage() {
  // HTML на сервере отдаётся без Cache-Control, и браузер мог бы взять старую копию
  // со ссылками на стили, которые деплой уже удалил. Тогда установка упала бы на addAll.
  const response = await fetch(OFFLINE_PAGE, { cache: 'no-cache' })
  if (!response.ok) {
    throw new Error(`Не удалось скачать офлайн-страницу: ${response.status}`)
  }
  const html = await response.clone().text()

  const pages = await caches.open(PAGES_CACHE)
  await pages.put(OFFLINE_PAGE, response)

  const urls = getShellUrls(html)
  const isImage = (url) => url.startsWith('/images/')
  const assets = await caches.open(ASSETS_CACHE)
  const images = await caches.open(IMAGES_CACHE)
  await assets.addAll(urls.filter((url) => !isImage(url)))
  await images.addAll(urls.filter(isImage))
}

// Страницы и демки: сначала сеть, сохранённая копия — без сети или если сеть не ответила вовремя
async function handleNavigation(event, { cacheName, maxEntries, getFallback }) {
  const { request } = event
  const key = pageKey(request)
  const findSaved = async () =>
    (await caches.match(key, { cacheName })) ||
    // Адрес набрали без слеша на конце, а страница сохранена со слешем
    (!key.endsWith('/') && (await caches.match(`${key}/`, { cacheName })))

  const fromNetwork = (async () => {
    const response = (await event.preloadResponse) || (await fetch(request))
    event.waitUntil(putInCache(cacheName, maxEntries, key, response.clone()))
    return response
  })()
  // Если читателю уже отдана копия, свежая страница всё равно должна дойти до кеша
  event.waitUntil(fromNetwork.catch(() => {}))

  try {
    const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT))
    const response = await Promise.race([fromNetwork, timeout])
    if (response) {
      return response
    }
    return (await findSaved()) || (await fromNetwork)
  } catch {
    // fetch падает только без сети. Ответ сервера с ошибкой сюда не попадает
    // и отдаётся читателю как есть.
    return (await findSaved()) || (await getFallback()) || Response.error()
  }
}

async function handleAsset(event, cacheName, maxEntries) {
  const { request } = event
  const cached = await caches.match(request, { cacheName })
  // Ответ отдаётся сразу, не дожидаясь записи в кеш: иначе картинки не грузились бы
  // постепенно, а стили на первом заходе приходили бы позже
  const fromNetwork = fetch(request).then((response) => {
    event.waitUntil(putInCache(cacheName, maxEntries, request, response.clone()))
    return response
  })

  if (cached) {
    // Обновление в фоне: ошибка сети здесь не важна, файл уже отдан из кеша.
    event.waitUntil(fromNetwork.catch(() => {}))
    return cached
  }
  return fromNetwork
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheOfflinePage().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Убираем кеши прежних версий, в том числе сломанного воркера до 2026 года.
      // Чужие кеши на том же домене не трогаем.
      const current = [PAGES_CACHE, ASSETS_CACHE, IMAGES_CACHE, DEMOS_CACHE]
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !current.includes(name))
          .map((name) => caches.delete(name)),
      )

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Чужие домены (поиск, формы, метрика) и запросы с телом идут мимо воркера.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate' && request.destination === 'iframe') {
    event.respondWith(
      handleNavigation(event, {
        cacheName: DEMOS_CACHE,
        maxEntries: MAX_DEMOS,
        getFallback: () => new Response(DEMO_FALLBACK, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      }),
    )
  } else if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigation(event, {
        cacheName: PAGES_CACHE,
        maxEntries: MAX_PAGES,
        getFallback: () => caches.match(OFFLINE_PAGE, { cacheName: PAGES_CACHE }),
      }),
    )
  } else if (request.destination === 'image') {
    event.respondWith(handleAsset(event, IMAGES_CACHE, MAX_IMAGES))
  } else if (ASSET_DESTINATIONS.includes(request.destination)) {
    event.respondWith(handleAsset(event, ASSETS_CACHE, MAX_ASSETS))
  }
})

// Первую страницу браузер загрузил ещё до воркера, и та мимо кеша прошла.
// Скрипт страницы присылает её адрес, чтобы и она открывалась без сети.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-page') {
    return
  }
  const url = new URL(event.data.url, self.location.origin)
  if (url.origin !== self.location.origin) {
    return
  }
  event.waitUntil(
    fetch(url.pathname)
      .then((response) => putInCache(PAGES_CACHE, MAX_PAGES, url.pathname, response))
      .catch(() => {}),
  )
})
