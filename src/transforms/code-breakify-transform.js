function breakify(content) {
  const symbols = ['.', ',', '-', '_', '=', ':', '~', '/', '\\', '?', '#', '%', '(', ')', '[', ']']

  for (const symbol of symbols) {
    content = content.replaceAll(symbol, (match) => `<wbr>${match}<wbr>`)
  }

  return content
}

/**
 * расстановка <wbr> в элементах кода
 * @param {Window} window
 */
module.exports = function (window) {
  const inlineCodeElements = window.document.querySelectorAll('.code-fix')

  for (const codeElement of inlineCodeElements) {
    codeElement.innerHTML = breakify(codeElement.innerHTML)
  }
}
