// расстановка классов и атрибутов для элементов кода внутри тела статьи
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  articleContent?.querySelectorAll('p code, ul code, ol code, table code')?.forEach((codeElement) => {
    codeElement.classList.add('inline-code', 'code-fix', 'font-theme', 'font-theme--code')
  })
}
