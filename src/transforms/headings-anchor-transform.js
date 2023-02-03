// генерация якорных ссылок на заголовки
/**
 * @param {Window} window
 */

function createButtonMarkup(id, headingText) {
  return `
    <button class="article-heading__copy-button" data-anchor="#${id}" aria-describedby="status">
      <span class="visually-hidden">Секция статьи "${headingText.replace(/(<|>)/g, '')}"</span>
    </button>
  `
}

module.exports = function (window) {
  const content = window.document.querySelector('.content')

  if (content) {
    let headings = content.querySelectorAll(
      'h2, h3, h4, h5, h6, #questions > div.questions__list > div.question__request > aside > div > p:first-of-type'
    )

    for (const heading of headings) {
      const clonedHeading = heading.cloneNode(true)

      const headingText = heading.textContent.trim()
      const level = heading.tagName.slice(1)
      const id = clonedHeading.getAttribute('id')

      const buttonHTML = createButtonMarkup(id, headingText)
      const statusHTML = '<span id="status" class="article-heading__status" role="status">Скопировано</span>'

      clonedHeading.classList.add('article-heading__title')
      clonedHeading.removeAttribute('id')

      const copierWrapper = window.document.createElement('span')

      copierWrapper.classList.add('article-heading__copier')
      copierWrapper.innerHTML = buttonHTML + statusHTML

      const headingWrapper = window.document.createElement('div')

      headingWrapper.setAttribute('tabindex', -1)
      headingWrapper.setAttribute('id', id)
      headingWrapper.classList.add('article-heading', 'article-heading--level-' + level)
      headingWrapper.innerHTML = clonedHeading.outerHTML + copierWrapper

      heading.replaceWith(headingWrapper)
    }
  }
}
