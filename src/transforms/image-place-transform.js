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

  // достаём изображения из параграфов
  articleContent
    .querySelectorAll('p > img, p > picture')
    .forEach(element => {
      element.parentElement.replaceWith(element)
    })

  Array.from(articleContent.querySelectorAll('img, picture'))
    .filter(element => !element.matches('figure img, picture img'))
    .forEach(element => {
      const sibling = element.nextSibling
      if (sibling?.nodeType === Node.TEXT_NODE) {
        const figcaptionText = sibling.textContent.replace('\n', '').trim()
        const figure = window.document.createElement('figure')
        sibling.remove()
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
}
