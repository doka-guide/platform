/*
 * Скрипт для обрезки длины заголовка секции в боковой навигации
 */

const tocLinks = Array.from(document.querySelectorAll('.toc__link'))
const strLength = 90

tocLinks.forEach((link) => {
  if (link.textContent.length > strLength) {
    let stringArray = link.textContent.trim().replace(/\s+/g, ' ').split(' ')
    let tmpString = ''
    for (let i in stringArray) {
      if (tmpString.length <= strLength) {
        tmpString += stringArray[i] + ' '
        console.log(i)
      } else {
        return
      }

      link.textContent = stringArray.slice(0, i).join(' ') + '…'
    }
  }
})
