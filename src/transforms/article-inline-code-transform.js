// расстановка классов и атрибутов для элементов кода внутри тела статьи
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  articleContent?.querySelectorAll('p code, ul code, ol code, table code, figcaption code')?.forEach((codeElement) => {
    // Блок кода с отступом внутри пункта списка тоже попадает под `ul code`.
    // С классом `code-fix` строки блока схлопываются в одну, а breakify ломает подсветку.
    if (codeElement.closest('pre')) {
      return
    }

    codeElement.classList.add('inline-code', 'code-fix', 'font-theme', 'font-theme--code')
  })
}
