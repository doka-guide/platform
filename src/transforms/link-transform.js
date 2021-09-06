/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  DOM.document
    .querySelector('.content')
    ?.querySelectorAll('a')
    ?.forEach(link => {
      link.classList.add('link')
    })
}
