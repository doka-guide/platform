const CACHE_PERIOD = 2
const salt = (cachePeriod) => {
  return new Date().getUTCDate() % cachePeriod >= cachePeriod / 2 ? 'even' : 'odd'
}
const syncFeaturedCacheName = 'doka-sync-featured-' + salt(CACHE_PERIOD)

async function requestBackgroundSync(cacheKey, registration) {
  if (registration.sync) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(cacheKey)
  }
}

window.addEventListener('load', async () => {
  if (navigator.serviceWorker) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      navigator.serviceWorker.ready.then((registration) => {
        requestBackgroundSync(syncFeaturedCacheName, registration)
      })
    } catch (error) {
      console.error(error)
    }
  }
})
