const { slugify } = require('transliteration')
const HeadingHierarchy = require('../libs/heading-hierarchy/heading-hierarchy')

// генерация id для заголовков и ссылок на них
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  const articleContent = DOM.document.querySelector('.article__content')

  if (articleContent) {
    let headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

    for (const heading of headings) {
      const clonedHeading = heading.cloneNode(true)
      const headingText = heading.textContent.trim()
      const id = slugify(headingText)
      clonedHeading.setAttribute('id', slugify(headingText))
      clonedHeading.setAttribute('tabindex', -1)
      clonedHeading.classList.add('article-heading__title')

      const headingWrapper = DOM.document.createElement('div')
      headingWrapper.classList.add('article-heading')
      headingWrapper.innerHTML = `
        ${clonedHeading.outerHTML}
        <a class="article-heading__link" href="#${id}">
          <svg class="article-heading__icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="visually-hidden">Секция статьи "${headingText}"</span>
        </a>
      `

      heading.replaceWith(headingWrapper)
    }

    // генерация оглавления
    const articleNavContent = DOM.document.querySelector('.article-nav__content')
    // обновлённые заголовки
    headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

    const hierarchy = HeadingHierarchy.createHierarchy(Array.from(headings))
    articleNavContent.innerHTML = HeadingHierarchy.render(hierarchy)
  }
}
