/*
 * Скрипт для обрезки длины заголовка секции в боковой навигации
 */

const tocLinks = document.querySelectorAll('.toc__link')
const MAX_LENGTH = 10

const clipContent = (linksArray, maxLength) => {
  linksArray.forEach((link) => {
    let wordsArray = link.textContent.trim().replace(/\s+/g, ' ').split(' ')

    if (wordsArray.length > maxLength) {
      const croppedString = wordsArray.slice(0, maxLength).join(' ')
      link.textContent = `${croppedString}…`
    }
  })
}

clipContent(tocLinks, MAX_LENGTH)
