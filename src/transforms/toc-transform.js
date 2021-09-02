const HeadingHierarchy = require('../libs/heading-hierarchy/heading-hierarchy')

// генерация оглавления
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
   const articleContent = DOM.document.querySelector('.article__content')

   if (!articleContent) {
     return
   }

   const articleNavContent = DOM.document.querySelector('.article-nav__content')
   const headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

   const hierarchy = HeadingHierarchy.createHierarchy(Array.from(headings))
   articleNavContent.innerHTML = HeadingHierarchy.render(hierarchy)
}
