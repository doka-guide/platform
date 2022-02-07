// Оборачивает таблицы в обёртки с прокруткой
/**
 * @param {Window} window
 */
module.exports = function (window) {
  window.document
    .querySelector('.content')
    ?.querySelectorAll('table')
    ?.forEach((tableElement) => {
      const tableWrapper = window.document.createElement('div')
      tableWrapper.classList.add('table-wrapper')
      tableWrapper.setAttribute('tabindex', 0)
      tableElement.replaceWith(tableWrapper)
      tableWrapper.appendChild(tableElement)
    })
}
