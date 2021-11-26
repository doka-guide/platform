// Добавляем класс темы для изображений
// с хэшем #gh-light-mode-only или #gh-dark-mode-only
/**
 * @param {Window} window
 */
module.exports = function(window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  Array.from(articleContent.querySelectorAll('img'))
    .forEach(image => {
      const splittedLink = image.src.split('#')
      const imageSrc = splittedLink[0]
      const imageHash = splittedLink.slice(1).join('#')

      image.src = imageSrc

      switch (imageHash) {
        case 'gh-light-mode-only':
          image.classList.add('light-mode-only')
          break

        case 'gh-dark-mode-only':
          image.classList.add('dark-mode-only')
          break
      }
    })
}
