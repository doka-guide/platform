/**
 * @param {Window} window
 */
module.exports = function (window) {
  window.document
    .querySelector('.content')
    ?.querySelectorAll('a')
    ?.forEach((link) => {
      link.classList.add('link')
    })
}
