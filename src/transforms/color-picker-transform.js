/**
 * @param {Window} window
 */
module.exports = function (window) {
  const content = window.document.querySelector('.article__content-inner')
  const color = content?.querySelectorAll('.token.color')

  color?.forEach(function (item) {
    item.style.setProperty('--color-picker', ` ${item.textContent}`)

    if (/[(]/.test(item.previousElementSibling.textContent)) {
      item.classList.add('color-picker__internal') // Добавляет дополнительный margin слева, если токен цвета внутри скобок
    } else {
      item.classList.add('color-picker__external')
    }
  })
}
