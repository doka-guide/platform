const os = require('os')
const hljs = require('highlight.js')

function renderLine(line) {
  return `<tr class="code-block__line"><th class="code-block__line-number"></th><td class="code-block__line-content">${line}</td></tr>`
}

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк,
// расстановка классов на инлайновые блоки с кодом
/**
 * @param {Window} window
 */
module.exports = function(window) {
  const articleContent = window.document.querySelector('.article__content')

  articleContent
    ?.querySelectorAll('pre[data-lang]')
    ?.forEach(preElement => {
      const codeElement = preElement.querySelector('code')

      let language = preElement.getAttribute('data-lang').trim()

      if (language === 'js') {
        language = 'javascript'
      }

      const content = language
        ? hljs.highlight(codeElement.textContent, { language }).value
        : codeElement.textContent

      const lines = content
        .split(os.EOL)
        .filter((line, index, linesArray) => {
          // удаляем первую и последнюю пустые строки
          const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
          const isEmptyLine = line.trim() === ''
          return !(isFirtsOrLastLine && isEmptyLine)
        })
        .map((line) => renderLine(line))
        .join(os.EOL)

      const wrapper = window.document.createElement('div')
      wrapper.setAttribute('tabindex', 0)
      wrapper.classList.add('code-block', 'font-theme', 'font-theme--code')
      wrapper.innerHTML = `<table class="code-block__content" aria-hidden="true"><tbody>${lines}</tbody></table>`

      preElement.classList.add('code-block__origin', 'visually-hidden')
      const clonedCodeElement = preElement.cloneNode(true)
      wrapper.appendChild(clonedCodeElement)

      preElement.replaceWith(wrapper)
    })

  articleContent
    ?.querySelectorAll('pre:not([data-lang])')
    ?.forEach(preElement => {
      preElement.classList.add('format-block', 'font-theme', 'font-theme--code')
      preElement.setAttribute('tabindex', 0)
    })

  articleContent
    ?.querySelectorAll('p code, ul code, ol code')
    ?.forEach(codeElement => {
      codeElement.classList.add('code', 'font-theme', 'font-theme--code')
    })

  // добавление классов на блоки `code` внутри заголовков
  {
    const classMap = {
      'articles-group__link': 'articles-group__code',
      'articles-group__title': 'articles-group__code',
      'article__title': 'article__title-code',
      'featured-article__link': 'featured-article__code',
      'index-group-list__link': 'index-group-list__code',
      'header__title': 'header__title-code',
    }

    for (const [parentClass, codeClass] of Object.entries(classMap)) {
      window.document.querySelectorAll(`.${parentClass}`)
        .forEach(parentElement => {
          const codeElement = parentElement.querySelectorAll('code')
          codeElement.forEach(element => {
            if (element) {
              element.classList.add(codeClass, 'font-theme', 'font-theme--code')
            }
          })
        })
    }
  }

}
