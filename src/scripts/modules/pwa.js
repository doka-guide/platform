const ONLINE_STATE_CLASS = 'online'
const OFFLINE_STATE_CLASS = 'offline'
const CACHED_LINK_CLASS = 'link--cached'
const NON_CACHED_LINK_CLASS = 'link--non-cached'

function setLinksMarked() {
  const links = document.querySelectorAll('a:not(.toc__link)')
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

function setNetworkStatus() {
  if (window.navigator.onLine) {
    document.querySelector('body').classList.add(ONLINE_STATE_CLASS)
  } else {
    document.querySelector('body').classList.add(OFFLINE_STATE_CLASS)
  }

  window.addEventListener('online', async () => {
    document.querySelector('body').classList.add(ONLINE_STATE_CLASS)
    document.querySelector('body').classList.remove(OFFLINE_STATE_CLASS)
  })

  window.addEventListener('offline', async () => {
    document.querySelector('body').classList.add(OFFLINE_STATE_CLASS)
    document.querySelector('body').classList.remove(ONLINE_STATE_CLASS)
  })
}

// Сервис-воркер отключён, регистрации здесь больше нет: см. комментарий в
// src/sw.js. Осталась только разметка состояния сети и ссылок.
window.addEventListener('load', () => {
  setNetworkStatus()
  setLinksMarked()
})
