const MarkdownIt = require('markdown-it')
const md = new MarkdownIt()

// Помещаем видео с подписями внутрь figure
/**
 *
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  Array.from(articleContent.querySelectorAll('video'))
    .filter((element) => !element.matches('figure video'))
    .forEach((element) => {
      const caption = element.nextSibling
      const hasCaption = caption?.nodeName === '#text' && caption.nodeValue.trim() !== ''

      if (!hasCaption) {
        return
      }

      let result = md.render(caption.toString().trim())

      const figure = window.document.createElement('figure')
      figure.innerHTML = element.outerHTML

      if (hasCaption) {
        const figCaption = window.document.createElement('figcaption')
        figCaption.innerHTML = result
        figure.appendChild(figCaption)
        caption.remove()
      }

      element.replaceWith(figure)
    })

  articleContent.querySelectorAll('figure').forEach((figureElement) => {
    figureElement.classList.add('figure')
    figureElement.querySelector('figcaption')?.classList.add('figure__caption')
    figureElement.firstElementChild?.classList.add('figure__content')
  })
}
