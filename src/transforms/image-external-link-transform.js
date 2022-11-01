// Добавляет ссылки для открытия картинок в новом окне
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  if (!articleContent) {
    return
  }

  const allPictures = articleContent.querySelectorAll('picture:not([class]), picture.figure__picture')
  const articlePictures = Array.from(allPictures)
    // Фильтр от демок с тегами picture внутри
    .filter((element) => !element.matches('body:not([class="base__body"]) picture'))

  if (articlePictures.length === 0) {
    return
  }

  articlePictures.forEach((picture) => {
    // Атрибут href для ссылки проставляется внутри файла image-external-links.js
    const imageLinkTemplate = `
    <figcaption class="figure__caption">
      <a class="link" href target="_blank" rel="nofollow noopener noreferrer">
        Открыть картинку в новой вкладке
      </a>
    </figcaption>
    `
    try {
      if (picture.hasAttribute('class')) {
        // Если картинка уже внутри figure, то добавляем ещё один figcaption со ссылкой для открытия в новом окне
        const figure = picture.parentNode
        const imageFigcaption = figure.lastElementChild.outerHTML

        figure.innerHTML = `
        ${picture.outerHTML}
        ${imageLinkTemplate}
        ${imageFigcaption}
        `
      } else {
        // Если картинка не внутри figure, то оборачиваем в figure и добавляем figcaption со ссылкой для открытия в новом окне
        const figure = window.document.createElement('figure')

        figure.classList.add('figure')
        picture.classList.add('figure__picture')
        figure.innerHTML = `
          ${picture.outerHTML}
          ${imageLinkTemplate}
          `
        picture.replaceWith(figure)
      }
    } catch (error) {
      console.log(`Ошибка добавления ссылок для открытия картинок в новом окне: ${error}`)
    }
  })
}
