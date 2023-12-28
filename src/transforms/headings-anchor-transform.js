// генерация якорных ссылок на заголовки
/**
 * @param {Window} window
 */

function createButtonMarkup(id, headingText) {
  return `
    <button class="article-heading__copy-button" data-anchor="#${id}" aria-describedby="status-${id}">
      <svg class="article-heading__icon" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <span class="visually-hidden">Скопировать ссылку "${headingText.replace(/(<|>)/g, '')}"</span>
    </button>
  `
}

module.exports = function (window) {
  const content = window.document.querySelector('.content')
  const subscription = window.document.querySelector('.subscribe-page')

  if (content && !subscription) {
    let headings = content.querySelectorAll(
      'h2, h3, h4, h5, h6, #questions > div.questions__list > div.question__request > aside > div > p:first-of-type'
    )

    for (const heading of headings) {
      const clonedHeading = heading.cloneNode(true)

      const headingText = heading.textContent.trim()
      const level = heading.tagName.slice(1)
      const id = clonedHeading.getAttribute('id')

      clonedHeading.classList.add('article-heading__title')
      clonedHeading.removeAttribute('id')

      const copier = window.document.createElement('span')
      const buttonHTML = createButtonMarkup(id, headingText)
      const statusHTML = `<span role="status" id="status-${id}" class="article-heading__status">Скопировано</span>`
      const space = window.document.createTextNode(' ')

      copier.innerHTML = buttonHTML + statusHTML
      copier.classList.add('article-heading__copier')

      const headingWrapper = window.document.createElement('div')

      headingWrapper.setAttribute('tabindex', -1)
      headingWrapper.setAttribute('id', id)
      headingWrapper.classList.add('article-heading', 'article-heading--level-' + level)
      headingWrapper.innerHTML = clonedHeading.outerHTML + space + copier

      heading.replaceWith(headingWrapper)
    }
  }
}
