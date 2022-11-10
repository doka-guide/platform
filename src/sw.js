const assetsCacheName = 'doka-assets-v1'
const staticCacheName = 'doka-static-v1'
const dynamicCacheName = 'doka-dynamic-v1'

const offlinePageUrl = '/offline/'

const assetsResources = [
  '/featured.json',
  '/fonts/graphik/graphik-regular.woff2',
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

// Вспомогательные функции

function getMimeType(path) {
  const extension = path.match(/\..+$/)
  return extension ? extension[0] : ''
}

async function putInCache(cacheKey, request, response) {
  const cache = await caches.open(cacheKey)
  await cache.put(request, response)
}

async function enableNavigationPreload() {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable()
  }
}

async function putResInCache(cacheKey, path) {
  const request = new Request(path)
  const response = await fetch(request)
  switch (getMimeType(path)) {
    case '.avif':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/avif' } }))
      break
    case '.bmp':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/bmp' } }))
      break
    case '.css':
      putInCache(
        cacheKey,
        request,
        new Response(await response.text(), { headers: { 'Content-Type': 'text/css; charset=UTF-8' } })
      )
      break
    case '.gif':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/gif' } }))
      break
    case '.jpg':
    case '.jpeg':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/jpeg' } }))
      break
    case '.js':
      putInCache(
        cacheKey,
        request,
        new Response(await response.text(), { headers: { 'Content-Type': 'application/javascript; charset=UTF-8' } })
      )
      break
    case '.mpeg':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'video/mpeg' } }))
      break
    case '.mp4':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'video/mp4' } }))
      break
    case '.png':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/png' } }))
      break
    case '.svg':
      putInCache(
        cacheKey,
        request,
        new Response(await response.text(), { headers: { 'Content-Type': 'image/svg+xml; charset=UTF-8' } })
      )
      break
    case '.tiff':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/tiff' } }))
      break
    case '.webp':
      putInCache(cacheKey, request, new Response(await response.blob(), { headers: { 'Content-Type': 'image/webp' } }))
      break
    case '.woff2':
      putInCache(
        cacheKey,
        request,
        new Response(await response.blob(), { headers: { 'Content-Type': 'application/font-woff2' } })
      )
      break
    default:
      putInCache(
        cacheKey,
        request,
        new Response(await response.text(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
      )
      break
  }
  return response
}

async function putResourcesInCache(cacheKey, pages) {
  for (let i = 0; i < pages.length; i++) {
    await putResInCache(cacheKey, pages[i])
  }
}

// Стратегия кеширования

async function cacheStrategyImpl({ cacheKey, request, preloadResponsePromise, fallbackUrl }) {
  // Обработка запросов методом POST
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
      putInCache(cacheKey, request, preloadResponse.clone())
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
  putResourcesInCache(assetsCacheName, assetsResources)
  putResourcesInCache(staticCacheName, staticPages)
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
