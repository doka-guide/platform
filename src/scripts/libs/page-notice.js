// За один просмотр страницы читатель видит не больше одного всплывающего окна.
// Баннер о куках, подсказка о клавише поиска и приглашение подписаться подряд только раздражают
let isShown = false

export function markNoticeShown() {
  isShown = true
}

export function isNoticeShown() {
  return isShown
}
