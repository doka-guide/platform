// Баннер о куках, подсказка о клавише поиска и приглашение подписаться за один просмотр
// страницы показываются не больше одного раза: подряд они только раздражают.
// Подсказка о сети приходит в любой момент, поэтому она смотрит только на то, чтобы
// другое окно не было открыто прямо сейчас (isAnyNoticeVisible)
let isShown = false

export function markNoticeShown() {
  isShown = true
}

export function isNoticeShown() {
  return isShown
}

// Окна, которые читатель может видеть прямо сейчас: баннер о куках, приглашение
// подписаться в <dialog> и подсказки на popover
export function isAnyNoticeVisible() {
  return (
    document.querySelector('.cookie-notification:not([hidden]), dialog[open]') !== null ||
    [...document.querySelectorAll('[popover]')].some((element) => element.matches(':popover-open'))
  )
}
