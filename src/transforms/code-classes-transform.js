// расстановка классов на инлайновые блоки с кодом
/**
 * @param {Window} window
 */
module.exports = function (window) {
  // добавление классов на блоки `code` внутри заголовков
  {
    const classMap = {
      'articles-group__link': 'articles-group__code',
      'articles-group__title': 'articles-group__code',
      article__title: 'article__title-code',
      'social-card__title': 'social-card__title-code',
      'featured-article': 'featured-article__code',
      'index-group-list__link': 'index-group-list__code',
      header__title: 'header__title-code',
      article__description: 'article__description-code',
      'article-heading': 'article-heading__code',
      figure__caption: 'figure__caption-code',
      'linked-article': 'linked-article__code',
    }

    for (const [parentClass, codeClass] of Object.entries(classMap)) {
      window.document.querySelectorAll(`.${parentClass}`).forEach((parentElement) => {
        parentElement.querySelectorAll('code').forEach((codeElement) => {
          codeElement.classList.add(codeClass, 'code-fix', 'font-theme', 'font-theme--code')
        })
      })
    }
  }
}
