const CACHE_PERIOD = 2
const salt = (cachePeriod) => {
  return new Date().getUTCDate() % cachePeriod >= cachePeriod / 2 ? 'even' : 'odd'
}
const syncFeaturedCacheName = 'doka-sync-featured-' + salt(CACHE_PERIOD)

const ONLINE_STATE_CLASS = 'online'
const OFFLINE_STATE_CLASS = 'offline'
const CACHED_LINK_CLASS = 'link--cached'
const NON_CACHED_LINK_CLASS = 'link--non-cached'

function setLinksMarked() {
  document.querySelector('body').classList.add(ONLINE_STATE_CLASS)
  const links = document.querySelectorAll('a')
  links.forEach(async (l) => {
    const request = new Request(l.href)
    const isCached = await caches.match(request)
    if (isCached) {
      l.classList.add(CACHED_LINK_CLASS)
    } else {
      l.classList.add(NON_CACHED_LINK_CLASS)
    }
  })
}

async function requestBackgroundSync(cacheKey, registration) {
  if (registration.sync) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(cacheKey)
  }
}

function setNetworkStatus() {
  document.querySelector('body').classList.add(ONLINE_STATE_CLASS)

  window.addEventListener('online', async () => {
    document.querySelector('body').classList.add(ONLINE_STATE_CLASS)
    document.querySelector('body').classList.remove(OFFLINE_STATE_CLASS)
  })

  window.addEventListener('offline', async () => {
    document.querySelector('body').classList.add(OFFLINE_STATE_CLASS)
    document.querySelector('body').classList.remove(ONLINE_STATE_CLASS)
  })
}

window.addEventListener('load', async () => {
  setNetworkStatus()

  if (navigator.serviceWorker) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      navigator.serviceWorker.ready.then((registration) => {
        requestBackgroundSync(syncFeaturedCacheName, registration)
      })
      navigator.serviceWorker.ready.then((registration) => {
        registration.active.postMessage(window.location.pathname)
      })
    } catch (error) {
      console.error(error)
    }
  }
  setLinksMarked()
})
