function breakify(content) {
  const symbols = ['.', ',', '-', '_', '=', ':', '~', '/', '\\', '?', '#', '%', '(', ')', '[', ']']

  // Расстановка переносов между частями слова
  if (/[A-Z]/g.test(content)) {
    switch (true) {
      case /^[^A-Z]/.test(content):
        content = content.replaceAll(/[A-Z]/g, (match) => `<wbr>${match}`)
        break
      case /[A-Z]{2,}/.test(content):
        content = content.replaceAll(/[A-Z][a-z]+/g, (match) => `<wbr>${match}`)
        break
      case /[A-Z][a-z.]+[A-Z][a-z()]+/.test(content):
        content = content.replaceAll(/[A-Z][a-z()]+$/g, (match) => `<wbr>${match}`)
        break
      default:
        break
    }
  }

  // Расстановка переносов по спецсимволам
  for (const symbol of symbols) {
    const firstSymbolWithinTags = new RegExp(`^(<wbr>)[\\${symbol}](<wbr>)`, '')

    content = content.replaceAll(symbol, `<wbr>${symbol}<wbr>`)

    // Исключение для переносов первого спецсимвола в слове
    if (firstSymbolWithinTags.test(content)) {
      content = content.replace(firstSymbolWithinTags, `${symbol}`)
    }
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
