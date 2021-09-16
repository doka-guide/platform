const os = require('os')
const hljs = require('highlight.js')

function renderLine(line) {
  // добавляет возможность копировать пустые строки
  line = line ? line : '\n'
  return `<code class="code-block__line">${line}</code>`
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

      let lines = content
        .split(os.EOL)
        .filter((line, index, linesArray) => {
          // удаляем первую и последнюю пустые строки
          const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
          const isEmptyLine = line.trim() === ''
          return !(isFirtsOrLastLine && isEmptyLine)
        })
        .map((line) => renderLine(line))

      const digits = String(lines.length).length

      lines = lines.join(os.EOL)

      preElement.classList.add('code-block', 'font-theme', 'font-theme--code')
      preElement.setAttribute('tabindex', 0)
      preElement.setAttribute('style', `--digits: ${digits}`)
      preElement.innerHTML = lines
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
          parentElement.querySelectorAll('code').forEach(codeElement => {
            codeElement.classList.add(codeClass, 'font-theme', 'font-theme--code')
          })
        })
    }
  }

}
