// Преобразования содержимого тега title документа

/**
 *
 * @param {Window} window
 */
module.exports = function(window) {
  const { document } = window
  document.title = document.title.replace(/`/g, '')
}
