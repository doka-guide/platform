// Показывает шапку/подвал демки, только когда документ открыт не в iframe.
// Класс выставляется синхронно (скрипт без defer/async), чтобы не было
// вспышки шапки при первой отрисовке отдельной вкладки.
if (window.self === window.top) {
  document.documentElement.classList.add('demo-frame--visible')
}
