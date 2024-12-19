// Кеш сохраняется раз в два дня
const CACHE_PERIOD = 2
const salt = (cachePeriod) => {
  return new Date().getUTCDate() % cachePeriod >= cachePeriod / 2 ? 'even' : 'odd'
}

const debugStylesCacheName = 'doka-debug-styles-' + salt(CACHE_PERIOD)
const debugScriptsCacheName = 'doka-debug-scripts-' + salt(CACHE_PERIOD)
const assetsCacheName = 'doka-assets-' + salt(CACHE_PERIOD)
const staticCacheName = 'doka-static-' + salt(CACHE_PERIOD)
const dynamicCacheName = 'doka-dynamic-' + salt(CACHE_PERIOD)
const syncFeaturedCacheName = 'doka-sync-featured-' + salt(CACHE_PERIOD)

const offlinePageUrl = '/offline/'

const debugStyles = [
  '/styles/blocks/all-articles.css',
  '/styles/blocks/answer.css',
  '/styles/blocks/article-heading.css',
  '/styles/blocks/article-image.css',
  '/styles/blocks/article-indexes-list.css',
  '/styles/blocks/article-nav.css',
  '/styles/blocks/article.css',
  '/styles/blocks/articles-gallery.css',
  '/styles/blocks/articles-group.css',
  '/styles/blocks/base-list.css',
  '/styles/blocks/base.css',
  '/styles/blocks/baseline.css',
  '/styles/blocks/block-code.css',
  '/styles/blocks/breadcrumbs.css',
  '/styles/blocks/button.css',
  '/styles/blocks/callout.css',
  '/styles/blocks/code-fix.css',
  '/styles/blocks/color-picker.css',
  '/styles/blocks/container.css',
  '/styles/blocks/content.css',
  '/styles/blocks/contributors.css',
  '/styles/blocks/cookie-notification.css',
  '/styles/blocks/copy-button.css',
  '/styles/blocks/details.css',
  '/styles/blocks/doc.css',
  '/styles/blocks/featured-article.css',
  '/styles/blocks/featured-articles-list.css',
  '/styles/blocks/feedback-control-list.css',
  '/styles/blocks/feedback-form.css',
  '/styles/blocks/figure.css',
  '/styles/blocks/filter-group.css',
  '/styles/blocks/filter-panel.css',
  '/styles/blocks/float-button.css',
  '/styles/blocks/font-theme.css',
  '/styles/blocks/footer.css',
  '/styles/blocks/format-block.css',
  '/styles/blocks/github-widget.css',
  '/styles/blocks/header.css',
  '/styles/blocks/hotkey.css',
  '/styles/blocks/index-block.css',
  '/styles/blocks/index-group-list.css',
  '/styles/blocks/index-section.css',
  '/styles/blocks/inline-code.css',
  '/styles/blocks/intro.css',
  '/styles/blocks/link.css',
  '/styles/blocks/linked-article.css',
  '/styles/blocks/logo.css',
  '/styles/blocks/materials-collection.css',
  '/styles/blocks/menu-toggle.css',
  '/styles/blocks/nav-list.css',
  '/styles/blocks/not-found.css',
  '/styles/blocks/notification.css',
  '/styles/blocks/people-page.css',
  '/styles/blocks/person-avatar.css',
  '/styles/blocks/person-badges.css',
  '/styles/blocks/person-grid.css',
  '/styles/blocks/person-links-list.css',
  '/styles/blocks/person-page.css',
  '/styles/blocks/person.css',
  '/styles/blocks/persons-list.css',
  '/styles/blocks/practices.css',
  '/styles/blocks/question-form.css',
  '/styles/blocks/questions.css',
  '/styles/blocks/related-articles-list.css',
  '/styles/blocks/search-category.css',
  '/styles/blocks/search-hit.css',
  '/styles/blocks/search-page.css',
  '/styles/blocks/search-result-list.css',
  '/styles/blocks/search-tag.css',
  '/styles/blocks/search.css',
  '/styles/blocks/snow-toggle.css',
  '/styles/blocks/snow.css',
  '/styles/blocks/social-card.css',
  '/styles/blocks/standalone-page.css',
  '/styles/blocks/subscribe-page.css',
  '/styles/blocks/subscribe-popup.css',
  '/styles/blocks/suggestion-list.css',
  '/styles/blocks/switch.css',
  '/styles/blocks/table-wrapper.css',
  '/styles/blocks/tag-filter.css',
  '/styles/blocks/text-control.css',
  '/styles/blocks/theme-toggle.css',
  '/styles/blocks/toc.css',
  '/styles/blocks/visually-hidden.css',
  '/styles/blocks/vote.css',
  '/styles/base-colors.css',
  '/styles/blocks',
  '/styles/code-dark-theme.css',
  '/styles/code-light-theme.css',
  '/styles/dark-theme.css',
  '/styles/fonts.css',
  '/styles/fonts.sc.css',
  '/styles/index.css',
  '/styles/index.sc.css',
  '/styles/light-theme.css',
]

const debugScripts = [
  '/scripts/core/base-component.js',
  '/scripts/core/search-api-client.js',
  '/scripts/core/search-commons.js',
  '/scripts/libs/debounce.js',
  '/scripts/libs/throttle.js',
  '/scripts/modules/answer.js',
  '/scripts/modules/article-aside.js',
  '/scripts/modules/article-nav.js',
  '/scripts/modules/articles-gallery.js',
  '/scripts/modules/articles-index.js',
  '/scripts/modules/code-line-numbers.js',
  '/scripts/modules/cookie-notification.js',
  '/scripts/modules/copy-code-snippet.js',
  '/scripts/modules/feedback-form.js',
  '/scripts/modules/filter-panel.js',
  '/scripts/modules/form-cache.js',
  '/scripts/modules/github-widget.js',
  '/scripts/modules/header-quick-search-presenter.js',
  '/scripts/modules/header.js',
  '/scripts/modules/last-update.js',
  '/scripts/modules/linked-article-navigation.js',
  '/scripts/modules/logo.js',
  '/scripts/modules/people.js',
  '/scripts/modules/person-badges-tooltip.js',
  '/scripts/modules/person-badges.js',
  '/scripts/modules/persons-list.js',
  '/scripts/modules/practices.js',
  '/scripts/modules/pwa.js',
  '/scripts/modules/question-form.js',
  '/scripts/modules/quick-search.js',
  '/scripts/modules/search-page-filter.js',
  '/scripts/modules/search.js',
  '/scripts/modules/snow-toggle.js',
  '/scripts/modules/subscribe-form.js',
  '/scripts/modules/subscribe-popup.js',
  '/scripts/modules/theme-toggle.js',
  '/scripts/modules/toc-text-crop.js',
  '/scripts/modules/toc.js',
  '/scripts/modules/triggers.js',
]

const assetsResources = [
  '/fonts/graphik/graphik-medium.woff2',
  '/fonts/graphik/graphik-regular.woff2',
  '/fonts/graphik/graphik-regular-italic.woff2',
  '/fonts/spot-mono/spot-mono-light.woff2',
  '/scripts/index.js',
  '/styles/index.css',
  '/styles/dark-theme.css',
  '/images/assets/cached-link.svg',
  '/images/assets/non-cached-link.svg',
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
  '/images/badges/ny.svg',
  '/images/badges/superstar.svg',
]

const staticPages = [
  offlinePageUrl,
  '/',
  '/404/',
  '/about/',
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
  const extension = typeof path === 'string' ? path.match(/\..+$/) : undefined
  if (extension && Array.isArray(extension) && typeof extension[0] === 'string') {
    const matches = extension[0].match(/^\.[a-z0-9]{2,5}/)
    return matches ? matches[0] : ''
  } else {
    return '.html'
  }
}

async function putInCache(cacheKey, request, response) {
  const cache = await caches.open(cacheKey)
  await cache.put(request, response)
}

async function putInCacheWithSettings(cacheKey, request, response, extension, settings) {
  if (settings && settings[extension] && settings[extension].dataType) {
    switch (settings[extension].dataType) {
      case 'blob':
        await putInCache(
          cacheKey,
          request,
          new Response(await response.blob(), { headers: settings[extension].headers }),
        )
        break
      case 'json':
        await putInCache(
          cacheKey,
          request,
          new Response(await response.json(), { headers: settings[extension].headers }),
        )
        break
      case 'text':
        await putInCache(
          cacheKey,
          request,
          new Response(await response.text(), { headers: settings[extension].headers }),
        )
        break
      default:
        await putInCache(
          cacheKey,
          request,
          new Response(await response.text(), { headers: { 'Content-Type': 'text/plain; charset=UTF-8' } }),
        )
        break
    }
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

async function putResourcesInCache(cacheKey, paths) {
  for (let i = 0; i < paths.length; i++) {
    await putResInCache(cacheKey, paths[i])
  }
}

async function putPageInCache(cacheKey, page, loadRelated = true) {
  const response = await putResInCache(cacheKey, page.replace(/\/#.+$/, ''))
  if (typeof page === 'string' && page.match(/^\/(a11y|css|html|js|tools|recipes)\/.+\//)) {
    try {
      const pageJson = await (await fetch(`${page}index.json`)).json()
      if (pageJson.images) {
        await putResourcesInCache(cacheKey, pageJson.images)
      }
      if (pageJson.videos) {
        await putResourcesInCache(cacheKey, pageJson.videos)
      }
      if (pageJson.demos) {
        await putPagesInCache(cacheKey, pageJson.demos, false)
      }
      if (pageJson.cover) {
        await putResInCache(cacheKey, pageJson.cover.desktop)
        await putResInCache(cacheKey, pageJson.cover.mobile)
      }
      if (loadRelated && pageJson.links) {
        await putPagesInCache(
          cacheKey,
          pageJson.links.inArticle.inside.filter((l) => !l.match('#')),
          false,
        )
        await putPageInCache(cacheKey, pageJson.links.nextArticle, false)
        await putPageInCache(cacheKey, pageJson.links.previousArticle, false)
        await putPagesInCache(cacheKey, pageJson.links.relatedArticles, false)
      }
    } catch (error) {
      console.log(error)
    }
  } else if (page.match(/^\/people\//)) {
    const pageJson = await (await fetch(`${page}index.json`)).json()
    if (pageJson.images) {
      await putResourcesInCache(cacheKey, pageJson.images)
    }
    if (pageJson.links) {
      await putResourcesInCache(cacheKey, pageJson.links)
    }
  }
  return response
}

async function putPagesInCache(cacheKey, pages, loadRelated = true) {
  if (Array.isArray(pages)) {
    for (let i = 0; i < pages.length; i++) {
      if (!(await caches.match(new Request(pages[i])))) {
        await putPageInCache(cacheKey, pages[i], loadRelated)
      }
    }
  }
}

// Стратегия кеширования
async function cacheStrategyImpl({ cacheKey, request, preloadResponsePromise, fallbackUrl }) {
  let requestedUrl = request.url

  // Пробует загрузить ресурс из кеша
  const responseFromCache = await caches.match(request)
  if (responseFromCache) {
    return responseFromCache
  }

  // Обрабатывает URL для кеширование страниц, если адрес заканчивается на 'index.html'
  if (requestedUrl.endsWith('index.html')) {
    requestedUrl = requestedUrl.replace('index.html', '')
  }

  // Пробует получить ресурс из сети, если не получилось загрузить из кеша
  try {
    // Пробует воспользоваться предварительно загруженным ресурсом, если не получилось загрузить из кеша
    const preloadResponse = await preloadResponsePromise
    if (preloadResponse) {
      cloneResponseInCache(cacheKey, requestedUrl, preloadResponse)
      return preloadResponse
    }

    // Запрашиваемый пользователем ресурс загружается и помещается в кеш
    return putResInCache(cacheKey, request)
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
  if (self.location.origin.startsWith('http://localhost')) {
    await putResourcesInCache(debugStylesCacheName, debugStyles)
    await putResourcesInCache(debugScriptsCacheName, debugScripts)
  }
  await putResourcesInCache(assetsCacheName, assetsResources)
  await putPagesInCache(staticCacheName, staticPages)
})

self.addEventListener('activate', async () => {
  const cacheNames = await caches.keys()
  await enableNavigationPreload()
  await Promise.all(
    cacheNames
      .filter((name) => name !== assetsCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name)),
  )
})

self.addEventListener('sync', async (event) => {
  const cacheNames = await caches.keys()

  if (event.tag === syncFeaturedCacheName && !cacheNames.includes(syncFeaturedCacheName)) {
    const response = await fetch('/featured.json')
    const featured = await response.json()

    await putPagesInCache(
      syncFeaturedCacheName,
      featured.map((f) => f.link),
      false,
    )
  }
})

self.addEventListener('message', async (event) => {
  await putPageInCache(dynamicCacheName, event.data)
})

self.addEventListener('fetch', async (event) => {
  // Игнорирует запросы на другие домены
  if (!event.request.startsWith(self.location.origin) && event.request.method === 'POST') {
    return new Response(fetch(event.request))
  }

  // Игнорирует кеширование Service Worker
  if (event.request.endsWith('sw.js')) {
    return new Response(fetch(event.request))
  }

  // Игнорирует кеширование манифеста
  if (event.request.endsWith('manifest.json')) {
    return new Response(fetch(event.request))
  }

  // Игнорирует кеширование страниц с параметрами GET запроса
  if (event.request.indexOf('.html?') > -1 || event.request.indexOf('.js?') > -1) {
    return new Response(fetch(event.request))
  }

  event.respondWith(
    cacheStrategyImpl({
      cacheKey: dynamicCacheName,
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: offlinePageUrl,
    }),
  )
})
