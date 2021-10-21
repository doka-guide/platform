const emojiRegex = require('emoji-regex')

const calloutTemplate = (icon, content) => `
  <aside class="callout">
    ${icon ? `<div class="callout__icon">${icon}</div>` : ''}
    <div class="callout__content">${content}</div>
  </aside>
`

/**
 * @param {Window} window
 */
module.exports = function(window) {
  window.document
    .querySelector('.article__content-inner')
    ?.querySelectorAll('aside:not([class])')
    ?.forEach(asideElement => {
      let icon
      let textContent = asideElement.textContent.trim()
      let innerHTML = asideElement.innerHTML

      // используется итератор, так как textContent[0] иногда возвращает "битый" emojii
      const firstSymbol = textContent[Symbol.iterator]().next().value
      const firstLetterIsEmoji = emojiRegex().test(firstSymbol)

      if (firstLetterIsEmoji) {
        icon = firstSymbol
        innerHTML = innerHTML.replace(icon, '')
      }

      const tempElement = window.document.createElement('div')
      tempElement.innerHTML = calloutTemplate(icon, innerHTML)
      asideElement.replaceWith(tempElement.firstElementChild)
    })
}
