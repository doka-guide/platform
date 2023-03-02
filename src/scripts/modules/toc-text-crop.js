/*
 * Скрипт для обрезки длины заголовка секции в боковой навигации
 */

const tocLinks = document.querySelectorAll('.toc__link')
export const MAX_LENGTH = 90

export const clipContent = (linksArray, maxLength) => {
  linksArray.forEach((link) => {
    const linkText = link.textContent.trim().replace(/\s+/g, ' ')

    if (linkText.length > maxLength) {
      const linkTextCropped = linkText.substr(0, maxLength)
      const indexOfLastSpace = linkTextCropped.lastIndexOf(' ')
      const resultText = linkTextCropped.slice(0, indexOfLastSpace)

      link.textContent = `${resultText}…`
    }
  })
}

clipContent(tocLinks, MAX_LENGTH)
