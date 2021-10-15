const { slugify } = require('transliteration')

// генерация id для заголовков и ссылок на них
/**
 * @param {Window} window
 */
module.exports = function(window) {
  const content = window.document.querySelector('.content')

  if (content) {
    let headings = content.querySelectorAll('h2, h3, h4, h5, h6')

    const headingHashMap = {};

    for (const heading of headings) {
      const clonedHeading = heading.cloneNode(true)

      for (const codeElement of clonedHeading.querySelectorAll('code')) {
        codeElement.classList.add('article-heading__code', 'font-theme', 'font-theme--code')
      }

      const headingText = heading.textContent.trim()
      const level = heading.tagName.slice(1)
      const id = slugify(headingText)

      if (headingHashMap[id] >= 0) {
        headingHashMap[id] += 1;
      } else {
        headingHashMap[id] = 0;
      }
      const headingIdPostfix = headingHashMap[id] > 0 ? `-${headingHashMap[id]}` : ''

      clonedHeading.setAttribute('id', slugify(headingText) + headingIdPostfix)
      clonedHeading.setAttribute('tabindex', -1)
      clonedHeading.classList.add('article-heading__title')

      const headingWrapper = window.document.createElement('div')
      headingWrapper.classList.add('article-heading', 'article-heading--level-' + level)
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
  }
}
