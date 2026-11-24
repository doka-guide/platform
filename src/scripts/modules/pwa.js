import { isOffline } from '../libs/network-status.js'
import { isAnyNoticeVisible, markNoticeShown } from '../libs/page-notice.js'

const OFFLINE_STATE_CLASS = 'offline'
const NON_CACHED_LINK_CLASS = 'link--non-cached'
// Скрытое пояснение к бледной ссылке: цвет скринридер не передаёт. Лежит в offline-notice.njk
const NON_CACHED_HINT_ID = 'offline-link-hint'
// Закрытая крестиком подсказка не появляется до конца сессии: ни когда сеть мигает,
// ни на следующей сохранённой странице. Читатель её уже прочитал
const NOTICE_DISMISSED_KEY = 'offline-notice-dismissed'
const STATUS_MESSAGE = 'Нет сети. Сохранённые страницы откроются, остальные ссылки помечены: без сети не откроется.'

// Отмечаем только ссылки, которые без сети не откроются: доступные выглядят
// как обычно. Кеш проверяем в момент потери сети, а не при загрузке: к этому
// времени воркер мог сохранить новые страницы.
// Плитки разделов в меню и на главной не ссылки .link, но ведут туда же.
async function markNonCachedLinks() {
  const links = document.querySelectorAll('a.link, a.nav-list__link, a.article-indexes-list__link')
  await Promise.all(
    [...links].map(async (link) => {
      const isCached = 'caches' in window && (await caches.match(link.href))
      link.classList.toggle(NON_CACHED_LINK_CLASS, !isCached)
      if (isCached) {
        link.removeAttribute('aria-describedby')
      } else {
        link.setAttribute('aria-describedby', NON_CACHED_HINT_ID)
      }
    }),
  )
}

async function setOffline() {
  await markNonCachedLinks()
  // Пока проверялся кеш, сеть могла вернуться, и setOnline уже отработал. Он не застал
  // пометки, которые markNonCachedLinks поставила после него, поэтому снимаем их ещё раз
  if (navigator.onLine) {
    setOnline()
    return
  }
  document.body.classList.add(OFFLINE_STATE_CLASS)

  if (sessionStorage.getItem(NOTICE_DISMISSED_KEY)) {
    return
  }
  // Живая область стоит вне подсказки: внутри popover, который был скрыт, скринридер
  // может её не заметить. Объявляем и тогда, когда подсказку закрывает другое окно
  const status = document.querySelector('.offline-status')
  if (status) {
    status.textContent = STATUS_MESSAGE
  }

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
  document.querySelectorAll(`[aria-describedby="${NON_CACHED_HINT_ID}"]`).forEach((link) => {
    link.removeAttribute('aria-describedby')
  })
  const status = document.querySelector('.offline-status')
  if (status) {
    status.textContent = ''
  }
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
  // Крестик отличаем от hidePopover в setOnline: прятать подсказку при возврате сети можно и дальше
  document.querySelector('.offline-notice__close')?.addEventListener('click', () => {
    sessionStorage.setItem(NOTICE_DISMISSED_KEY, '1')
  })
  updateNetworkStatus()
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', updateNetworkStatus)

  if (isWorkerAllowed()) {
    registerWorker()
  }
})
