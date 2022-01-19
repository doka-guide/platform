// расстановка <wbr> в элементах кода и ссылках
function breakify(content) {
  const symbols = [
    '.',
    ',',
    '-',
    '_',
    '=',
    ';',
    ':',
    '~',
    '/',
    '\\',
    '?',
    '#',
    '%',
    '(',
    ')',
    '<',
    '>',
    '&',
  ]

  // сначала делим по `//`, чтобы точно отделить от совпадений с `/`
  const doubleSlashSegments = content.split('//')

  const formattedSegments = doubleSlashSegments
    .map(segment => {
      for (const symbol of symbols) {
        segment = segment.replaceAll(symbol, match => `<wbr>${match}<wbr>`)
      }

      return segment
    })

  return formattedSegments.join('//<wbr>')
}

/**
 * @param {Window} window
 */
module.exports = function(window) {
  const inlineCodeElements = window.document.querySelectorAll('.code-fix')

  for (const codeElement of inlineCodeElements) {
    codeElement.innerHTML = breakify(codeElement.innerHTML)
  }
}
