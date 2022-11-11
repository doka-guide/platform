// Кеш сохраняется раз в два дня
const CACHE_PERIOD = 2
const salt = (cachePeriod) => {
  return new Date().getUTCDate() % cachePeriod >= cachePeriod / 2 ? 'even' : 'odd'
}
const assetsCacheName = 'doka-assets-' + salt(CACHE_PERIOD)
const staticCacheName = 'doka-static-' + salt(CACHE_PERIOD)
const dynamicCacheName = 'doka-dynamic-' + salt(CACHE_PERIOD)

const offlinePageUrl = '/offline/'

const assetsResources = [
  '/fonts/graphik/graphik-medium.woff2',
  '/fonts/graphik/graphik-regular.woff2',
  '/fonts/graphik/graphik-regular-italic.woff2',
  '/fonts/spot-mono/spot-mono-light.woff2',
  '/scripts/index.js',
  '/styles/index.css',
  '/styles/dark-theme.css',
  '/images/logo/logo-offline.svg',
  '/images/partners/practicum.svg',
  '/images/partners/practicum-icon.svg',
  '/images/badges/doka-dog-help-10.svg',
  '/images/badges/doka-dog-help-100.svg',
  '/images/badges/doka-dog-help-5.svg',
  '/images/badges/doka-dog-help-50.svg',
  '/images/badges/first-contribution-small.svg',
  '/images/badges/hackathon-practicum.svg',
  '/images/badges/merged-pr-10.svg',
  '/images/badges/merged-pr-100.svg',
  '/images/badges/merged-pr-5.svg',
  '/images/badges/merged-pr-50.svg',
  '/images/badges/most-viewed-month-line.svg',
  '/images/badges/most-viewed-month-zeta.svg',
  '/images/badges/most-viewed-week-line.svg',
  '/images/badges/most-viewed-week-zeta.svg',
  '/images/badges/most-viewed-year-line.svg',
  '/images/badges/most-viewed-year-zeta.svg',
]

const staticPages = [
  offlinePageUrl,
  '/',
  '/404/',
  '/a11y/',
  '/all/',
  '/css/',
  '/html/',
  '/js/',
  '/letuchka/',
  '/licenses/',
  '/people/',
  '/recipes/',
  '/tools/',
  '/ylf/',
]

const cacheSettings = {
  '.avif': { dataType: 'blob', headers: { 'Content-Type': 'image/avif' } },
  '.bmp': { dataType: 'blob', headers: { 'Content-Type': 'image/bmp' } },
  '.css': { dataType: 'text', headers: { 'Content-Type': 'text/css; charset=UTF-8' } },
  '.gif': { dataType: 'blob', headers: { 'Content-Type': 'image/gif' } },
  '.html': { dataType: 'text', headers: { 'Content-Type': 'text/html; charset=UTF-8' } },
  '.ico': { dataType: 'blob', headers: { 'Content-Type': 'image/x-icon' } },
  '.jpg': { dataType: 'blob', headers: { 'Content-Type': 'image/jpeg' } },
  '.jpeg': { dataType: 'blob', headers: { 'Content-Type': 'image/jpeg' } },
  '.js': { dataType: 'text', headers: { 'Content-Type': 'application/javascript; charset=UTF-8' } },
  '.json': { dataType: 'json', headers: { 'Content-Type': 'application/json; charset=UTF-8' } },
  '.mpeg': { dataType: 'blob', headers: { 'Content-Type': 'video/mpeg' } },
  '.mp4': { dataType: 'blob', headers: { 'Content-Type': 'video/mp4' } },
  '.png': { dataType: 'blob', headers: { 'Content-Type': 'image/png' } },
  '.svg': { dataType: 'text', headers: { 'Content-Type': 'image/svg+xml; charset=UTF-8' } },
  '.tiff': { dataType: 'blob', headers: { 'Content-Type': 'image/tiff' } },
  '.webp': { dataType: 'blob', headers: { 'Content-Type': 'image/webp' } },
  '.woff2': { dataType: 'blob', headers: { 'Content-Type': 'application/font-woff2' } },
}

// Вспомогательные функции

async function enableNavigationPreload() {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable()
  }
}

function getMimeType(path) {
  const extension = path.match(/\..+$/)
  return extension ? extension[0].match(/^\.[a-z0-9]{2,5}/)[0] : '.html'
}

async function putInCache(cacheKey, request, response) {
  const cache = await caches.open(cacheKey)
  await cache.put(request, response)
}

async function putInCacheWithSettings(cacheKey, request, response, extension, settings) {
  switch (settings[extension].dataType) {
    case 'blob':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: settings[extension].headers }))
      break
    case 'json':
      putInCache(cacheKey, request, new Response(await response.json(), { headers: settings[extension].headers }))
      break
    case 'text':
      putInCache(cacheKey, request, new Response(await response.text(), { headers: settings[extension].headers }))
      break
    default:
      putInCache(
        cacheKey,
        request,
        new Response(await response.text(), { headers: { 'Content-Type': 'text/plain; charset=UTF-8' } })
      )
      break
  }
}

async function cloneResponseInCache(cacheKey, path, preloadResponse) {
  const request = new Request(path)
  const response = preloadResponse.clone()
  await putInCacheWithSettings(cacheKey, request, response, getMimeType(path), cacheSettings)
}

async function putResInCache(cacheKey, path) {
  const request = new Request(path)
  const response = await fetch(request)
  await putInCacheWithSettings(cacheKey, request, response, getMimeType(path), cacheSettings)
  return response
}

async function putResourcesInCache(cacheKey, pages) {
  for (let i = 0; i < pages.length; i++) {
    await putResInCache(cacheKey, pages[i])
  }
}

// Стратегия кеширования

async function cacheStrategyImpl({ cacheKey, request, preloadResponsePromise, fallbackUrl }) {
  // Игнорирует запросы на другие домены
  if (!request.url.startsWith(self.location.origin)) {
    return new Response()
  }

  // Игнорирует запросы browser-sync в режиме отладки
  if (request.url.indexOf('browser-sync') > -1) {
    return new Response()
  }

  // Игнорирует кеширование манифеста
  if (request.url.endsWith('manifest.json')) {
    return new Response()
  }

  // Игнорирует кеширование страниц, если адрес заканчивается на 'index.html'
  if (request.url.endsWith('index.html')) {
    return new Response()
  }

  // Игнорирует кеширование страниц с параметрами GET запроса
  if (request.url.indexOf('.html?') > -1 || request.url.indexOf('.js?') > -1) {
    return new Response()
  }

  // Игнорирует кеширование страниц с якорями
  if (request.url.indexOf('#') > -1) {
    return new Response()
  }

  // Игнорирует кеширование запросов методом POST
  if (request.method === 'POST') {
    return new Response()
  }

  // Пробует загрузить ресурс из кеша
  const responseFromCache = await caches.match(request)
  if (responseFromCache) {
    return responseFromCache
  }

  // Пробует получить ресурс из сети, если не получилось загрузить из кеша
  try {
    // Пробует воспользоваться предварительно загруженным ресурсом, если не получилось загрузить из кеша
    const preloadResponse = await preloadResponsePromise
    if (preloadResponse) {
      cloneResponseInCache(cacheKey, request.url, preloadResponse)
      return preloadResponse
    }

    // Запрашиваемый пользователем ресурс загружается и помещается в кеш
    return putResInCache(cacheKey, request.url)
  } catch (error) {
    // Если ресурс загрузить не получилось, показывается страница с уведомлением об отсутствии сети
    const fallbackResponse = await caches.match(fallbackUrl)
    if (fallbackResponse) {
      return fallbackResponse
    }

    // Если такую страницу загрузить не получилось, возвращается ошибка
    return new Response('408: Ошибка сети', {
      status: 408,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    })
  }
}

// Слушатели

self.addEventListener('install', async () => {
  await putResourcesInCache(assetsCacheName, assetsResources)
  await putResourcesInCache(staticCacheName, staticPages)
})

self.addEventListener('activate', async () => {
  const cacheNames = await caches.keys()
  await enableNavigationPreload()
  await Promise.all(
    cacheNames
      .filter((name) => name !== assetsCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  )
})

self.addEventListener('fetch', async (event) => {
  event.respondWith(
    cacheStrategyImpl({
      cacheKey: dynamicCacheName,
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: offlinePageUrl,
    })
  )
})
