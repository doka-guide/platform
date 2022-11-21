/*
 * Скрипт для обрезки длины заголовка секции в боковой навигации
 */

const tocLinks = document.querySelectorAll('.toc__link')
const MAX_LENGTH = 90

const clipContent = (linksArray, maxLength) => {
  linksArray.forEach((link) => {
    const linkText = link.textContent.trim().replace(/\s+/g, ' ')

    if (linkText.length > maxLength) {
      let linkTextArr = linkText.split(' ')

      while (linkTextArr.join(' ').length > maxLength) {
        linkTextArr.pop()
      }

      link.textContent = `${linkTextArr.join(' ')}…`
    }
  })
}

clipContent(tocLinks, MAX_LENGTH)
