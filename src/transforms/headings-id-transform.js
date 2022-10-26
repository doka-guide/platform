const { slugify } = require('transliteration')

// генерация id для заголовков
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const content = window.document.querySelector('.content')

  if (content) {
    let headings = content.querySelectorAll(
      'h2, h3, h4, h5, h6, #questions > div.questions__list > div.question__request > aside > div > p:first-of-type'
    )

    const headingHashMap = {}

    for (const heading of headings) {
      const headingText = heading.textContent.trim()
      const id = slugify(headingText)

      if (headingHashMap[id] >= 0) {
        headingHashMap[id] += 1
      } else {
        headingHashMap[id] = 0
      }
      const headingIdPostfix = headingHashMap[id] > 0 ? `-${headingHashMap[id]}` : ''

      heading.setAttribute('id', slugify(headingText) + headingIdPostfix)
    }
  }
}
