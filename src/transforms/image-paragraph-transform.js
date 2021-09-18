// Извлекаем изображения из параграфов
/**
 *
 * @param {Window} window
 */
module.exports = function(window) {
  window.document.querySelector('.content')
    ?.querySelectorAll('p > img, p > picture')
    .forEach(element => {
      element.parentElement.replaceWith(element)
    })
}
