/**
 * @param {Window} window
 */
module.exports = function (window) {
  const content = window.document.querySelector('.article__content-inner')
  const color = content?.querySelectorAll('.token.color')

  color?.forEach(function (item) {
    if (/(transparent)/.test(item.textContent)) {
      return item.classList.replace('color', 'color-transparent') // Выключает color-picker для цвета transparent
    }

    item.style.setProperty('--color-picker', ` ${item.textContent}`)
    item.classList.add('color-picker__inline')

    if (/[(]/.test(item.previousElementSibling.textContent)) {
      item.previousElementSibling.classList.add('color-picker__grouped') // Добавляет дополнительный margin скобке, если затем следует токен цвета
    }
  })
}
