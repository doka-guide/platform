const { Node } = require('linkedom')

// Помещаем изображения с подписями внутрь figure
/**
 *
 * @param {Window} window
 */
module.exports = function(window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  Array.from(articleContent.querySelectorAll('img, picture'))
    .filter(element => !element.matches('figure img, picture img'))
    .forEach(element => {
      // обычно все markdown-парсеры используют тег 'br' для переноса
      const brElement = element.nextElementSibling
      const hasCaption = brElement?.tagName.toLowerCase() === 'br'
      const textSibling = hasCaption && brElement.nextSibling

      if (textSibling?.nodeType === Node.TEXT_NODE) {
        const figcaptionText = textSibling.textContent.trim()
        const figure = window.document.createElement('figure')
        textSibling.remove()
        brElement.remove()
        figure.innerHTML = `
          ${element.outerHTML}
          ${figcaptionText ? `<figcaption>${figcaptionText}</figcaption>` : ''}
        `
        element.replaceWith(figure)
      }
    })

  articleContent
    .querySelectorAll('figure')
    .forEach(figureElement => {
      figureElement.classList.add('figure')
      figureElement.querySelector('figcaption')?.classList.add('figure__caption')
      figureElement.firstElementChild?.classList.add('figure__content')
    })

  // достаём изображения из параграфов
  articleContent
    .querySelectorAll('p > figure, p > picture, p > img')
    .forEach(element => {
      element.parentElement.replaceWith(element)
    })
}
