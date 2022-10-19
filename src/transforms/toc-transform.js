const HeadingHierarchy = require('../libs/heading-hierarchy/heading-hierarchy')

// генерация оглавления
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  const articleNavContent = window.document.querySelector('.article-nav__content')
  const headings = Array.from(articleContent.querySelectorAll('h2, h3, h4, h5, h6'))
    // не учитываем заголовки, которые лежат внутри тегов details и внутри советов
    .filter((title) => !title.closest('details, .practices__content, .answer__content'))

  const hierarchy = HeadingHierarchy.createHierarchy(headings)
  articleNavContent.innerHTML = HeadingHierarchy.render(hierarchy)
}
