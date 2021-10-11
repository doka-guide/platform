const Prism = require('prismjs')
const loadLanguages = require('prismjs/components/')
const { escape } = require('html-escaper')

loadLanguages()

const endOfLine = '\n'

const LANG_ALIASES= {
  'js': 'javascript',
  'nginxconf': 'nginx'
}

function renderOriginalLine(line) {
  return `<span class="code-block__original-line">${escape(line)}</span>`
}

function highlightCode(source, language) {
  return Prism.highlight(source, Prism.languages[language], language)
}

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк,
// расстановка классов на инлайновые блоки с кодом
/**
 * @param {Window} window
 */
module.exports = function(window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  articleContent
    ?.querySelectorAll('pre[data-lang]')
    ?.forEach(preElement => {
      const codeElement = preElement.querySelector('code')

      let language = preElement.getAttribute('data-lang').trim()
      language = LANG_ALIASES[language] || language

      const originalContent = codeElement.textContent
      const highlightedContent = language
        ? highlightCode(originalContent, language)
        : originalContent

      const lines = originalContent
        .split(endOfLine)
        .filter((line, index, linesArray) => {
          // удаляем первую и последнюю пустые строки
          const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
          const isEmptyLine = line.trim() === ''
          return !(isFirtsOrLastLine && isEmptyLine)
        })
        .map((line) => renderOriginalLine(line))

      const originalSplittedContent = lines.join('')

      const linesBlock = window.document.createElement('span')
      linesBlock.classList.add('code-block__lines')
      linesBlock.innerHTML = Array.from(
        { length: lines.length },
        () => `<span class="code-block__line"></span>`
      ).join('')

      preElement.classList.add('code-block', 'font-theme', 'font-theme--code')
      preElement.setAttribute('tabindex', 0)
      preElement.innerHTML = `
      ${linesBlock.outerHTML}
        <span class="code-block__original">${originalSplittedContent}</span>
        <code class="code-block__highlight">${highlightedContent}</code>
      `
    })

  articleContent
    ?.querySelectorAll('pre:not([data-lang])')
    ?.forEach(preElement => {
      preElement.classList.add('format-block', 'font-theme', 'font-theme--code')
      preElement.setAttribute('tabindex', 0)
    })

  articleContent
    ?.querySelectorAll('p code, ul code, ol code, table code')
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
