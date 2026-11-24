import { isOffline } from '../libs/network-status.js'
import { isAnyNoticeVisible, markNoticeShown } from '../libs/page-notice.js'

const OFFLINE_STATE_CLASS = 'offline'
const NON_CACHED_LINK_CLASS = 'link--non-cached'

// Отмечаем только ссылки, которые без сети не откроются: доступные выглядят
// как обычно. Кеш проверяем в момент потери сети, а не при загрузке: к этому
// времени воркер мог сохранить новые страницы.
async function markNonCachedLinks() {
  const links = document.querySelectorAll('a.link')
  await Promise.all(
    [...links].map(async (link) => {
      const isCached = 'caches' in window && (await caches.match(link.href))
      link.classList.toggle(NON_CACHED_LINK_CLASS, !isCached)
    }),
  )
}

async function setOffline() {
  await markNonCachedLinks()
  // Пока проверялся кеш, сеть могла вернуться, и setOnline уже отработал
  if (navigator.onLine) {
    return
  }
  document.body.classList.add(OFFLINE_STATE_CLASS)

  // Одно окно за раз. Если читатель уже видит баннер о куках, подсказку о клавише
  // поиска или приглашение подписаться, подсказку о сети не показываем: бледные
  // ссылки остаются и без неё. Баннер о куках и подсказка о клавише решают, показываться
  // ли, только при загрузке страницы, а приглашение подписаться держит markNoticeShown.
  const notice = document.querySelector('.offline-notice')
  if (notice?.showPopover && !isAnyNoticeVisible()) {
    notice.showPopover()
    markNoticeShown()
  }
}

function setOnline() {
  document.body.classList.remove(OFFLINE_STATE_CLASS)
  // Без проверки showPopover селектор :popover-open бросил бы ошибку в Safari до 17
  const notice = document.querySelector('.offline-notice')
  if (notice?.showPopover && notice.matches(':popover-open')) {
    notice.hidePopover()
  }
}

async function updateNetworkStatus() {
  if (await isOffline()) {
    await setOffline()
  } else {
    setOnline()
  }
}

// На localhost воркер не регистрируется: дев-сервер отдаёт стили и скрипты без
// хеша в имени, и воркер показывал бы их версию до правки. Проверить его локально
// можно на продакшн-сборке, включив DOKA_MODE=DEBUG в localStorage.
function isWorkerAllowed() {
  return (
    'serviceWorker' in navigator &&
    (window.location.hostname !== 'localhost' || localStorage.getItem('DOKA_MODE') === 'DEBUG')
  )
}

async function registerWorker() {
  // Страницу, загруженную через воркер, он уже сохранил сам. Проверяем до регистрации:
  // clients.claim у нового воркера выставит controller раньше, чем сработает ready
  const isControlled = Boolean(navigator.serviceWorker.controller)
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    const registration = await navigator.serviceWorker.ready
    // Эта страница загрузилась раньше воркера и в кеш не попала. Просим воркер
    // сохранить её, чтобы она открывалась без сети.
    if (!isControlled) {
      registration.active.postMessage({ type: 'cache-page', url: window.location.href })
    }
  } catch (error) {
    console.error(error)
  }
}

window.addEventListener('load', () => {
  updateNetworkStatus()
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', updateNetworkStatus)

  if (isWorkerAllowed()) {
    registerWorker()
  }
})
