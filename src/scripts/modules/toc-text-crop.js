/*
 * Скрипт для обрезки длины заголовка секции в боковой навигации
 */

const tocLinks = Array.from(document.querySelectorAll('.toc__link'))
const strLength = 80

const clipContent = (linksArray, finalLength) => {
  linksArray.forEach((link) => {
    let tmpString = ''
    if (link.textContent.length > finalLength) {
      let stringArray = link.textContent.trim().replace(/\s+/g, ' ').split(' ')
      for (let i in stringArray) {
        if (tmpString.length <= finalLength) {
          tmpString += stringArray[i] + ' '
        } else {
          break
        }
      }

      link.textContent = `${tmpString.trim()}…`
    }
  })
}

clipContent(tocLinks, strLength)
