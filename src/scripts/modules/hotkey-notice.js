import { isSearchHotkey, shouldShowHotkeyNotice } from '../libs/search-hotkey.js'
import { markNoticeShown } from '../libs/page-notice.js'

// Временная подсказка о смене клавиши поиска (#1407)
const storageKey = 'hotkey-notice'

function init() {
  const notice = document.querySelector('.hotkey-notice')
  const hint = document.querySelector('.hotkey--search')

  if (!notice?.showPopover) {
    return
  }

  try {
    const isCookieAccepted = JSON.parse(localStorage.getItem('cookie-notification')) === true

    // Новичок примет куки и на следующей странице уже не отличается от старожила — запоминаем его сейчас
    if (!isCookieAccepted) {
      localStorage.setItem(storageKey, 'CLOSED')
    }

    if (!shouldShowHotkeyNotice({ storedValue: localStorage.getItem(storageKey), isCookieAccepted, now: new Date() })) {
      return
    }
  } catch (error) {
    console.error(error)
    return
  }

  // Подсказки клавиш нет на узких экранах и на странице поиска — там и рассказывать не о чем
  if (!hint?.checkVisibility()) {
    return
  }

  // Закрытие крестиком, кликом мимо и Esc даёт сам popover="auto", здесь только запоминаем его
  notice.addEventListener('toggle', (event) => {
    if (event.newState === 'closed') {
      hint.classList.remove('hotkey--highlighted')
      localStorage.setItem(storageKey, 'CLOSED')
    }
  })

  // Попробовали новую клавишу — подсказка своё дело сделала
  document.addEventListener('keydown', (event) => {
    if (isSearchHotkey(event) && notice.matches(':popover-open')) {
      notice.hidePopover()
    }
  })

  hint.classList.add('hotkey--highlighted')
  notice.showPopover()
  markNoticeShown()
}

// После load, а не сразу: подсказка появляется, когда страница уже отрисована и не прыгает
window.addEventListener('load', init, { once: true })
