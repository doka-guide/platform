function breakify(content) {
  const symbols = ['.', ',', '-', '_', '=', ':', '~', '/', '\\', '?', '#', '%', '(', ')', '[', ']']

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
