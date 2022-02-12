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
module.exports = function (window) {
  window.document
    .querySelector('.article__content-inner')
    ?.querySelectorAll('aside:not([class])')
    ?.forEach((asideElement) => {
      let icon
      let textContent = asideElement.textContent.trim()
      let innerHTML = asideElement.innerHTML

      const emojiRegExp = emojiRegex()
      const firstEmojiSymbol = textContent.match(emojiRegExp)?.[0]

      if (textContent.startsWith(firstEmojiSymbol)) {
        icon = firstEmojiSymbol
        innerHTML = innerHTML.replace(emojiRegExp, '')
      }

      const tempElement = window.document.createElement('div')
      tempElement.innerHTML = calloutTemplate(icon, innerHTML)
      asideElement.replaceWith(tempElement.firstElementChild)
    })
}
