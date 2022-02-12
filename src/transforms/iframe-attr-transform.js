const attrs = {
  loading: 'lazy',
}

// Добавляет атрибуты к iframe, если их нет
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const iframes = window.document.querySelector('.content')?.querySelectorAll('iframe')

  iframes?.forEach((iframe) => {
    for (const [attributeName, attributeValue] of Object.entries(attrs)) {
      if (!iframe.hasAttribute(attributeName)) {
        iframe.setAttribute(attributeName, attributeValue)
      }
    }
  })
}
