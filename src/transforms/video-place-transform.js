const { Node } = require('linkedom')
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
      let caption = element.nextSibling
      const hasCaption = caption?.nodeType === Node.TEXT_NODE && caption.nodeValue.trim() !== ''

      if (!hasCaption) {
        return
      }

      const captionChunks = []
      let shouldStop = false
      while (!shouldStop) {
        // подпись у видео содержит перенос строки "\n" в начале и конце
        shouldStop = caption.textContent.endsWith('\n')
        captionChunks.push(caption)
        caption = caption.nextSibling
      }

      let result = md.render(
        captionChunks
          .map((chunk) => {
            chunk.remove()
            return chunk.nodeType === Node.TEXT_NODE ? chunk.textContent : chunk.outerHTML
          })
          .join('')
          .trim()
      )

      const figure = window.document.createElement('figure')
      figure.innerHTML = element.outerHTML

      if (hasCaption) {
        const figCaption = window.document.createElement('figcaption')
        figCaption.innerHTML = result
        figure.appendChild(figCaption)
      }

      element.replaceWith(figure)
    })

  articleContent.querySelectorAll('figure').forEach((figureElement) => {
    figureElement.classList.add('figure')
    figureElement.querySelector('figcaption')?.classList.add('figure__caption')
    figureElement.firstElementChild?.classList.add('figure__content')
  })
}
