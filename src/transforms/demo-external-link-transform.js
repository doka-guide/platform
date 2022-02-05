// добавляет ссылки для открытия демок в новом окне
/**
 *
 * @param {Window} window
 * @param {string | null} content
 * @param {string} outputPath
 */
module.exports = function (window, content, outputPath) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  const iframes = articleContent.querySelectorAll('iframe')

  const baseSourcePath = outputPath.replace('dist/', '').replace('/index.html', '')

  Array.from(iframes)
    .filter((iframe) => iframe.getAttribute('src').includes('demos/'))
    .forEach((iframe) => {
      const iframeSourceLink = iframe.getAttribute('src').replace('./', '')
      const wrapper = window.document.createElement('figure')
      wrapper.classList.add('figure')
      iframe.classList.add('figure__content')
      wrapper.innerHTML = `
        ${iframe.outerHTML}
        <figcaption class="figure__caption">
          <a class="link" href="/${baseSourcePath}/${iframeSourceLink}" target="_blank" rel="nofollow noopener noreferrer">
            Открыть демо в новой вкладке
          </a>
        </figcaption>
      `
      iframe.replaceWith(wrapper)
    })
}
