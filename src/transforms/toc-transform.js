const HeadingHierarchy = require('../libs/heading-hierarchy/heading-hierarchy')

// генерация оглавления
/**
 * @param {Window} window
 */
module.exports = function(window) {
   const articleContent = window.document.querySelector('.article__content-inner')

   if (!articleContent) {
     return
   }

   const articleNavContent = window.document.querySelector('.article-nav__content')
   const headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

   const hierarchy = HeadingHierarchy.createHierarchy(Array.from(headings))
   const tempElement = window.document.createElement('div')
   tempElement.innerHTML = HeadingHierarchy.render(hierarchy)
   articleNavContent.appendChild(tempElement.firstElementChild)
}
