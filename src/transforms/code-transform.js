const os = require('os')
const hljs = require('highlight.js/lib/common')

function renderLine(line) {
  return `<span class="code-block__line"><span class="code-block__line-number"></span><span class="code-block__line-content">${line}</span></span>`
}

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  DOM.document.querySelector('.article__content')
    ?.querySelectorAll('pre[data-lang] > code')
    ?.forEach(codeBlock => {
      let language = codeBlock.parentNode.getAttribute('data-lang').trim()

      if (language === 'js') {
        language = 'javascript'
      }

      if (language) {
        const lines = hljs.highlight(codeBlock.textContent, { language }).value
          .split(os.EOL)
          // удаляем первую и последнюю пустые строки
          .filter((line, index, linesArray) => {
            const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
            const isEmptyLine = line.trim() === ''
            return !(isFirtsOrLastLine && isEmptyLine)
          })
          .map((line) => renderLine(line))
          .join(os.EOL)

        codeBlock.innerHTML = lines
      }

      codeBlock.parentNode.classList.add('code-block font-theme font-theme--code')
      codeBlock.parentNode.setAttribute('tabindex', 0)
      codeBlock.classList.add('code-block__content')
    })
}
