// Встраивается в <head> до отрисовки, чтобы подсказка «⌘ K» не меняла вид после загрузки.
// navigator.platform устарел, но userAgentData есть пока только в Chromium,
// а при подмене User-Agent его platform — пустая строка
if (/mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform)) {
  document.documentElement.classList.add('apple-platform')
}
