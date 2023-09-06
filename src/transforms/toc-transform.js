const HeadingHierarchy = require('../libs/heading-hierarchy/heading-hierarchy')
const roles = require('../libs/role-constructor/collection.json')

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
  const headings = Array.from(
    articleContent.querySelectorAll(
      'h2, h3, h4, h5, h6, #questions > div.questions__list > div.question__request > aside > div > p:first-of-type'
    )
  )
    // не учитываем заголовки, которые лежат внутри тегов details, внутри советов и внутри ответов
    .filter((title) => !title.closest('details, .practices__content, .question__response'))
    // исключаем роль из заголовка
    .map((title) => {
      for (let i = 0; i < Object.keys(roles).length; i++) {
        const role = roles[Object.keys(roles)[i]].title
        if (title.textContent.includes(role)) {
          const titleWithoutRole = title.cloneNode(true)
          titleWithoutRole.textContent = titleWithoutRole.textContent.replace(role, '')
          return titleWithoutRole
        }
      }
      return title
    })

  const hierarchy = HeadingHierarchy.createHierarchy(headings)
  articleNavContent.innerHTML = HeadingHierarchy.render(hierarchy)
}
