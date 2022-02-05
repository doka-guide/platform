const { Node } = require('linkedom')

// Помещаем изображения с подписями внутрь figure
/**
 *
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  Array.from(articleContent.querySelectorAll('img, picture'))
    .filter((element) => !element.matches('figure img, picture img'))
    .forEach((element) => {
      // обычно все markdown-парсеры используют тег 'br' для переноса
      const brElement = element.nextElementSibling
      const hasCaption = brElement?.tagName.toLowerCase() === 'br'

      if (!hasCaption) {
        return
      }

      const fragments = []

      let sibling = brElement.nextSibling
      while (sibling) {
        fragments.push(sibling)
        sibling = sibling.nextSibling
      }

      const figure = window.document.createElement('figure')
      brElement.remove()
      figure.innerHTML = element.outerHTML

      const figCaption = window.document.createElement('figcaption')
      figCaption.innerHTML = fragments
        .map((fragment) => (fragment.nodeType === Node.TEXT_NODE ? fragment.textContent : fragment.outerHTML))
        .join('')

      figure.appendChild(figCaption)
      element.replaceWith(figure)
    })

  articleContent.querySelectorAll('figure').forEach((figureElement) => {
    figureElement.classList.add('figure')
    figureElement.querySelector('figcaption')?.classList.add('figure__caption')
    figureElement.firstElementChild?.classList.add('figure__content')
  })

  // достаём изображения из параграфов
  articleContent.querySelectorAll('p > figure, p > picture, p > img').forEach((element) => {
    element.parentElement.replaceWith(element)
  })
}
