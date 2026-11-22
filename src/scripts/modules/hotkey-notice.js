import { isSearchHotkey, shouldShowHotkeyNotice } from '../libs/search-hotkey.js'

// Временная подсказка о смене клавиши поиска (#1407)
const storageKey = 'hotkey-notice'

function init() {
  const notice = document.querySelector('.hotkey-notice')
  const hint = document.querySelector('.hotkey--search')

  // Подсказки клавиш нет на узких экранах и на странице поиска — там и рассказывать не о чем
  if (!notice?.showPopover || !hint?.checkVisibility()) {
    return
  }

  try {
    if (!shouldShowHotkeyNotice(localStorage.getItem(storageKey), new Date())) {
      return
    }
  } catch (error) {
    console.error(error)
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
}

// После load, а не сразу: подсказка появляется, когда страница уже отрисована и не прыгает
window.addEventListener('load', init, { once: true })
